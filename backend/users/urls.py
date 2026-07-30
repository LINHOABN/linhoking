from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from users.views import LoginView, LogoutView

urlpatterns = [
    path('login/', LoginView.as_view(), name='token_obtain_pair'),
    path('logout/', LogoutView.as_view(), name='token_blacklist'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
