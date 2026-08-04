import json
from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from core.models import PushSubscription
from core.push_service import VAPID_PUBLIC_KEY


@api_view(['GET'])
@permission_classes([AllowAny])
def get_vapid_key(request):
    """Retourne la clé publique VAPID pour que les frontends s'abonnent aux pushs."""
    return JsonResponse({"public_key": VAPID_PUBLIC_KEY})


@api_view(['POST'])
@permission_classes([AllowAny])
def subscribe_push(request):
    """Enregistre ou met à jour un abonnement Push dans la base de données."""
    try:
        data = json.loads(request.body)
        endpoint = data.get('endpoint')
        keys = data.get('keys', {})
        p256dh = keys.get('p256dh')
        auth = keys.get('auth')
        is_admin = bool(data.get('is_admin', False))
        conversation_id = data.get('conversation_id')

        if not endpoint or not p256dh or not auth:
            return JsonResponse({'error': 'Données d\'abonnement manquantes'}, status=400)

        sub, _ = PushSubscription.objects.update_or_create(
            endpoint=endpoint,
            defaults={
                'p256dh': p256dh,
                'auth': auth,
                'is_admin': is_admin,
                'conversation_id': conversation_id
            }
        )

        return JsonResponse({'status': 'ok', 'id': sub.id})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)
