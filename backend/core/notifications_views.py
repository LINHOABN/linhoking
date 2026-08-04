from django.http import JsonResponse
from django.utils import timezone
from datetime import timedelta
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAdminUser


@api_view(['GET'])
@permission_classes([IsAdminUser])
def notifications_admin(request):
    """
    Retourne le nombre de messages non-lus et de nouveaux produits (48h).
    Endpoint pour le polling de l'admin.
    """
    try:
        from chat.models import Message
        unread_messages = Message.objects.filter(
            expediteur='VISITEUR',
            lu=False
        ).count()
    except Exception:
        unread_messages = 0

    try:
        from products.models import Product
        since = timezone.now() - timedelta(hours=48)
        new_products = Product.objects.filter(
            est_publie=True,
            date_creation__gte=since
        ).count()
    except Exception:
        new_products = 0

    return JsonResponse({
        "unread_messages": unread_messages,
        "new_products": new_products,
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def notifications_shop(request):
    """
    Retourne les produits publiés depuis un timestamp donnée (param: since=ISO8601).
    Endpoint public pour le polling de la boutique client.
    """
    try:
        from products.models import Product
        since_param = request.GET.get('since')
        if since_param:
            from django.utils.dateparse import parse_datetime
            since = parse_datetime(since_param)
            if since is None:
                since = timezone.now() - timedelta(hours=48)
        else:
            since = timezone.now() - timedelta(hours=48)

        new_products = Product.objects.filter(
            est_publie=True,
            date_creation__gte=since
        ).values('id', 'nom', 'slug', 'date_creation').order_by('-date_creation')[:5]

        return JsonResponse({
            "count": len(new_products),
            "products": list(new_products),
        })
    except Exception:
        return JsonResponse({"count": 0, "products": []})
