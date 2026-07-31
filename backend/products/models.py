import uuid
from django.db import models
from django.core.validators import MinValueValidator
from django.core.exceptions import ValidationError
from django.utils.text import slugify
from categories.models import Category
from decimal import Decimal

class Product(models.Model):
    nom = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    description = models.TextField(blank=True)
    prix = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.00'), message="Le prix ne peut pas être négatif.")]
    )
    image_principale = models.TextField(blank=True, null=True)
    categorie = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='products')
    vues_count = models.PositiveIntegerField(default=0)
    date_creation = models.DateTimeField(auto_now_add=True)
    date_modification = models.DateTimeField(auto_now=True)
    est_publie = models.BooleanField(default=True)

    class Meta:
        verbose_name = "Produit"
        verbose_name_plural = "Produits"
        ordering = ['-date_creation']

    def clean(self):
        super().clean()
        if not self.nom or not self.nom.strip():
            raise ValidationError({'nom': 'Le nom du produit ne peut pas être vide.'})
        if self.prix < Decimal('0.00'):
            raise ValidationError({'prix': 'Le prix du produit ne peut pas être négatif.'})

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.nom) or "produit"
            short_id = uuid.uuid4().hex[:6]
            self.slug = f"{base_slug}-{short_id}"
            while Product.objects.filter(slug=self.slug).exclude(pk=self.pk).exists():
                short_id = uuid.uuid4().hex[:6]
                self.slug = f"{base_slug}-{short_id}"
        super().save(*args, **kwargs)

    def __str__(self):
        return self.nom


class ProductImage(models.Model):
    produit = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    image = models.TextField(blank=True, null=True)

    class Meta:
        verbose_name = "Image du produit"
        verbose_name_plural = "Images du produit"

    def __str__(self):
        return f"Image pour {self.produit.nom}"
