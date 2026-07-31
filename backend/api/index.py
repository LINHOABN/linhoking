import os
import sys
import traceback

backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

try:
    from django.core.wsgi import get_wsgi_application
    _wsgi_app = get_wsgi_application()

    def app(environ, start_response):
        try:
            return _wsgi_app(environ, start_response)
        except Exception as e:
            tb = traceback.format_exc()
            body = f"WSGI Execution Error: {e}\n\n{tb}".encode('utf-8')
            start_response('500 Internal Server Error', [
                ('Content-Type', 'text/plain; charset=utf-8'),
                ('Content-Length', str(len(body))),
                ('Access-Control-Allow-Origin', '*'),
            ])
            return [body]

except Exception as e:
    tb = traceback.format_exc()
    body = f"WSGI Startup Error: {e}\n\n{tb}".encode('utf-8')

    def app(environ, start_response):
        start_response('500 Internal Server Error', [
            ('Content-Type', 'text/plain; charset=utf-8'),
            ('Content-Length', str(len(body))),
            ('Access-Control-Allow-Origin', '*'),
        ])
        return [body]
