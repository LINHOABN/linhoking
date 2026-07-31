# Generated manually - change image_principale and ProductImage.image from CharField/ImageField to TextField
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('products', '0003_product_vues_count'),
    ]

    operations = [
        migrations.AlterField(
            model_name='product',
            name='image_principale',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='productimage',
            name='image',
            field=models.TextField(blank=True, null=True),
        ),
    ]
