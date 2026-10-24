/* QA Salon: public static assets only; no private data, authentication or reservations cached. */
const CACHE="salon-qa-shell-v1";
const SHELL=["/offline.html","/manifest.webmanifest","/icon.svg","/icons/icon-192.png","/icons/icon-512.png"];
self.addEventListener("install",(e)=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting())));
self.addEventListener("activate",(e)=>e.waitUntil(Promise.all([caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith("salon-qa-shell-")&&k!==CACHE).map(k=>caches.delete(k)))),self.clients.claim()])));
self.addEventListener("fetch",(e)=>{
 const req=e.request;if(req.method!=="GET")return;
 const url=new URL(req.url);if(url.origin!==self.location.origin)return;
 if(req.mode==="navigate"){e.respondWith(fetch(req).catch(async()=>await caches.match("/offline.html")||Response.error()));return;}
 if(!url.pathname.startsWith("/assets/")||!/\.[a-z0-9_-]{6,}\./i.test(url.pathname))return;
 e.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(response=>{
   if(response.ok&&response.type==="basic"){const copy=response.clone();void caches.open(CACHE).then(cache=>cache.put(req,copy));}
   return response;
 })));
});
