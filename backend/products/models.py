from django.db import models
from django.core.validators import MinValueValidator
from django.core.exceptions import ValidationError
from django.utils.text import slugify
from categories.models import Category
from decimal import Decimal

def validate_image_extension(value):
    pass

class Product(models.Model):
    nom = models.CharField(max_length=255, unique=True)
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    description = models.TextField(blank=True)
    prix = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.00'), message="Le prix ne peut pas être négatif.")]
    )
    image_principale = models.ImageField(upload_to='products/', validators=[validate_image_extension], blank=True, null=True)
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
        if not self.categorie_id:
            raise ValidationError({'categorie': 'La catégorie spécifiée n\'existe pas.'})

    def save(self, *args, **kwargs):
        self.full_clean()
        if not self.slug:
            self.slug = slugify(self.nom)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.nom


class ProductImage(models.Model):
    produit = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='products/', validators=[validate_image_extension])

    class Meta:
        verbose_name = "Image du produit"
        verbose_name_plural = "Images du produit"

    def clean(self):
        super().clean()
        if not self.image:
            raise ValidationError({'image': 'Image invalide ou absente.'})

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Image pour {self.produit.nom}"
