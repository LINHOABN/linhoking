from rest_framework import serializers
from categories.models import Category

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'nom', 'slug', 'icone', 'date_creation']
        read_only_fields = ['id', 'slug', 'date_creation']
        
    def validate_nom(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Le nom de la catégorie ne peut pas être vide.")
        return value
