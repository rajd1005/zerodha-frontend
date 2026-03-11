self.addEventListener('push', function (event) {
  const data = event.data ? event.data.json() : {};
  
  const title = data.title || 'Trade Alert';
  const options = {
    body: data.body || 'You have a new notification from the Trading System.',
    icon: data.icon || '/icon-192x192.png',
    badge: '/icon-192x192.png',
    vibrate: [200, 100, 200, 100, 200, 100, 200],
    data: {
      url: '/dashboard'
    }
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data.url));
});
