from django.core.management.base import BaseCommand
from categories.models import Category


DEFAULT_CATEGORIES = [
    {"nom": "Vêtements",    "icone": "shirt"},
    {"nom": "Chaussures",   "icone": "chaussures"},
    {"nom": "Sacs",         "icone": "bag"},
    {"nom": "Montres",      "icone": "watch"},
    {"nom": "Casquettes",   "icone": "cap"},
    {"nom": "Lunettes",     "icone": "sunglasses"},
    {"nom": "Téléphones",   "icone": "phone"},
    {"nom": "Ordinateurs",  "icone": "laptop"},
    {"nom": "Électronique", "icone": "electronics"},
    {"nom": "Bijoux",       "icone": "jewelry"},
    {"nom": "Parfums",      "icone": "perfume"},
    {"nom": "Beauté & Soins", "icone": "beauty"},
    {"nom": "Sport",        "icone": "sports"},
    {"nom": "Enfants",      "icone": "kids"},
    {"nom": "Maison & Déco", "icone": "home"},
]


class Command(BaseCommand):
    help = "Seed the database with default product categories and their icons."

    def handle(self, *args, **options):
        created_count = 0
        skipped_count = 0

        for cat in DEFAULT_CATEGORIES:
            obj, created = Category.objects.get_or_create(
                nom=cat["nom"],
                defaults={"icone": cat["icone"]},
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f"  Created: {obj.nom} [{obj.icone}]"))
                created_count += 1
            else:
                # Update icon on existing categories if it's still the default 'tag'
                if obj.icone == "tag":
                    obj.icone = cat["icone"]
                    obj.save(update_fields=["icone"])
                    self.stdout.write(self.style.WARNING(f"  Updated icon: {obj.nom} -> {obj.icone}"))
                    created_count += 1
                else:
                    self.stdout.write(f"  Skipped (exists): {obj.nom}")
                    skipped_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"\nDone -- {created_count} created/updated, {skipped_count} already present."
            )
        )
