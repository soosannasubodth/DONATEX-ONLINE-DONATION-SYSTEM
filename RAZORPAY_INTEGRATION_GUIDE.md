# Razorpay Payment Integration - Complete Implementation Guide

## Overview
The Razorpay payment gateway has been successfully integrated into your Donate application. This guide explains the implementation and provides deployment instructions.

## Test Credentials
- **API Key ID**: `rzp_test_SAVEMO1vSrEDwy`
- **API Key Secret**: `FTwQkTtjMstXFdHWsbRQItgv`

---

## Backend Implementation

### 1. New Payment Model
**Location**: `backend/donatex/models.py`

The `Payment` model tracks all Razorpay transactions:
```python
class Payment(models.Model):
    razorpay_order_id = models.CharField(max_length=100, unique=True)
    razorpay_payment_id = models.CharField(max_length=100, null=True, blank=True)
    razorpay_signature = models.CharField(max_length=255, null=True, blank=True)
    payment_type = models.CharField(max_length=20, choices=[("donation", "NGO Donation"), ("campaign", "Campaign Participation")])
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=10, default="INR")
    status = models.CharField(max_length=20, choices=[("pending", "Pending"), ("completed", "Completed"), ("failed", "Failed"), ("cancelled", "Cancelled")])
    donation = models.ForeignKey(Donation, on_delete=models.CASCADE, null=True, blank=True, related_name='payments')
    campaign_participation = models.ForeignKey(CampaignParticipation, on_delete=models.CASCADE, null=True, blank=True, related_name='payments')
    donor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='payments')
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
```

### 2. Settings Configuration
**Location**: `backend/backend/settings.py`

Added Razorpay credentials:
```python
RAZORPAY_KEY_ID = 'rzp_test_SAVEMO1vSrEDwy'
RAZORPAY_KEY_SECRET = 'FTwQkTtjMstXFdHWsbRQItgv'
```

### 3. Razorpay Utilities
**Location**: `backend/donatex/razorpay_utils.py`

Helper functions for Razorpay API interactions:
- `create_razorpay_order()` - Creates a payment order
- `verify_razorpay_signature()` - Verifies payment signatures using HMAC-SHA256
- `get_payment_details()` - Retrieves payment information
- `capture_payment()` - Captures authorized payments
- `refund_payment()` - Processes refunds

### 4. Payment Endpoints
**Location**: `backend/donatex/views.py` & `backend/donatex/urls.py`

Two main endpoints:

#### a) Create Payment Order
**Endpoint**: `POST /api/payments/create-order/`

Request:
```json
{
  "amount": 100.50,
  "payment_type": "donation",
  "ngo_id": 1,
  "donation_type": "money",
  "items": null
}
```

Response:
```json
{
  "order_id": "order_xxxxx",
  "amount": 10050,
  "currency": "INR",
  "payment_id": 5,
  "key_id": "rzp_test_SAVEMO1vSrEDwy"
}
```

#### b) Verify Payment
**Endpoint**: `POST /api/payments/verify/`

Request:
```json
{
  "razorpay_order_id": "order_xxxxx",
  "razorpay_payment_id": "pay_xxxxx",
  "razorpay_signature": "signature_xxxxx",
  "payment_id": 5,
  "ngo_id": 1,
  "donation_type": "money"
}
```

Response (on success):
```json
{
  "success": true,
  "message": "Donation successful!",
  "donation_id": 42,
  "payment_status": "completed"
}
```

---

## Frontend Implementation

### 1. Razorpay Script
**Location**: `frontend/index.html`

Added Razorpay Checkout script:
```html
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
```

### 2. Reusable Payment Component
**Location**: `frontend/src/components/RazorpayPayment.jsx`

A React component that handles the payment flow for both donations and campaigns. It:
- Creates payment orders on backend
- Opens Razorpay Checkout modal
- Verifies payment signature
- Handles success/error callbacks

