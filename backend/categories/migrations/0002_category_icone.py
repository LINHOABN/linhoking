from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('categories', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='category',
            name='icone',
            field=models.CharField(blank=True, default='tag', max_length=50),
        ),
    ]
