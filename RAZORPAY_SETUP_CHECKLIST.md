# Razorpay Integration - Quick Setup Checklist

## ✅ Completed Implementation

- [x] Payment model created (`models.py`)
- [x] PaymentSerializer created (`serializers.py`)
- [x] Razorpay utility functions (`razorpay_utils.py`)
- [x] Payment endpoints created (`views.py`)
- [x] URL routes configured (`urls.py`)
- [x] Database migration created (`0013_payment.py`)
- [x] Razorpay credentials configured (`settings.py`)
- [x] Frontend Razorpay script added (`index.html`)
- [x] RazorpayPayment component created
- [x] DonorLanding.jsx updated with payment flow
- [x] CampaignDetail.jsx updated with payment flow
- [x] razorpay npm package installed

---

## 🚀 Immediate Next Steps (Required)

### Step 1: Apply Database Migration
```bash
cd backend
python manage.py migrate
```

### Step 2: Restart Django Server
```bash
cd backend
python manage.py runserver 8000
```

### Step 3: Verify Frontend Build
```bash
cd frontend
npm run dev
```

---

## 🧪 Quick Test

1. **Open browser**: http://localhost:5173
2. **Login as donor** (if not logged in)
3. **Click "❤️ Donate"** on any NGO
4. **Select "Money"** donation type
5. **Enter amount**: 50
6. **Click "Submit Donation"**
7. **Use test card**:
   - Number: `4111111111111111`
   - Expiry: `12/30`
   - CVV: `123`
8. **Verify success message** appears

---

## 📊 Test Credentials

- **API Key**: `rzp_test_SAVEMO1vSrEDwy`
- **Secret Key**: `FTwQkTtjMstXFdHWsbRQItgv`
- **Test Card**: `4111111111111111` (any future expiry, any CVV)

---

## 📁 Key Files Overview

| File | Purpose | Status |
|------|---------|--------|
| `models.py` | Payment database model | ✅ Created |
| `serializers.py` | Payment serializer | ✅ Created |
| `razorpay_utils.py` | Razorpay API utilities | ✅ Created |
| `views.py` | Payment endpoints | ✅ Created |
| `urls.py` | Payment routes | ✅ Updated |
| `settings.py` | Razorpay credentials | ✅ Configured |
| `0013_payment.py` | DB migration | ✅ Ready |
| `RazorpayPayment.jsx` | Payment component | ✅ Created |
| `DonorLanding.jsx` | NGO donation flow | ✅ Updated |
| `CampaignDetail.jsx` | Campaign payment flow | ✅ Updated |
| `index.html` | Razorpay script | ✅ Added |

---

## 🔍 Payment Flow Check

### Money Donation Flow:
```
Donor clicks Donate
    ↓
Selects Money type & amount
    ↓
Frontend calls /api/payments/create-order/
    ↓
Backend creates Razorpay order
    ↓
Razorpay Checkout opens
    ↓
Donor enters card details
    ↓
Frontend calls /api/payments/verify/
    ↓
Backend verifies signature
    ↓
Donation & Payment created
    ↓
Success message shown
```

### Item Donation Flow:
```
Donor clicks Donate
    ↓
Selects Item type & items
    ↓
Frontend calls /api/donations/ directly
    ↓
Donation created (NO PAYMENT)
    ↓
Success message shown
```

---

## ⚠️ Important Notes

1. **Migration Required**: Run `python manage.py migrate` before testing
2. **Test Mode Only**: Currently using test credentials
3. **Backend Access**: Donor must be authenticated to access payment endpoints
4. **Amount Format**: Always use decimal numbers (e.g., 50.00, 100.50)
5. **Currency**: Currently fixed to INR

---

## 📞 Troubleshooting Commands

### Check if razorpay is installed:
```bash
pip list | grep razorpay
```

### Check Django migration status:
```bash
python manage.py showmigrations donatex
```

### Run specific migration:
```bash
python manage.py migrate donatex 0013
```

### View payment data:
```bash
python manage.py shell
>>> from donatex.models import Payment
>>> Payment.objects.all()
```

---

## 🎉 Success Indicators

✅ Migration applied without errors
✅ Server starts without import errors
✅ Razorpay script loads (check browser console)
✅ Donate button opens payment modal
✅ Test payment completes successfully
✅ Payment record created in database
✅ Donation record created linked to payment

---

## 🔐 Security Checklist

- [x] Signature verification implemented
- [x] Amount validation on backend
- [x] User authentication required
- [x] CSRF protection enabled
- [x] Error messages don't leak sensitive data
- [ ] HTTPS enabled (for production)
- [ ] Production keys configured (for production)

---

## 📝 Additional Features (Ready for Implementation)

These features are architecturally ready, just need frontend UI:
- Payment history view
- Refund requests
- Payment receipts/invoices
- Payment status notifications
- Bulk payment operations

---

## 🚨 If Something Goes Wrong

1. **Check Django logs** for detailed error messages
2. **Check browser console** (F12) for JavaScript errors
3. **Verify Razorpay credentials** in `settings.py`
4. **Ensure database migration** was applied
5. **Check CORS settings** if getting CORS errors
6. **Restart both servers** after any code changes

---

**Last Updated**: February 2, 2026
**Status**: ✅ Ready for Testing
**Next Phase**: Production Deployment
