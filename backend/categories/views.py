from rest_framework import viewsets
from categories.models import Category
from categories.serializers import CategorySerializer
from core.permissions import IsAdminOrReadOnly

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAdminOrReadOnly]
    lookup_field = 'slug'

    def get_object(self):
        queryset = self.filter_queryset(self.get_queryset())
        lookup_url_kwarg = self.lookup_field or self.lookup_url_kwarg
        val = self.kwargs.get(lookup_url_kwarg)
        if val and val.isdigit():
            return queryset.get(pk=int(val))
        return super().get_object()

