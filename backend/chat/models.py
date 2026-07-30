from django.db import models
from django.core.exceptions import ValidationError

class Conversation(models.Model):
    nom_visiteur = models.CharField(max_length=255)
    email = models.CharField(max_length=255, blank=True, null=True)
    produit = models.ForeignKey('products.Product', on_delete=models.SET_NULL, null=True, blank=True, related_name='conversations')
    date_creation = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Conversation"
        verbose_name_plural = "Conversations"
        ordering = ['-date_creation']

    def clean(self):
        super().clean()
        if not self.nom_visiteur or not self.nom_visiteur.strip():
            raise ValidationError({'nom_visiteur': 'Le nom du visiteur ne peut pas être vide.'})

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        produit_info = f" - {self.produit.nom}" if self.produit else ""
        return f"Chat avec {self.nom_visiteur}{produit_info} ({self.date_creation.strftime('%Y-%m-%d %H:%M')})"


class Message(models.Model):
    SENDER_CHOICES = (
        ('ADMIN', 'Admin'),
        ('VISITEUR', 'Visiteur'),
    )
    
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    expediteur = models.CharField(max_length=10, choices=SENDER_CHOICES)
    message = models.TextField()
    date_envoi = models.DateTimeField(auto_now_add=True)
    lu = models.BooleanField(default=False)

    class Meta:
        verbose_name = "Message"
        verbose_name_plural = "Messages"
        ordering = ['date_envoi']

    def clean(self):
        super().clean()
        if not self.message or not self.message.strip():
            raise ValidationError({'message': 'Le contenu du message ne peut pas être vide.'})
        if self.expediteur not in dict(self.SENDER_CHOICES):
            raise ValidationError({'expediteur': 'L\'expéditeur spécifié est invalide.'})

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"De {self.get_expediteur_display()} à {self.date_envoi.strftime('%H:%M')}"
