#!/usr/bin/env python
import os
import django
import json
import requests

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from donatex.models import User

# Print existing users
print("=" * 60)
print("CHECKING EXISTING USERS IN DATABASE")
print("=" * 60)
users = User.objects.all()
if not users.exists():
    print("❌ No users found in database!")
else:
    for user in users:
        print(f"✅ {user.id}: {user.email} (Role: {user.role})")

print("\n" + "=" * 60)
print("TESTING LOGIN API")
print("=" * 60)

# Test login with first user if exists
if users.exists():
    test_user = users.first()
    print(f"\nTesting login with: {test_user.email}")
    
    try:
        response = requests.post(
            "http://127.0.0.1:8000/api/login/",
            json={"email": test_user.email, "password": "test123"}
        )
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
    except Exception as e:
        print(f"❌ Error: {e}")
else:
    print("⚠️ No users to test with. Creating a test user...")
    from django.contrib.auth.hashers import make_password
    
    test_user = User.objects.create(
        full_name="Test Donor",
        email="donor@test.com",
        password=make_password("test123"),
        role="donor"
    )
    print(f"✅ Created test user: {test_user.email}")
    
    # Now test login
    print("\nTesting login with newly created user...")
    try:
        response = requests.post(
            "http://127.0.0.1:8000/api/login/",
            json={"email": "donor@test.com", "password": "test123"}
        )
        print(f"Status Code: {response.status_code}")
        data = response.json()
        print(f"Response: {json.dumps(data, indent=2)}")
        
        if response.status_code == 200:
            print("\n✅ LOGIN SUCCESSFUL!")
            print(f"   Access Token: {data.get('access_token')[:50]}...")
            print(f"   User ID: {data.get('user_id')}")
            print(f"   Role: {data.get('role')}")
        else:
            print(f"\n❌ LOGIN FAILED: {data}")
    except Exception as e:
        print(f"❌ Error: {e}")

print("\n" + "=" * 60)
print("TESTING NGO LIST API")
print("=" * 60)

try:
    response = requests.get("http://127.0.0.1:8000/api/ngos/")
    print(f"Status Code: {response.status_code}")
    data = response.json()
    print(f"Number of NGOs: {len(data) if isinstance(data, list) else 'Error'}")
    if isinstance(data, list) and len(data) > 0:
        print(f"First NGO: {data[0]}")
    else:
        print(f"Response: {json.dumps(data, indent=2)}")
except Exception as e:
    print(f"❌ Error: {e}")

print("\n" + "=" * 60)
