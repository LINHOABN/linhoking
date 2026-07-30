from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate


class LoginView(APIView):
    """
    POST /api/login/
    Accepts username and password, returns access and refresh tokens.
    Works with both PostgreSQL and SQLite (no token_blacklist dependency).
    """
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        username = request.data.get("username", "").strip()
        password = request.data.get("password", "").strip()

        if not username or not password:
            return Response(
                {"detail": "Nom d'utilisateur et mot de passe requis."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = authenticate(request, username=username, password=password)
        if user is None:
            return Response(
                {"detail": "Identifiant ou mot de passe incorrect."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        refresh = RefreshToken.for_user(user)
        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "is_staff": user.is_staff,
                "is_superuser": user.is_superuser,
            }
        }, status=status.HTTP_200_OK)


class LogoutView(APIView):
    """
    POST /api/logout/
    Client simply discards the token. No server-side blacklisting required.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        # With SQLite ephemeral DB on Vercel, we skip blacklisting
        # Client discards token on logout
        try:
            refresh_token = request.data.get("refresh")
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
        except Exception:
            pass
        return Response({"detail": "Déconnexion réussie."}, status=status.HTTP_200_OK)
