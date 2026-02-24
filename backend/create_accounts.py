import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from donatex.models import User
from django.contrib.auth.hashers import make_password

# Create donor account
donor_user, created = User.objects.get_or_create(
    email='soosannasubodh61@gmail.com',
    defaults={
        'full_name': 'Soosa Subodh',
        'password': make_password('susu2005'),
        'role': 'donor'
    }
)

if created:
    print("✅ DONOR account created successfully!")
    print(f"   Email: {donor_user.email}")
    print(f"   Password: susu2005")
    print(f"   Role: {donor_user.role}")
else:
    print("❌ Account already exists")

# Create NGO account
ngo_user, created = User.objects.get_or_create(
    email='soosangouser@gmail.com',
    defaults={
        'full_name': 'Soosa NGO',
        'password': make_password('susu2005'),
        'role': 'ngo',
        'organization_name': 'Test NGO Organization',
        'registration_number': 'NGO12345',
        'address': '123 Main Street',
        'phone_number': '9876543210'
    }
)

if created:
    print("\n✅ NGO account created successfully!")
    print(f"   Email: {ngo_user.email}")
    print(f"   Password: susu2005")
    print(f"   Role: {ngo_user.role}")
else:
    print("\n❌ NGO account already exists")

# Create ADMIN account
admin_user, created = User.objects.get_or_create(
    email='soosaadmin@gmail.com',
    defaults={
        'full_name': 'Soosa Admin',
        'password': make_password('susu2005'),
        'role': 'admin'
    }
)

if created:
    print("\n✅ ADMIN account created successfully!")
    print(f"   Email: {admin_user.email}")
    print(f"   Password: susu2005")
    print(f"   Role: {admin_user.role}")
else:
    print("\n❌ Admin account already exists")

print("\n" + "="*60)
print("All accounts ready to login!")
print("="*60)
