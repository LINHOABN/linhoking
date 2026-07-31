from rest_framework import viewsets, filters, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.parsers import JSONParser, MultiPartParser, FormParser
from django.db.models import F, Sum
from products.models import Product, ProductImage
from products.serializers import ProductSerializer, ProductImageSerializer
from core.permissions import IsAdminOrReadOnly
from rest_framework.permissions import IsAdminUser, AllowAny
from django_filters.rest_framework import DjangoFilterBackend

class ProductViewSet(viewsets.ModelViewSet):
    serializer_class = ProductSerializer
    permission_classes = [IsAdminOrReadOnly]
    parser_classes = [JSONParser, MultiPartParser, FormParser]
    lookup_field = 'slug'
    
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['categorie__slug']
    search_fields = ['nom', 'description']
    ordering_fields = ['prix', 'date_creation', 'vues_count']
    ordering = ['-date_creation']

    def get_queryset(self):
        try:
            user = getattr(self.request, 'user', None)
            if user and user.is_authenticated and user.is_staff:
                return Product.objects.all()
            return Product.objects.filter(est_publie=True)
        except Exception:
            return Product.objects.none()

    def list(self, request, *args, **kwargs):
        try:
            return super().list(request, *args, **kwargs)
        except Exception as e:
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

    def retrieve(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            user = getattr(request, 'user', None)
            if not (user and user.is_authenticated and user.is_staff):
                try:
                    Product.objects.filter(pk=instance.pk).update(vues_count=F('vues_count') + 1)
                    instance.refresh_from_db()
                except Exception:
                    pass
            serializer = self.get_serializer(instance)
            return Response(serializer.data)
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def stats(self, request):
        try:
            top_products = Product.objects.all().order_by('-vues_count')[:5]
            total_views = Product.objects.aggregate(total=Sum('vues_count'))['total'] or 0
            total_products = Product.objects.count()

            top_data = []
            for p in top_products:
                top_data.append({
                    'id': p.id,
                    'nom': p.nom,
                    'slug': p.slug,
                    'prix': p.prix,
                    'vues_count': p.vues_count,
                    'categorie_nom': p.categorie.nom if p.categorie else '',
                    'image': p.image_principale if p.image_principale else (p.images.first().image if p.images.exists() else None)
                })

            return Response({
                'total_products': total_products,
                'total_views': total_views,
                'top_visited': top_data
            })
        except Exception:
            return Response({
                'total_products': 0,
                'total_views': 0,
                'top_visited': []
            })

    def create(self, request, *args, **kwargs):
        try:
            return super().create(request, *args, **kwargs)
        except Exception as e:
            import traceback
            return Response({'detail': str(e), 'trace': traceback.format_exc()[-500:]}, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        try:
            return super().update(request, *args, **kwargs)
        except Exception as e:
            import traceback
            return Response({'detail': str(e), 'trace': traceback.format_exc()[-500:]}, status=status.HTTP_400_BAD_REQUEST)

    def partial_update(self, request, *args, **kwargs):
        try:
            kwargs['partial'] = True
            return self.update(request, *args, **kwargs)
        except Exception as e:
            import traceback
            return Response({'detail': str(e), 'trace': traceback.format_exc()[-500:]}, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, *args, **kwargs):
        try:
            return super().destroy(request, *args, **kwargs)
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class ProductImageViewSet(viewsets.ModelViewSet):
    serializer_class = ProductImageSerializer
    queryset = ProductImage.objects.all()
    parser_classes = [JSONParser, MultiPartParser, FormParser]
    
    def get_permissions(self):
        if self.action in ['create', 'destroy', 'update', 'partial_update']:
            return [IsAdminUser()]
        return [IsAdminOrReadOnly()]

