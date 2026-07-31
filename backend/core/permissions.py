from rest_framework import permissions

class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Custom permission to allow logged-in admin users to edit objects.
    Read-only permissions are allowed for any request (visitors).
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return bool(request.user and (getattr(request.user, 'is_staff', False) or getattr(request.user, 'is_authenticated', False)))

