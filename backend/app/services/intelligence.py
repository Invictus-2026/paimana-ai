"""Evidence-based calculations. No invented observations or fitted-model claims."""
import math
from collections import Counter

BOMS = {
    'road': {'steel': .10, 'cement': .10, 'bitumen': .40, 'diesel': .25},
    'rail': {'steel': .35, 'cement': .20, 'bitumen': .02, 'diesel': .15},
    'power': {'steel': .30, 'cement': .20, 'bitumen': .00, 'diesel': .10},
    'default': {'steel': .20, 'cement': .20, 'bitumen': .10, 'diesel': .15},
}

def stress(budget, sector, shocks, remaining, rain_days, productivity_loss):
    category = next((k for k in BOMS if k != 'default' and k in (sector or '').lower()), 'default')
    weights = BOMS[category]
    components = {k: budget * remaining * w * shocks.get(k, 0) / 100 for k, w in weights.items()}
    return {'cost_increase_cr': round(sum(components.values()), 4), 'components_cr': components,
            'schedule_buffer_days': round(rain_days * productivity_loss, 2), 'bom_weights': weights,
            'assumption': 'Illustrative sector BOM applied to remaining budget; not an exact liability or trained forecast.'}

def conformal(prediction, pairs, coverage=.9):
    errors = sorted(abs(p['actual'] - p['predicted']) for p in pairs)
    rank = math.ceil((len(errors) + 1) * coverage)
    if rank > len(errors):
        raise ValueError('At least 9 independent calibration outcomes are required for finite 90% bounds.')
    radius = errors[rank - 1]
    return {'lower': max(0, prediction - radius), 'point': prediction, 'upper': prediction + radius,
            'coverage': coverage, 'calibration_count': len(errors), 'radius': radius,
            'method': 'split conformal absolute residuals',
            'limitation': 'Marginal coverage requires exchangeable held-out outcomes from the same model; not a guarantee for one project.'}

def kaplan_meier(observations):
    at_risk = len(observations)
    survival = 1.0
    curve = [{'day': 0, 'survival': 1.0, 'completion_probability': 0.0, 'at_risk': at_risk}]
    events = Counter(o['duration_days'] for o in observations if o['completed'])
    censored = Counter(o['duration_days'] for o in observations if not o['completed'])
    for day in sorted(set(events) | set(censored)):
        survival *= 1 - events[day] / at_risk
        curve.append({'day': day, 'survival': survival, 'completion_probability': 1-survival, 'at_risk': at_risk})
        at_risk -= events[day] + censored[day]
    return curve

def point_in_polygon(lon, lat, ring):
    inside = False
    for a, b in zip(ring, ring[1:] + ring[:1]):
        ax, ay = a; bx, by = b
        cross = (lon-ax)*(by-ay) - (lat-ay)*(bx-ax)
        if abs(cross) < 1e-10 and min(ax,bx) <= lon <= max(ax,bx) and min(ay,by) <= lat <= max(ay,by):
            return True
        if (ay > lat) != (by > lat) and lon < (bx-ax)*(lat-ay)/(by-ay)+ax:
            inside = not inside
    return inside

def satellite_change(before, after, claimed):
    def index(a, b):
        return (a-b)/(a+b) if a+b > 0 else None
    ndvi = [index(v['nir'], v['red']) for v in (before, after)]
    ndbi = [index(v['swir'], v['nir']) for v in (before, after)]
    delta = None if None in ndbi else ndbi[1]-ndbi[0]
    usable = max(before['cloud_pct'], after['cloud_pct']) <= 20 and delta is not None
    sar = None if before.get('sar_db') is None or after.get('sar_db') is None else after['sar_db']-before['sar_db']
    return {'ndvi': ndvi, 'ndbi': ndbi, 'ndbi_delta': delta, 'sar_delta_db': sar,
            'status': 'inconclusive' if not usable else ('review_required' if claimed >= 15 and delta < .02 else 'no_threshold_breach'),
            'limitation': 'Spectral change is not physical completion or evidence of fraud. Review co-registration, seasonality, sensor and cloud masks.'}

def escalation_tier(project, predictions):
    """Two deteriorating month-to-month transitions require three comparable months."""
    exposure=project.budget*max(project.cost_overrun_pct,0)/100
    ordered=sorted(predictions,key=lambda p:p.prediction_timestamp,reverse=True)
    if exposure>500 or (ordered and ordered[0].predicted_delay_days>180):
        return 3,'Recorded exposure exceeds INR 500 crore or predicted delay exceeds 180 days'
    months={}
    for prediction in ordered:
        stamp=prediction.prediction_timestamp
        months.setdefault(stamp.year*12+stamp.month,prediction)
    recent=sorted(months,reverse=True)[:3]
    if len(recent)==3 and recent[0]-recent[1]==recent[1]-recent[2]==1:
        ps=[months[m] for m in recent]
        if len({p.model_version for p in ps})==1 and ps[0].overall_risk_score>ps[1].overall_risk_score>ps[2].overall_risk_score:
            return 2,'Risk deteriorated in two consecutive monthly transitions using the same model version'
    return 1,'Project-level evidence review; higher-tier thresholds are not supported by current observations'
