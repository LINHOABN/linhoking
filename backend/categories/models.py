from django.db import models
from django.utils.text import slugify
from django.core.exceptions import ValidationError

class Category(models.Model):
    nom = models.CharField(max_length=255, unique=True)
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    icone = models.CharField(max_length=50, default='tag', blank=True)
    date_creation = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Catégorie"
        verbose_name_plural = "Catégories"
        ordering = ['nom']

    def clean(self):
        super().clean()
        if not self.nom or not self.nom.strip():
            raise ValidationError({'nom': 'Le nom de la catégorie ne peut pas être vide.'})

    def save(self, *args, **kwargs):
        self.full_clean()
        if not self.slug:
            self.slug = slugify(self.nom)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.nom
