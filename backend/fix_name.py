import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from donatex.models import User

# Update the full name
u = User.objects.get(email='soosannasubodh61@gmail.com')
u.full_name = 'Soosanna Subodh'
u.save()

print(f"✅ Updated full name to: {u.full_name}")
