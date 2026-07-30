from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from chat.models import Conversation, Message

class ChatTests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_superuser(
            username='admin', password='adminpassword', email='admin@boutique.com'
        )
        self.conv = Conversation.objects.create(
            nom_visiteur="Jean Dupont",
            email="jean@dupont.com"
        )
        self.m1 = Message.objects.create(
            conversation=self.conv,
            expediteur="VISITEUR",
            message="Bonjour, est-ce que le produit est dispo?"
        )

    def test_visitor_create_conversation(self):
        url = reverse('conversation-list')
        data = {'nom_visiteur': 'Marie Curie', 'email': 'marie@curie.com'}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['nom_visiteur'], 'Marie Curie')

    def test_visitor_send_message(self):
        url = reverse('message-list')
        data = {
            'conversation': self.conv.id,
            'message': 'Est-il possible de payer par carte?'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['expediteur'], 'VISITEUR')  # Defaults to VISITEUR!

    def test_visitor_list_conversations_forbidden(self):
        url = reverse('conversation-list')
        response = self.client.get(url)
        # Guest cannot list conversations
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_admin_list_conversations(self):
        self.client.force_authenticate(user=self.admin)
        url = reverse('conversation-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)

    def test_admin_list_messages_marks_as_read(self):
        self.assertEqual(self.m1.lu, False)
        
        self.client.force_authenticate(user=self.admin)
        url = reverse('message-list')
        response = self.client.get(f"{url}?conversation={self.conv.id}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Checking that m1 is read (in db)
        self.m1.refresh_from_db()
        self.assertEqual(self.m1.lu, True)

    def test_admin_reply(self):
        self.client.force_authenticate(user=self.admin)
        url = reverse('message-list')
        data = {
            'conversation': self.conv.id,
            'message': 'Oui, le produit est disponible.'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['expediteur'], 'ADMIN')  # Staff user defaults to ADMIN sender!

    def test_admin_delete_conversation(self):
        self.client.force_authenticate(user=self.admin)
        url = reverse('conversation-detail', kwargs={'pk': self.conv.id})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Conversation.objects.filter(id=self.conv.id).exists())
