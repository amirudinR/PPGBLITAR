// Firebase Messaging Service Worker
// Uses Firebase compat SDK (required for service worker context)

importScripts('https://www.gstatic.com/firebasejs/11.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyD3E-CRhF973pIiJ3dIx7RFBeGHRHET67I',
  authDomain: 'ppg-samarinda.firebaseapp.com',
  projectId: 'ppg-samarinda',
  storageBucket: 'ppg-samarinda.appspot.com',
  messagingSenderId: '935384769767',
  appId: '1:935384769767:web:056c746c3dc19223742e42',
});

const messaging = firebase.messaging();

// Handle background push messages
messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title ?? 'PPG Samarinda';
  const body = payload.notification?.body ?? '';
  const link = payload.data?.link ?? '/';

  self.registration.showNotification(title, {
    body,
    icon: '/logo.png',
    badge: '/logo.png',
    tag: payload.data?.tag ?? 'ppg-notif',
    renotify: true,
    data: { link },
  });
});

// Navigate to link when notification is tapped
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const link = event.notification.data?.link;
  if (!link) return;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.postMessage({ type: 'NAVIGATE', link });
          return client.focus();
        }
      }
      return clients.openWindow(link);
    }),
  );
});
