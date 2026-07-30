import os
import sys

# Ensure backend directory is in sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

from django.core.wsgi import get_wsgi_application
from django.core.management import call_command

app = get_wsgi_application()

# Execute automatic database migration and category seeding on serverless cold start
try:
    call_command('migrate', interactive=False, verbosity=0)
    try:
        call_command('seed_categories', verbosity=0)
    except Exception:
        pass
except Exception as e:
    print("MIGRATION_ON_STARTUP_NOTICE:", e, file=sys.stderr)
