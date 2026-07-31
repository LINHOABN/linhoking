from rest_framework import viewsets, status
from rest_framework.response import Response
from categories.models import Category
from categories.serializers import CategorySerializer
from core.permissions import IsAdminOrReadOnly

class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    permission_classes = [IsAdminOrReadOnly]
    lookup_field = 'slug'

    def get_queryset(self):
        try:
            return Category.objects.all()
        except Exception:
            return Category.objects.none()

    def list(self, request, *args, **kwargs):
        try:
            return super().list(request, *args, **kwargs)
        except Exception:
            return Response([], status=status.HTTP_200_OK)

    def get_object(self):
        queryset = self.filter_queryset(self.get_queryset())
        lookup_url_kwarg = self.lookup_field or self.lookup_url_kwarg
        val = self.kwargs.get(lookup_url_kwarg)
        if val and val.isdigit():
            try:
                return queryset.get(pk=int(val))
            except Exception:
                pass
        return super().get_object()


