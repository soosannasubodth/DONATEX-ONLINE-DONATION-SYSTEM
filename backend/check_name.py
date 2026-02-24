import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from donatex.models import User

u = User.objects.get(email='soosannasubodh61@gmail.com')
print(f'Email: {u.email}')
print(f'Full Name: "{u.full_name}"')
print(f'Name Length: {len(u.full_name)}')
print(f'Name chars: {[c for c in u.full_name]}')
