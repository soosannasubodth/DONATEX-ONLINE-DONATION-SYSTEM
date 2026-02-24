import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from donatex.models import User

print("Connecting to MySQL database...")
try:
    users = User.objects.all()
    print(f"\n✅ MySQL Connection Successful!")
    print(f"\nTotal users in MySQL: {len(users)}")
    print("\nUsers:")
    for u in users:
        print(f"  {u.id}: {u.email} (Role: {u.role})")
except Exception as e:
    print(f"\n❌ Connection Error: {str(e)}")
    import traceback
    traceback.print_exc()
