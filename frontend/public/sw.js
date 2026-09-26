const CACHE='paimana-shell-v2';
self.addEventListener('install',event=>{event.waitUntil((async()=>{
 const cache=await caches.open(CACHE);
 const response=await fetch('/'); if(!response.ok)throw new Error('App shell unavailable');
 const html=await response.clone().text();await cache.put('/',response);
 const assets=[...html.matchAll(/(?:src|href)="(\/assets\/[^"\s]+)"/g)].map(match=>match[1]);
 await cache.addAll([...new Set([...assets,'/manifest.webmanifest','/paimana-icon.svg'])]);
})());self.skipWaiting();});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('paimana-shell-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',event=>{
 const url=new URL(event.request.url);
 if(event.request.method!=='GET'||url.origin!==self.location.origin||url.pathname.includes('/api/'))return;
 // Only public project directory metadata is persisted in the field client's local cache.
 if(event.request.mode==='navigate')event.respondWith(fetch(event.request).then(async r=>{if(r.ok)(await caches.open(CACHE)).put('/',r.clone());return r;}).catch(()=>caches.match('/')));
 else if(url.pathname.startsWith('/assets/')||url.pathname==='/paimana-icon.svg')event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request).then(async r=>{if(r.ok)(await caches.open(CACHE)).put(event.request,r.clone());return r;})));
});
