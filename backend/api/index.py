import os
import sys

# Ensure backend directory is cleanly in sys.path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

from django.core.wsgi import get_wsgi_application
from django.core.management import call_command

app = get_wsgi_application()

try:
    static_dir = os.path.join(backend_dir, 'static')
    if not os.path.exists(static_dir) or not os.listdir(static_dir):
        call_command('collectstatic', '--noinput', verbosity=0)
except Exception:
    pass


