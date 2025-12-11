const CACHE_NAME = "ds-attend-cache-v6";   // ← 버전만 바꾸면 자동 업데이트됨

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        "index.html",
        "manifest.json",
        "icon-192-V2.png",
        "icon-512-V2.png"
      ]);
    })
  );
});

// 오래된 캐시 자동 삭제
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME) // 최신 캐시만 남기고
          .map((key) => caches.delete(key))    // 나머지는 삭제
      )
    )
  );
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      return cachedResponse || fetch(e.request);
    })
  );
});
