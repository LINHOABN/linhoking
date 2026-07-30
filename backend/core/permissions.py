from rest_framework import permissions

class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow administrators to edit objects.
    Read-only permissions are allowed for any request (visitors).
    """
    def has_permission(self, request, view):
        # Allow search methods, lists, and details for everyone
        if request.method in permissions.SAFE_METHODS:
            return True
        # Write operations require admin status
        return bool(request.user and request.user.is_staff)
