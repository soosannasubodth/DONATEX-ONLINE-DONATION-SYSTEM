import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.test import Client
from rest_framework.test import APIClient

client = APIClient()

# Test login first
print("=" * 60)
print("TESTING LOGIN")
print("=" * 60)

login_response = client.post('/api/login/', {
    'email': 'donor@test.com',
    'password': 'password123'
}, format='json')

print(f"Status: {login_response.status_code}")
data = login_response.json()
print(f"Response: {json.dumps(data, indent=2)}")

if login_response.status_code == 200:
    token = data['access_token']
    print(f"\n✅ Got token: {token[:50]}...")
    
    # Now test donation
    print("\n" + "=" * 60)
    print("TESTING DONATION (will fail because no NGO with ID 1)")
    print("=" * 60)
    
    donation_response = client.post(
        '/api/donations/',
        {
            'ngo_id': 1,
            'type': 'money',
            'amount': 100
        },
        format='json',
        HTTP_AUTHORIZATION=f'Bearer {token}'
    )
    
    print(f"Status: {donation_response.status_code}")
    print(f"Response: {json.dumps(donation_response.json(), indent=2)}")
