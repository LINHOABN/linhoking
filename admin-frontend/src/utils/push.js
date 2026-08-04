import { apiRequest } from "../services/api.js";

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

export function getPushPermissionState() {
    if (!('Notification' in window)) return 'unsupported';
    return Notification.permission; // 'default', 'granted', 'denied'
}

export async function registerPushSubscription(isAdmin = true, conversationId = null) {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        console.warn('Push non supporté par ce navigateur');
        return { success: false, reason: 'unsupported' };
    }

    try {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
            return { success: false, reason: permission };
        }

        const reg = await navigator.serviceWorker.register('/sw.js');
        await navigator.serviceWorker.ready;

        const vapidData = await apiRequest('/push/vapid-key/');
        const applicationServerKey = urlBase64ToUint8Array(vapidData.public_key);

        const subscription = await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey
        });

        const subJson = subscription.toJSON();

        await apiRequest('/push/subscribe/', {
            method: 'POST',
            body: {
                endpoint: subJson.endpoint,
                keys: subJson.keys,
                is_admin: isAdmin,
                conversation_id: conversationId
            }
        });

        return { success: true, reason: 'granted' };
    } catch (err) {
        console.error('Erreur inscription push:', err);
        return { success: false, reason: err.message };
    }
}
