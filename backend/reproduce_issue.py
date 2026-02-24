import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.test import Client
from rest_framework.test import APIClient
from donatex.models import User, NGO
from django.contrib.auth.hashers import make_password

# Clean up previous test data if needed
User.objects.filter(email='ngotest@test.com').delete()

# Create test NGO user
user = User.objects.create(
    full_name='Test NGO User',
    email='ngotest@test.com',
    password=make_password('password123'),
    role='ngo'
)

# Create NGO profile
ngo = NGO.objects.create(
    user=user,
    name='Test NGO',
    description='Test Description',
    category='Health'
)

print(f"Created NGO User ID: {user.id}")
print(f"Created NGO Profile ID: {ngo.id}")

from donatex.models import Donation
Donation.objects.create(
    donor=user,
    ngo=ngo,
    type="money",
    amount=500.00,
    items=None
)
print("Created a test donation.")

client = APIClient()

# Login to get token
login_resp = client.post('/api/login/', {
    'email': 'ngotest@test.com',
    'password': 'password123'
}, format='json')

if login_resp.status_code != 200:
    print("Login failed!")
    print(login_resp.json())
    exit(1)

token = login_resp.json()['access_token']
print(f"Got token: {token[:20]}...")

# Call the failing endpoint
print("\nCalling /api/ngo/donations/...")
resp = client.get(
    '/api/ngo/donations/',
    HTTP_AUTHORIZATION=f'Bearer {token}'
)

print(f"Status: {resp.status_code}")
if resp.status_code == 200:
    print("Response JSON keys:", resp.json().keys())
    print("Donations type:", type(resp.json()['donations']))
else:
    print("Response:", resp.json())
