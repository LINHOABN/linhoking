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

export async function registerPushSubscription(isAdmin = true, conversationId = null) {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        console.warn('Push non supporté par ce navigateur');
        return false;
    }

    try {
        // Demande la permission à l'utilisateur
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
            console.log('Permission notification refusée');
            return false;
        }

        // Enregistre le service worker
        const reg = await navigator.serviceWorker.register('/sw.js');
        await navigator.serviceWorker.ready;

        // Récupère la clé publique VAPID
        const vapidData = await apiRequest('/push/vapid-key/');
        const applicationServerKey = urlBase64ToUint8Array(vapidData.public_key);

        // S'abonne au PushManager
        const subscription = await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey
        });

        const subJson = subscription.toJSON();

        // Envoie au backend
        await apiRequest('/push/subscribe/', {
            method: 'POST',
            body: {
                endpoint: subJson.endpoint,
                keys: subJson.keys,
                is_admin: isAdmin,
                conversation_id: conversationId
            }
        });

        console.log('Push abonné avec succès !');
        return true;
    } catch (err) {
        console.error('Erreur inscription push:', err);
        return false;
    }
}
