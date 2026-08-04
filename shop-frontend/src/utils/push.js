const BASE_URL = import.meta.env.VITE_API_URL || "https://linhoking-me6f.vercel.app/api";

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export async function registerClientPushSubscription(conversationId) {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return false;

    try {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') return false;

        const reg = await navigator.serviceWorker.register('/sw.js');
        await navigator.serviceWorker.ready;

        const resKey = await fetch(`${BASE_URL}/push/vapid-key/`);
        const vapidData = await resKey.json();
        const applicationServerKey = urlBase64ToUint8Array(vapidData.public_key);

        const subscription = await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey
        });

        const subJson = subscription.toJSON();

        await fetch(`${BASE_URL}/push/subscribe/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                endpoint: subJson.endpoint,
                keys: subJson.keys,
                is_admin: false,
                conversation_id: conversationId
            })
        });

        console.log('Push client abonné !');
        return true;
    } catch (e) {
        console.error('Erreur push client:', e);
        return false;
    }
}
