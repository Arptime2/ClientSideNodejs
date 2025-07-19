
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));
self.addEventListener('fetch', (event) => {
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request).then((response) => {
                const newHeaders = new Headers(response.headers);
                newHeaders.set('Cross-Origin-Embedder-Policy', 'require-corp');
                newHeaders.set('Cross-Origin-Opener-Policy', 'same-origin');
                return new Response(response.body, { headers: newHeaders });
            })
        );
    }
});
