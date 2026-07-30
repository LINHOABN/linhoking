from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from categories.models import Category

class CategoryTests(APITestCase):
    def setUp(self):
        # Create categories
        self.cat1 = Category.objects.create(nom="Mode Homme", slug="mode-homme")
        self.cat2 = Category.objects.create(nom="Électronique", slug="electronique")
        
        # Create admin user
        self.admin = User.objects.create_superuser(
            username='admin', password='adminpassword', email='admin@boutique.com'
        )
        # Login and set credentials for write tests
        self.client.login(username='admin', password='adminpassword')
        # We can also get JWT token if we want to simulate full flow, but client.force_authenticate is easiest
        
    def test_list_categories_anonymous(self):
        self.client.logout()   # Make anonymous
        url = reverse('category-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 2)  # Since pagination is on, result is in 'results' key

    def test_retrieve_category_anonymous(self):
        self.client.logout()
        url = reverse('category-detail', kwargs={'slug': 'mode-homme'})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['nom'], "Mode Homme")

    def test_create_category_admin(self):
        # Authenticated as admin
        self.client.force_authenticate(user=self.admin)
        url = reverse('category-list')
        data = {'nom': 'Chaussures'}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['slug'], 'chaussures')

    def test_create_category_visitor_forbidden(self):
        self.client.logout()  # Guest visitor
        url = reverse('category-list')
        data = {'nom': 'Chaussures'}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_category_empty_name(self):
        self.client.force_authenticate(user=self.admin)
        url = reverse('category-list')
        data = {'nom': '   '}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('nom', response.data)
