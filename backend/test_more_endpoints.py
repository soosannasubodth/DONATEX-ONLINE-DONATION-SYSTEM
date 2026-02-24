import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()
from rest_framework.test import APIClient
import json

client = APIClient()

# Test user profile endpoint
token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzg1NTY1NDgyLCJpYXQiOjE3NzAwMTM0ODIsImp0aSI6IjU2ZjljY2I5YzMzYTQyOTQ5ZDYzYmQ0ZjBiZjQ2YjkwIiwidXNlcl9pZCI6MX0.nciHfNQZ1DCByQBJ1awCNSDEZamnbtsc4_yMC7f5hXk'

print("=" * 60)
print("TESTING USER PROFILE ENDPOINT")
print("=" * 60)

response = client.get('/api/users/me/', HTTP_AUTHORIZATION=f'Bearer {token}')
print(f'Status: {response.status_code}')
if response.status_code == 200:
    data = response.json()
    print(f'✅ User Profile: {data["full_name"]} ({data["email"]})')
else:
    print(f'Response: {json.dumps(response.json(), indent=2)}')

print("\n" + "=" * 60)
print("TESTING MY DONATIONS ENDPOINT")
print("=" * 60)

response = client.get('/api/my-donations/', HTTP_AUTHORIZATION=f'Bearer {token}')
print(f'Status: {response.status_code}')
if response.status_code == 200:
    data = response.json()
    print(f'✅ Donations found: {len(data)}')
    if data:
        print(f'First donation: {data[0]}')
else:
    print(f'Response: {json.dumps(response.json(), indent=2)}')

print("\n" + "=" * 60)
