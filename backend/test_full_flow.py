import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.test import Client
from rest_framework.test import APIClient
from donatex.models import NGO, User
from django.contrib.auth.hashers import make_password

# Clear and create test data
print("=" * 60)
print("SETTING UP TEST DATA")
print("=" * 60)

# Create NGO user if not exists
ngo_user, created = User.objects.get_or_create(
    email='ngo@test.com',
    defaults={
        'full_name': 'Test NGO',
        'password': make_password('password123'),
        'role': 'ngo',
        'organization_name': 'Test Organization',
        'registration_number': 'REG12345',
        'address': '123 Main St',
        'phone_number': '9876543210'
    }
)
print(f"NGO User: {ngo_user.email} (created={created})")

# Create approved NGO
ngo, created = NGO.objects.get_or_create(
    user=ngo_user,
    defaults={
        'name': 'Test Charity',
        'description': 'A test charity organization',
        'category': 'Health',
        'status': 'approved'
    }
)
print(f"NGO: {ngo.name} - Status: {ngo.status} (created={created})")

# Test API
client = APIClient()

# Test login
print("\n" + "=" * 60)
print("TESTING LOGIN")
print("=" * 60)

login_response = client.post('/api/login/', {
    'email': 'donor@test.com',
    'password': 'password123'
}, format='json')

print(f"Status: {login_response.status_code}")
if login_response.status_code == 200:
    data = login_response.json()
    print(f"✅ Login successful for {data['email']}")
    token = data['access_token']
    
    # Test NGO list
    print("\n" + "=" * 60)
    print("TESTING NGO LIST")
    print("=" * 60)
    
    ngo_list_response = client.get('/api/ngos/')
    print(f"Status: {ngo_list_response.status_code}")
    ngos = ngo_list_response.json()
    print(f"Number of NGOs: {len(ngos)}")
    if ngos:
        print(f"First NGO: {ngos[0]['name']}")
    
    # Test donation
    print("\n" + "=" * 60)
    print("TESTING DONATION")
    print("=" * 60)
    
    donation_response = client.post(
        '/api/donations/',
        {
            'ngo_id': ngo.id,
            'type': 'money',
            'amount': 100
        },
        format='json',
        HTTP_AUTHORIZATION=f'Bearer {token}'
    )
    
    print(f"Status: {donation_response.status_code}")
    if donation_response.status_code == 201:
        print(f"✅ Donation successful!")
        donation_data = donation_response.json()
        print(f"   Donation ID: {donation_data.get('id')}")
        print(f"   Amount: {donation_data.get('amount')}")
    else:
        print(f"❌ Error: {donation_response.json()}")
else:
    print(f"❌ Login failed: {login_response.json()}")

print("\n" + "=" * 60)
