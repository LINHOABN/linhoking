from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from chat.models import Conversation, Message
from chat.serializers import ConversationSerializer, MessageSerializer
from rest_framework.permissions import IsAdminUser, AllowAny

class ConversationViewSet(viewsets.ModelViewSet):
    queryset = Conversation.objects.all()
    serializer_class = ConversationSerializer

    def get_permissions(self):
        if self.action in ['create', 'retrieve']:
            return [AllowAny()]
        return [IsAdminUser()]


class MessageViewSet(viewsets.ModelViewSet):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [AllowAny()]
        return [IsAdminUser()]

    def get_queryset(self):
        if self.request.user and self.request.user.is_staff:
            conversation_id = self.request.query_params.get('conversation')
            if conversation_id:
                # Mark visitor messages as read when admin fetches them
                messages = Message.objects.filter(conversation_id=conversation_id)
                messages.filter(expediteur='VISITEUR', lu=False).update(lu=True)
                return messages
            return Message.objects.all()
        return Message.objects.none()

    def perform_create(self, serializer):
        user = self.request.user
        if user and user.is_authenticated and user.is_staff:
            msg = serializer.save(expediteur='ADMIN')
            try:
                from core.push_service import notify_client_new_message
                notify_client_new_message(msg.conversation_id, msg.message)
            except Exception as e:
                print(f"Push notify client error: {e}")
        else:
            msg = serializer.save(expediteur='VISITEUR')
            try:
                from core.push_service import notify_admin_new_message
                nom = msg.conversation.nom_visiteur if msg.conversation else "Client"
                notify_admin_new_message(nom, msg.message)
            except Exception as e:
                print(f"Push notify admin error: {e}")
