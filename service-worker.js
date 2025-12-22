// ✅ 정적 리소스만 안전하게 캐시
const CACHE_NAME = "ds-attend-static-v5";

// 캐시할 파일(정적 파일만!)
const ASSETS = [
  "/daesung-attendance/",
  "/daesung-attendance/index.html",
  "/daesung-attendance/redirect.html",
  "/daesung-attendance/manifest.json",
  "/daesung-attendance/icon-192-v2.png",
  "/daesung-attendance/icon-512-v2.png"
];

// 설치: 정적 파일 미리 캐시
self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

// 활성화: 오래된 캐시 삭제 + 즉시 적용
self.addEventListener("activate", (e) => {
  e.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  const url = new URL(req.url);

  // ✅ 외부 도메인(GAS 등)은 절대 캐시하지 않음 (항상 네트워크)
  if (url.origin !== self.location.origin) {
    e.respondWith(fetch(req));
    return;
  }

  // ✅ HTML(페이지)은 "네트워크 우선" (수정 반영 최우선)
  // index.html / redirect.html은 특히 최신 유지가 중요함
  const isHTML = req.headers.get("accept")?.includes("text/html");
  if (isHTML) {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  // ✅ 그 외(아이콘/manifest 등)는 "캐시 우선"
  e.respondWith(
    caches.match(req).then((cached) => cached || fetch(req))
  );
});
