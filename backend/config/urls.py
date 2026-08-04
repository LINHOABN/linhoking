"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

from django.http import JsonResponse
from core.notifications_views import notifications_admin, notifications_shop
from core.push_views import get_vapid_key, subscribe_push

def api_root(request):
    return JsonResponse({
        "status": "online",
        "name": "LINHOKING Boutique API",
        "endpoints": {
            "categories": "/api/categories/",
            "products": "/api/products/",
            "chat": "/api/chat/",
            "admin": "/admin/"
        }
    })

urlpatterns = [
    path('', api_root, name='api-root'),
    path('api/', api_root, name='api-index'),
    path('admin/', admin.site.urls),
    path('api/categories/', include('categories.urls')),
    path('api/products/', include('products.urls')),
    path('api/chat/', include('chat.urls')),
    path('api/', include('users.urls')),
    path('api/notifications/', notifications_admin, name='notifications-admin'),
    path('api/notifications/shop/', notifications_shop, name='notifications-shop'),
    path('api/push/vapid-key/', get_vapid_key, name='push-vapid-key'),
    path('api/push/subscribe/', subscribe_push, name='push-subscribe'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

