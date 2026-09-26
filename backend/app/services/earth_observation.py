"""Read bounded, cloud-masked optical pixels from trusted STAC COG assets."""
import base64
import io
from urllib.parse import quote, urlparse
import httpx
import numpy as np

CATALOG='https://planetarycomputer.microsoft.com/api/stac/v1'

def load_scene(collection, scene_id, bbox):
    import rasterio
    from rasterio.vrt import WarpedVRT
    from rasterio.transform import from_bounds
    from rasterio.enums import Resampling
    r=httpx.get(f'{CATALOG}/collections/{collection}/items/{quote(scene_id,safe="")}',timeout=30)
    r.raise_for_status(); item=r.json()
    if item.get('collection')!=collection:raise ValueError('Unexpected scene collection')
    s2=collection=='sentinel-2-l2a'
    mapping={'red':'B04','green':'B03','blue':'B02','nir':'B08','swir':'B11','quality':'SCL'} if s2 else {'red':'red','green':'green','blue':'blue','nir':'nir08','swir':'swir16','quality':'qa_pixel'}
    arrays={};valid=np.ones((256,256),dtype=bool)
    for key,asset_name in mapping.items():
        asset=item['assets'][asset_name];url=asset['href'];parsed=urlparse(url)
        if parsed.scheme!='https' or not (parsed.hostname or '').endswith('.blob.core.windows.net'):
            raise ValueError('Scene asset is not on approved Azure storage')
        signed=httpx.get('https://planetarycomputer.microsoft.com/api/sas/v1/sign',params={'href':url},timeout=20)
        signed.raise_for_status();href=signed.json()['href']
        with rasterio.Env(GDAL_DISABLE_READDIR_ON_OPEN='EMPTY_DIR',GDAL_HTTP_TIMEOUT='30',GDAL_HTTP_MAX_RETRY='1'):
            with rasterio.open(href) as src:
                with WarpedVRT(src,crs='EPSG:4326',transform=from_bounds(*bbox,256,256),width=256,height=256,
                    resampling=Resampling.nearest if key=='quality' else Resampling.bilinear) as vrt:
                    data=vrt.read(1,masked=True)
                    valid &= ~np.ma.getmaskarray(data)
                    array=np.asarray(data.filled(0),dtype=float)
        if key!='quality':
            metadata=asset.get('raster:bands',[{}])[0]
            if 'scale' not in metadata:
                # Copernicus L2A DN scaling; PB >= 04.00 introduces -1000 DN offset.
                # PC keeps the original processing baseline in item metadata.
                baseline = item['properties'].get('s2:processing_baseline')
                if s2 and baseline is not None:
                    metadata = {'scale': .0001, 'offset': -.1 if float(baseline)>=4 else 0}
                else:
                    raise ValueError('Scene lacks reflectance calibration metadata')
            array=array*metadata['scale']+metadata.get('offset',0)
            valid &= np.isfinite(array)
        arrays[key]=array
    quality=arrays['quality'].astype('uint16')
    clear=np.isin(quality,[4,5,6,7]) if s2 else (quality & 63)==0
    valid &= clear
    return {'scene_id':scene_id,'date':item['properties']['datetime'][:10],
            'sensor':'Sentinel-2' if s2 else ('Landsat-9' if 'landsat-9' in item['properties'].get('platform','') else 'Landsat-8'),
            'arrays':arrays,'valid':valid,'source':f'{CATALOG}/collections/{collection}/items/{scene_id}'}

def compare_pixels(before, after, claimed):
    from PIL import Image
    valid=before['valid'] & after['valid']
    for scene in (before,after):
        a=scene['arrays'];valid &= (a['nir']+a['red']>0)&(a['swir']+a['nir']>0)
    count=int(valid.sum())
    if count<16:raise ValueError('Insufficient common clear pixels in the project area')
    observations=[];ndvis=[];ndbis=[]
    for scene in (before,after):
        a=scene['arrays']
        ndvi=float(np.mean((a['nir'][valid]-a['red'][valid])/(a['nir'][valid]+a['red'][valid])))
        ndbi=float(np.mean((a['swir'][valid]-a['nir'][valid])/(a['swir'][valid]+a['nir'][valid])))
        ndvis.append(ndvi);ndbis.append(ndbi)
        rgb=np.stack([a[k] for k in ('red','green','blue')],axis=-1)
        rgb=(np.clip(rgb/0.3,0,1)*255).astype('uint8');rgb[~valid]=[230,230,230]
        stream=io.BytesIO();Image.fromarray(rgb).save(stream,format='PNG')
        observations.append({'date':scene['date'],'scene_id':scene['scene_id'],'sensor':scene['sensor'],
            'red':float(a['red'][valid].mean()),'nir':float(a['nir'][valid].mean()),'swir':float(a['swir'][valid].mean()),
            'cloud_pct':round(100*(1-scene['valid'].mean()),2),'image_data':'data:image/png;base64,'+base64.b64encode(stream.getvalue()).decode()})
    fraction=float(valid.mean());delta=ndbis[1]-ndbis[0]
    return {'before':observations[0],'after':observations[1],'ndvi':ndvis,'ndbi':ndbis,'ndbi_delta':delta,'sar_delta_db':None,
            'common_clear_pixels':count,'common_clear_fraction':fraction,
            'status':'inconclusive' if fraction<.8 else ('review_required' if claimed>=15 and delta<.02 else 'no_threshold_breach'),
            'source':before['source']+' | '+after['source'],
            'limitation':'Mean pixel indices over a common cloud-masked 256x256 geographic grid. Grey pixels have no comparable data. Spectral change does not prove completion; independent engineering review is required.'}

