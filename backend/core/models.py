from django.db import models

class PushSubscription(models.Model):
    endpoint = models.TextField(unique=True)
    p256dh = models.TextField()
    auth = models.TextField()
    is_admin = models.BooleanField(default=False)
    conversation = models.ForeignKey(
        'chat.Conversation',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='push_subscriptions'
    )
    date_creation = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Abonnement Push"
        verbose_name_plural = "Abonnements Push"

    def __str__(self):
        role = "Admin" if self.is_admin else f"Conv #{self.conversation_id}"
        return f"PushSub ({role}) - {self.endpoint[:30]}..."