### 3. NGO Donation Flow
**Location**: `frontend/src/pages/DonorLanding.jsx`

Updated donation modal:
1. Donor selects "Money" or "Item" donation type
2. For money donations:
   - User enters amount
   - Clicking "Submit Donation" triggers `initiateRazorpayPayment()`
   - Payment gateway opens
   - On success: Donation created + payment recorded
3. For item donations:
   - No payment required
   - Direct donation creation

### 4. Campaign Participation Flow
**Location**: `frontend/src/pages/donor/CampaignDetail.jsx`

Updated participation form:
1. Donor selects "Money" or "Item" participation type
2. For money participation:
   - User enters amount
   - Clicking "Confirm" triggers `initiatePayment()`
   - Payment gateway opens
   - On success: Participation + payment recorded
3. For item participation:
   - Direct participation creation without payment

---

## Payment Flow Diagram

```
DONOR LANDING PAGE / CAMPAIGN DETAIL
         |
         v
    Select Amount
         |
         v
    Frontend creates payment order
         |
         v (POST /api/payments/create-order/)
    Backend creates Razorpay order
         |
         v
    Returns order_id, amount, key_id
         |
         v
    Frontend opens Razorpay Checkout
         |
         +--------> DONOR ENTERS CARD DETAILS <--------+
         |                                               |
         v (SUCCESS)                                     v (FAILURE)
    Payment verified by Razorpay                    Error shown to donor
         |
         v
    Frontend sends verification request
         |
         v (POST /api/payments/verify/)
    Backend verifies signature
         |
         v
    Backend creates Donation/Participation
    Records Payment with status="completed"
         |
         v
    Success message shown
```

---

## Setup Instructions

### 1. Apply Database Migration

Run the migration to add the Payment table:

```bash
cd backend
python manage.py migrate
# If using venv:
C:/Users/soosa/OneDrive/Desktop/Donate/.venv/Scripts/python.exe manage.py migrate
```

This will create the `payments` table with all necessary fields.

### 2. Verify Backend Configuration

Ensure Razorpay credentials are in `backend/backend/settings.py`:
```python
RAZORPAY_KEY_ID = 'rzp_test_SAVEMO1vSrEDwy'
RAZORPAY_KEY_SECRET = 'FTwQkTtjMstXFdHWsbRQItgv'
```

### 3. Verify Frontend Installation

Razorpay package is installed:
```bash
cd frontend
npm list razorpay
# Output should show: razorpay@2.0.0
```

### 4. Test the Integration

Start both servers:

**Backend**:
```bash
cd backend
python manage.py runserver 8000
```

**Frontend**:
```bash
cd frontend
npm run dev
```

---

## Testing the Payment Flow

