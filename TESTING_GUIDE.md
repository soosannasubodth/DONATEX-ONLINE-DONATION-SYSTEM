# How to Test the Fixed Application

## Prerequisites

Make sure you have:
- Python 3.8+ installed
- Django running on `http://localhost:8000`
- All requirements installed

---

## Quick Start - Test Everything

### 1. Start the Django Server

```bash
cd backend
python manage.py runserver
```

You should see:
```
Starting development server at http://0.0.0.0:8000/
```

### 2. Run Automated Tests

In another terminal:

```bash
cd backend

# Test the complete flow (login -> NGO list -> donation)
python test_full_flow.py

# Test additional endpoints
python test_more_endpoints.py
```

Expected output:
```
✅ Login successful for donor@test.com
✅ Donation successful!
✅ User Profile: Test Donor (donor@test.com)
✅ Donations found: 1
```

---

## Manual Testing with Frontend

### 1. Start Frontend

```bash
cd frontend
npm run dev
```

Should show:
```
  VITE v5.x.x  ready in XXX ms

  ➜  Local:   http://localhost:5173/
```

### 2. Test in Browser

**Navigate to:** `http://localhost:5173/`

#### Step 1: Login
- Click "Sign In"
- Use credentials:
  - Email: `donor@test.com`
  - Password: `password123`
- You should see:
  - ✅ Redirect to home page
  - ✅ User menu shows "Test Donor"
  - ✅ No errors in console

#### Step 2: Browse NGOs
- Click on "Browse NGOs" or go to home
- You should see:
  - ✅ "Test Charity" NGO card appears
  - ✅ NGO shows as approved
  - ✅ Can click to view details

#### Step 3: Make a Donation
- Click "Donate" on Test Charity NGO
- Choose donation type (Money or Item)
- Click submit
- You should see:
  - ✅ Success message appears
  - ✅ Modal closes
  - ✅ No errors in console

#### Step 4: View Your Donations
- Click "My Donations" (if available in donor dashboard)
- You should see:
  - ✅ Your donation appears in the list
  - ✅ Amount shows $100.00
  - ✅ NGO name shows "Test Charity"

---

## Detailed API Testing

### Test Login Endpoint

```bash
curl -X POST http://localhost:8000/api/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "donor@test.com",
    "password": "password123"
  }'
```

Expected response:
```json
{
  "message": "Login successful",
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "user_id": 1,
  "username": "Test Donor",
  "email": "donor@test.com",
  "role": "donor"
}
```

### Test NGO List Endpoint

```bash
curl http://localhost:8000/api/ngos/
```

Expected response:
```json
[
  {
    "id": 1,
    "name": "Test Charity",
    "description": "A test charity organization",
    "category": "Health",
    "status": "approved",
    "logo": null
  }
]
```

### Test Create Donation Endpoint

```bash
# First get a token from login
TOKEN="your_access_token_here"

curl -X POST http://localhost:8000/api/donations/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "ngo_id": 1,
    "type": "money",
    "amount": 500
  }'
```

Expected response (201):
```json
{
  "id": 2,
  "donor": 1,
  "ngo": 1,
  "type": "money",
  "amount": "500.00",
  "items": null,
  "created_at": "2026-02-02T12:00:00Z"
}
```

---

## What to Check for Errors

### 1. Browser Console (F12)
- Open DevTools
- Go to Console tab
- Should see NO errors (maybe warnings, but no reds)

### 2. Network Tab
- Open DevTools
- Go to Network tab
- Filter for "Fetch/XHR"
- All API calls should return 200, 201, or 404 (not 500)

### 3. Django Server Console
- Should see HTTP requests with status codes
- No 500 errors
- If there's a 500 error, the traceback will appear here

---

## Troubleshooting

### Problem: "Login failed - Invalid credentials"

**Solution:**
- Make sure you're using: `donor@test.com` / `password123`
- Check database: `python manage.py shell`
  ```python
  from donatex.models import User
  User.objects.all()  # Should show at least 2 users
  ```

### Problem: "NGO not found" when trying to donate

**Solution:**
- Ensure test NGO was created
- Check: `python test_full_flow.py`
- This script creates the test NGO automatically

### Problem: "CSRF token missing"

**Solution:**
- This should NOT happen - login endpoint has `@csrf_exempt`
- If it does, check CORS settings in `settings.py`

### Problem: Donation endpoint returns 500 error

**Solution:**
- Check Django console for the full error
- Most likely: NGO ID doesn't exist
- Use: `python test_full_flow.py` to verify

---

## Success Criteria ✅

You'll know everything is working when:

- [ ] Login returns tokens with user_id claim
- [ ] NGO list returns the Test Charity NGO
- [ ] Can make a donation without errors
- [ ] Donation appears in "My Donations"
- [ ] No 500 errors in Django console
- [ ] No red errors in browser console
- [ ] All API responses have proper status codes

---

## Common Commands

```bash
# Check for database errors
cd backend
python manage.py check

# Create fresh test data
python test_full_flow.py

# Run server with verbose output
python manage.py runserver --verbosity 2

# Clear and reinitialize database
python manage.py flush --no-input
python manage.py migrate
```

---

## Questions?

If something doesn't work:
1. Check the error message (it's now more descriptive)
2. Look at the DEBUGGING_REPORT.md for technical details
3. Check the Django console output
4. Verify test data exists with test_full_flow.py

Good luck! 🚀
