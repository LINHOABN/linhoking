from rest_framework import serializers
from products.models import Product, ProductImage
from categories.models import Category
from categories.serializers import CategorySerializer
from decimal import Decimal

class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'produit', 'image']
        read_only_fields = ['id']

    def validate_image(self, value):
        if not value:
            raise serializers.ValidationError("Le fichier image est requis.")
        return value


class ProductSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(many=True, read_only=True)
    categorie_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        source='categorie',
        write_only=True
    )
    categorie = CategorySerializer(read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'nom', 'slug', 'description', 'prix', 
            'image_principale', 'categorie', 'categorie_id', 
            'vues_count', 'images', 'date_creation', 'date_modification', 'est_publie'
        ]
        read_only_fields = ['id', 'slug', 'vues_count', 'date_creation', 'date_modification', 'images']

    def to_internal_value(self, data):
        if 'categorie_id' in data:
            cat_val = data['categorie_id']
            if isinstance(cat_val, str) and not cat_val.isdigit():
                cat = Category.objects.filter(slug=cat_val).first() or Category.objects.filter(nom=cat_val).first()
                if cat:
                    mutable_data = data.copy() if hasattr(data, 'copy') else dict(data)
                    mutable_data['categorie_id'] = cat.id
                    data = mutable_data
        return super().to_internal_value(data)

    def validate_nom(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Le nom du produit ne peut pas être vide.")
        return value

    def validate_prix(self, value):
        if value < Decimal('0.00'):
            raise serializers.ValidationError("Le prix ne peut pas être négatif.")
        return value

    def create(self, validated_data):
        request = self.context.get('request')
        product = super().create(validated_data)
        if request and request.FILES:
            images = request.FILES.getlist('uploaded_images')
            for img in images:
                ProductImage.objects.create(produit=product, image=img)
        return product

    def update(self, instance, validated_data):
        request = self.context.get('request')
        product = super().update(instance, validated_data)
        if request and request.FILES:
            images = request.FILES.getlist('uploaded_images')
            for img in images:
                ProductImage.objects.create(produit=product, image=img)
        return product
