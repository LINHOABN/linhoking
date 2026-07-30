from django.contrib import admin
from chat.models import Conversation, Message

class MessageInline(admin.TabularInline):
    model = Message
    extra = 1
    fields = ('expediteur', 'message', 'date_envoi', 'lu')
    readonly_fields = ('date_envoi',)


@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ('nom_visiteur', 'email', 'date_creation', 'get_message_count', 'get_unread_count')
    search_fields = ('nom_visiteur', 'email')
    list_filter = ('date_creation',)
    inlines = [MessageInline]
    ordering = ('-date_creation',)

    def get_message_count(self, obj):
        return obj.messages.count()
    get_message_count.short_description = 'Messages'

    def get_unread_count(self, obj):
        return obj.messages.filter(expediteur='VISITEUR', lu=False).count()
    get_unread_count.short_description = 'Non lus'
