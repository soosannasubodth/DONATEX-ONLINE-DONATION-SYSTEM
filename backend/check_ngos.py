import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from donatex.models import NGO

print("NGOs in database:")
for ngo in NGO.objects.all():
    print(f"  {ngo.id}: {ngo.name} - Status: {ngo.status}")

if not NGO.objects.exists():
    print("  ❌ No NGOs found in database!")
