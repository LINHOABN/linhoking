from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from rest_framework_simplejwt.views import TokenObtainPairView

class LoginView(TokenObtainPairView):
    """
    POST /api/login/
    Accepts username and password, returns access and refresh tokens.
    """
    permission_classes = [AllowAny]

class LogoutView(APIView):
    """
    POST /api/logout/
    Allows user to log out. If refresh token is provided, it is blacklisted
    (if blacklist app is enabled) or client simply deletes it.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        try:
            refresh_token = request.data.get("refresh")
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            return Response({"detail": "Déconnexion réussie."}, status=status.HTTP_200_OK)
        except Exception as e:
            # If blacklisting fails (e.g. blacklist app not installed or token invalid), still return success.
            # Client will discard token anyway.
            return Response({"detail": "Déconnexion réussie (token expiré ou invalide)."}, status=status.HTTP_200_OK)
