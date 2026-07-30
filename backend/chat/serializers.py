from rest_framework import serializers
from chat.models import Conversation, Message
from products.models import Product


class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ['id', 'conversation', 'expediteur', 'message', 'date_envoi', 'lu']
        read_only_fields = ['id', 'expediteur', 'date_envoi', 'lu']

    def validate_message(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Le contenu du message ne peut pas être vide.")
        return value


class ConversationSerializer(serializers.ModelSerializer):
    messages = MessageSerializer(many=True, read_only=True)
    produit_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(),
        source='produit',
        write_only=True,
        allow_null=True,
        required=False,
    )
    produit_nom = serializers.SerializerMethodField(read_only=True)
    produit_categorie = serializers.SerializerMethodField(read_only=True)
    produit_prix = serializers.SerializerMethodField(read_only=True)
    produit_description = serializers.SerializerMethodField(read_only=True)
    produit_pk = serializers.IntegerField(source='produit.id', read_only=True, allow_null=True)

    def get_produit_nom(self, obj):
        return obj.produit.nom if obj.produit else None

    def get_produit_categorie(self, obj):
        return obj.produit.categorie.nom if (obj.produit and obj.produit.categorie) else None

    def get_produit_prix(self, obj):
        return obj.produit.prix if obj.produit else None

    def get_produit_description(self, obj):
        return obj.produit.description if obj.produit else None

    class Meta:
        model = Conversation
        fields = [
            'id', 'nom_visiteur', 'email', 'produit_id',
            'produit_nom', 'produit_categorie', 'produit_prix', 'produit_description',
            'produit_pk', 'date_creation', 'messages'
        ]
        read_only_fields = [
            'id', 'date_creation', 'messages',
            'produit_nom', 'produit_categorie', 'produit_prix', 'produit_description', 'produit_pk'
        ]

    def validate_nom_visiteur(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Le nom du visiteur ne peut pas être vide.")
        return value
