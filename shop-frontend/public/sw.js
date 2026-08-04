// Service Worker pour les Push Notifications LINHOKING Boutique
self.addEventListener('push', function (event) {
    if (!event.data) return;

    try {
        const payload = event.data.json();
        const title = payload.title || 'LINHOKING Boutique';
        const options = {
            body: payload.body || 'Vous avez reçu un nouveau message',
            icon: '/logo.jpg',
            badge: '/logo.jpg',
            data: { url: payload.url || '/' },
            vibrate: [200, 100, 200]
        };

        event.waitUntil(
            self.registration.showNotification(title, options)
        );
    } catch (e) {
        console.error('Erreur traitement push shop:', e);
    }
});

self.addEventListener('notificationclick', function (event) {
    event.notification.close();
    const targetUrl = event.notification.data?.url || '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
            for (let i = 0; i < clientList.length; i++) {
                const client = clientList[i];
                if (client.url.includes(self.location.origin) && 'focus' in client) {
                    client.navigate(targetUrl);
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        })
    );
});
