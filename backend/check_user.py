import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from donatex.models import User

users = User.objects.all()
print(f"Total users in database: {len(users)}")
print("\nAll users:")
for u in users:
    print(f"  ID: {u.id}, Email: {u.email}, Role: {u.role}")

# Check if the specific email exists
target_email = "soosannasubodh61@gmail.com"
exists = User.objects.filter(email=target_email).exists()
print(f"\nDoes '{target_email}' exist? {exists}")

if not exists:
    print("\n⚠️ This email is NOT in the database!")
    print("You need to either:")
    print("  1. Register this email through the frontend")
    print("  2. Create it manually in the database")