def load_radar_scene(scene_id, polarization, bbox):
    """Use provider-processed RTC gamma-naught power; never treat raw GRD as RTC."""
    import os
    import rasterio
    from rasterio.vrt import WarpedVRT
    from rasterio.transform import from_bounds
    from rasterio.enums import Resampling
    key=os.getenv('PC_SDK_SUBSCRIPTION_KEY')
    if not key:raise ValueError('Configure PC_SDK_SUBSCRIPTION_KEY for Sentinel-1 RTC access')
    r=httpx.get(f'{CATALOG}/collections/sentinel-1-rtc/items/{quote(scene_id,safe="")}',timeout=30)
    r.raise_for_status();item=r.json()
    asset=item['assets'][polarization];url=asset['href'];parsed=urlparse(url)
    if parsed.scheme!='https' or not (parsed.hostname or '').endswith('.blob.core.windows.net'):
        raise ValueError('Radar asset is not on approved Azure storage')
    signed=httpx.get('https://planetarycomputer.microsoft.com/api/sas/v1/sign',params={'href':url},headers={'Ocp-Apim-Subscription-Key':key},timeout=20)
    signed.raise_for_status()
    with rasterio.Env(GDAL_DISABLE_READDIR_ON_OPEN='EMPTY_DIR',GDAL_HTTP_TIMEOUT='30',GDAL_HTTP_MAX_RETRY='1'):
        with rasterio.open(signed.json()['href']) as src:
            with WarpedVRT(src,crs='EPSG:4326',transform=from_bounds(*bbox,256,256),width=256,height=256,resampling=Resampling.bilinear) as vrt:
                data=vrt.read(1,masked=True)
    power=np.asarray(data.filled(0),dtype=float)
    valid=(~np.ma.getmaskarray(data)) & np.isfinite(power) & (power>0)
    props=item['properties']
    orbit={k:props.get(k) for k in ('sat:relative_orbit','sat:orbit_state','sar:instrument_mode')}
    if any(v is None for v in orbit.values()):raise ValueError('Radar scene lacks orbit comparability metadata')
    return {'scene_id':scene_id,'date':props['datetime'][:10],'orbit':orbit,'power':power,'valid':valid,'polarization':polarization,'source':f'{CATALOG}/collections/sentinel-1-rtc/items/{scene_id}'}

def compare_radar(before, after, polygon_mask, claimed):
    from PIL import Image
    if before['date']>=after['date'] or before['orbit']!=after['orbit'] or before['polarization']!=after['polarization']:
        raise ValueError('Radar comparison requires increasing dates, matching relative orbit/direction, mode and polarization')
    valid=before['valid'] & after['valid'] & polygon_mask
    count=int(valid.sum());total=int(polygon_mask.sum())
    if count<16:raise ValueError('Insufficient common valid radar pixels')
    means=[float(s['power'][valid].mean()) for s in (before,after)]
    db=[float(10*np.log10(v)) for v in means]
    delta_pct=100*(means[1]/means[0]-1)
    observations=[]
    for scene in (before,after):
        gray=np.zeros(scene['power'].shape,dtype='uint8')
        gray[valid]=(np.clip((10*np.log10(scene['power'][valid])+25)/25,0,1)*255).astype('uint8')
        stream=io.BytesIO();Image.fromarray(gray).save(stream,format='PNG')
        observations.append({'date':scene['date'],'scene_id':scene['scene_id'],'sensor':'Sentinel-1 RTC','image_data':'data:image/png;base64,'+base64.b64encode(stream.getvalue()).decode()})
    return {'before':observations[0],'after':observations[1],'ndvi':[None,None],'ndbi':[None,None],'ndbi_delta':None,
        'sar_delta_db':db[1]-db[0],'sar_mean_db':db,'sar_power_delta_pct':delta_pct,'common_clear_pixels':count,'common_clear_fraction':count/max(1,total),
        'status':'inconclusive' if count/max(1,total)<.8 else ('review_required' if claimed>=15 and abs(delta_pct)<2 else 'no_threshold_breach'),
        'polarization':before['polarization'],'orbit':before['orbit'],'source':before['source']+' | '+after['source'],
        'limitation':'Provider terrain-corrected gamma-naught power, common-grid regional means. Wet soil, speckle and acquisition geometry can dominate change. This is a review signal, not completion, elevation or fraud verification.'}
