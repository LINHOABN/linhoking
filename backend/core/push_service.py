import os
import json
from pywebpush import webpush, WebPushException

VAPID_PUBLIC_KEY = os.environ.get(
    'VAPID_PUBLIC_KEY',
    'BNC1zTgayNBg7tRuBK5xLvpeV2fh1gQG5g7wPPo1BvaSRZVi2ss49PyRplMFMCBUKQ-8nxUewa-0pONxevvdtcw'
)
VAPID_PRIVATE_KEY = os.environ.get(
    'VAPID_PRIVATE_KEY',
    'HCgQ7GowSHrrvefHkSLyEFgs0qcYZ2znFBkNLPKdoCA'
)
VAPID_CLAIMS = {
    "sub": os.environ.get('VAPID_EMAIL', 'mailto:admin@linhoking.com')
}


def send_push_notification(sub, title, body, url="/"):
    """Envoie une notification push à un abonnement Web Push donné."""
    try:
        subscription_info = {
            "endpoint": sub.endpoint,
            "keys": {
                "p256dh": sub.p256dh,
                "auth": sub.auth
            }
        }
        payload = json.dumps({
            "title": title,
            "body": body,
            "url": url
        })
        webpush(
            subscription_info=subscription_info,
            data=payload,
            vapid_private_key=VAPID_PRIVATE_KEY,
            vapid_claims=VAPID_CLAIMS
        )
        return True
    except WebPushException as ex:
        # 410 Gone ou 404 Not Found : l'abonnement a expiré ou a été annulé par le client
        if ex.response and ex.response.status_code in (404, 410):
            sub.delete()
        return False
    except Exception:
        return False


def notify_admin_new_message(sender_name, message_text):
    """Notifie tous les admins abonnés lors d'un nouveau message client."""
    from core.models import PushSubscription
    subs = PushSubscription.objects.filter(is_admin=True)
    title = f"💬 Message de {sender_name}"
    body = message_text[:100]
    for s in subs:
        send_push_notification(s, title, body, url="/messages")


def notify_client_new_message(conversation_id, message_text):
    """Notifie le client de la conversation lors d'une réponse de l'admin."""
    from core.models import PushSubscription
    subs = PushSubscription.objects.filter(conversation_id=conversation_id)
    title = "💬 Reponse de LINHOKING"
    body = message_text[:100]
    for s in subs:
        send_push_notification(s, title, body, url="/")
