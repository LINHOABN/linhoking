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


class ProductSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(many=True, read_only=True)
    uploaded_images_data = serializers.ListField(
        child=serializers.CharField(),
        write_only=True,
        required=False
    )
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
            'vues_count', 'images', 'uploaded_images_data', 'date_creation', 'date_modification', 'est_publie'
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
        extra_images = validated_data.pop('uploaded_images_data', [])
        product = super().create(validated_data)
        for img_str in extra_images:
            if img_str:
                ProductImage.objects.create(produit=product, image=img_str)
        return product

    def update(self, instance, validated_data):
        extra_images = validated_data.pop('uploaded_images_data', [])
        product = super().update(instance, validated_data)
        if extra_images:
            for img_str in extra_images:
                if img_str:
                    ProductImage.objects.create(produit=product, image=img_str)
        return product