### Test Scenario 1: NGO Donation
1. Visit landing page (http://localhost:5173)
2. Click "❤️ Donate" on any NGO
3. Select "Money" donation type
4. Enter amount: **50** (₹50)
5. Click "Submit Donation"
6. Use Razorpay test card:
   - **Card Number**: `4111111111111111`
   - **Expiry**: Any future date (e.g., 12/30)
   - **CVV**: Any 3 digits (e.g., 123)
7. Payment should be successful
8. Check "My Donations" to see the new donation

### Test Scenario 2: Campaign Participation
1. Go to Donor Dashboard → Campaigns
2. Click on any campaign → "Participate in Campaign"
3. Select "Donate Money"
4. Enter amount: **100** (₹100)
5. Click "Confirm"
6. Use test card details (same as above)
7. Payment should be successful
8. Check "My Participations" to see new entry

### Test Scenario 3: Item Donation (No Payment)
1. Click "❤️ Donate" on NGO
2. Select "Item" donation type
3. Describe items (e.g., "10 kg rice, 5 liters oil")
4. Click "Submit Donation"
5. **No payment page** - donation created directly
6. Success message displayed

---

## Key Features

✅ **Secure Payment Processing**
- HMAC-SHA256 signature verification
- PCI DSS compliant through Razorpay

✅ **Payment Status Tracking**
- Every payment recorded in database
- Link to donations and campaign participations
- Clear status indicators (pending/completed/failed)

✅ **Flexible Donation Types**
- Money donations require payment
- Item donations skip payment
- Both tracked separately

✅ **Test Mode**
- Using Razorpay test credentials
- Test cards available for testing
- No real transactions during testing

✅ **Error Handling**
- Clear error messages for users
- Graceful failure handling
- Transaction rollback on verification failure

✅ **User Feedback**
- Success alerts after payment
- Error alerts on failure
- Loading states during processing

---

## Production Deployment

Before going live:

### 1. Update Razorpay Credentials
```python
# In settings.py
RAZORPAY_KEY_ID = 'YOUR_PRODUCTION_KEY_ID'
RAZORPAY_KEY_SECRET = 'YOUR_PRODUCTION_KEY_SECRET'
```

### 2. Enable HTTPS
- All payment pages must use HTTPS
- Razorpay requires secure connections

### 3. Update CORS Settings
```python
CORS_ALLOWED_ORIGINS = [
    "https://yourdomain.com",  # Change from localhost
]
```

### 4. Database Backup
- Backup MySQL database before migration
- Keep backup of migration files

### 5. Test in Production Mode
- Test with production credentials
- Verify payment processing
- Check database updates

---

## Troubleshooting

### Issue: "Razorpay module not found"
**Solution**: Install razorpay package
```bash
pip install razorpay
```

### Issue: "Payment signature verification failed"
**Solution**: Ensure Razorpay secret key is correct in settings.py

### Issue: "Payment not creating donation"
**Solution**: Check backend logs for SQL errors. Ensure NGO/Campaign exists.

### Issue: "Checkout button not appearing"
**Solution**: Verify Razorpay script is loaded in index.html

### Issue: CORS errors
**Solution**: Add frontend URL to CORS_ALLOWED_ORIGINS in settings.py

---

## Files Modified/Created

### Backend
- ✅ `backend/donatex/models.py` - Added Payment model
- ✅ `backend/donatex/serializers.py` - Added PaymentSerializer
- ✅ `backend/donatex/views.py` - Added payment endpoints
- ✅ `backend/donatex/urls.py` - Added payment URLs
- ✅ `backend/donatex/razorpay_utils.py` - **[NEW]** Razorpay utility functions
- ✅ `backend/backend/settings.py` - Added Razorpay credentials
- ✅ `backend/donatex/migrations/0013_payment.py` - **[NEW]** Payment model migration

### Frontend
- ✅ `frontend/index.html` - Added Razorpay script
- ✅ `frontend/src/components/RazorpayPayment.jsx` - **[NEW]** Payment component
- ✅ `frontend/src/pages/DonorLanding.jsx` - Integrated payment flow
- ✅ `frontend/src/pages/donor/CampaignDetail.jsx` - Integrated payment flow
- ✅ `frontend/package.json` - razorpay package added

---

## Next Steps

1. **Apply Migration**:
   ```bash
   python manage.py migrate
   ```

2. **Restart Servers**:
   - Backend Django server
   - Frontend Vite dev server

3. **Test Payment Flow** (use scenarios above)

4. **Monitor Logs** for any issues

5. **Collect Feedback** from test users

6. **Deploy to Production** (with production credentials)

---

## Support & Resources

- **Razorpay Documentation**: https://razorpay.com/docs/
- **Test Payment Methods**: https://razorpay.com/docs/payments/test-handbook/
- **API Reference**: https://razorpay.com/docs/api/payments/

---

## Summary

✨ **Razorpay Payment Integration Complete!** ✨

Your donation platform now supports secure, seamless payment processing for:
- ✅ NGO donations (money only)
- ✅ Campaign participation (money only)
- ✅ Item donations (no payment required)

All payments are tracked in the database with full audit trail for donor and NGO transparency.
