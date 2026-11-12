/* Hors ligne + mises à jour automatiques. Pour forcer une mise à jour chez tout le monde, changer le numéro de V. */
var V="busyboard-v2",FILES=["./","./index.html","./manifest.webmanifest","./icon-192.png","./icon-512.png","./icon-maskable-512.png"];

self.addEventListener("install",function(e){
  e.waitUntil(caches.open(V).then(function(c){
    return Promise.all(FILES.map(function(f){
      return fetch(f,{cache:"reload"}).then(function(r){if(!r.ok)throw new Error(f);return c.put(f,r)});
    }));
  }).then(function(){return self.skipWaiting()}));
});

self.addEventListener("activate",function(e){
  e.waitUntil(caches.keys().then(function(k){
    return Promise.all(k.filter(function(n){return n!==V}).map(function(n){return caches.delete(n)}));
  }).then(function(){return self.clients.claim()}));
});

self.addEventListener("fetch",function(e){
  var req=e.request;
  if(req.method!=="GET"||new URL(req.url).origin!==location.origin)return;
  var net=fetch(req.url,{cache:"no-cache"}).then(function(res){
    if(res.ok){var cp=res.clone();caches.open(V).then(function(c){c.put(req,cp)})}
    return res;
  }).catch(function(){return caches.match(req,{ignoreSearch:true})});
  var slow=new Promise(function(ok){
    setTimeout(function(){caches.match(req,{ignoreSearch:true}).then(function(r){if(r)ok(r)})},2500);
  });
  e.respondWith(Promise.race([net,slow]));
});
