from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from categories.models import Category
from products.models import Product, ProductImage
from decimal import Decimal
from django.core.files.uploadedfile import SimpleUploadedFile

class ProductTests(APITestCase):
    def setUp(self):
        self.category = Category.objects.create(nom="Vêtements", slug="vetements")
        self.admin = User.objects.create_superuser(
            username='admin', password='adminpassword', email='admin@boutique.com'
        )
        
        # Test images (creating a tiny 1x1 pixel GIF in memory)
        self.small_gif = (
            b'\x47\x49\x46\x38\x39\x61\x01\x00\x01\x00\x00\x00\x00\x21\xf9\x04'
            b'\x01\x0a\x00\x01\x00\x2c\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02'
            b'\x02\x4c\x01\x00\x3b'
        )
        self.uploaded_image = SimpleUploadedFile(
            name='test_img.gif', content=self.small_gif, content_type='image/gif'
        )

        self.p1 = Product.objects.create(
            nom="T-shirt Vintage",
            slug="t-shirt-vintage",
            description="Super t-shirt",
            prix=Decimal("29.99"),
            image_principale=self.uploaded_image,
            categorie=self.category,
            est_publie=True
        )

        self.p2 = Product.objects.create(
            nom="Veste Cuir",
            slug="veste-cuir",
            description="Veste motard haute qualité",
            prix=Decimal("120.00"),
            image_principale=self.uploaded_image,
            categorie=self.category,
            est_publie=False  # Draft product
        )

    def test_list_products_visitor(self):
        url = reverse('product-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Guest/Visitor only sees published products (p1)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['nom'], "T-shirt Vintage")

    def test_list_products_admin(self):
        self.client.force_authenticate(user=self.admin)
        url = reverse('product-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Admin sees all products (p1 and p2)
        self.assertEqual(len(response.data['results']), 2)

    def test_search_products(self):
        url = reverse('product-list')
        response = self.client.get(f"{url}?search=Veste")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Veste is not published, visitor search gets empty list
        self.assertEqual(len(response.data['results']), 0)

        # Admin search for Veste
        self.client.force_authenticate(user=self.admin)
        response = self.client.get(f"{url}?search=Veste")
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['nom'], "Veste Cuir")

    def test_create_product_admin(self):
        self.client.force_authenticate(user=self.admin)
        url = reverse('product-list')
        self.uploaded_image.seek(0)
        data = {
            'nom': 'Jean Slim',
            'description': 'Description du jean',
            'prix': '49.99',
            'categorie_id': self.category.id,
            'image_principale': self.uploaded_image,
            'est_publie': True
        }
        response = self.client.post(url, data, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['slug'], 'jean-slim')

    def test_create_product_invalid_price(self):
        self.client.force_authenticate(user=self.admin)
        url = reverse('product-list')
        self.uploaded_image.seek(0)
        data = {
            'nom': 'Jean Slim',
            'description': 'Description du jean',
            'prix': '-20.00',  # Negative price validation check !
            'categorie_id': self.category.id,
            'image_principale': self.uploaded_image,
            'est_publie': True
        }
        response = self.client.post(url, data, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('prix', response.data)
