import razorpay
import hmac
import hashlib
from django.conf import settings
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.exceptions import AuthenticationFailed
from .models import CampaignParticipation, Donation, User, Campaign, NGO
from .views import get_user_from_token

# Initialize Razorpay client
client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))

@api_view(['POST'])
def create_order(request):
    """
    Create a Razorpay order for payment
    Expected payload: { amount: number, currency: string (default: INR) }
    """
    try:
        user_id = get_user_from_token(request)
    except AuthenticationFailed as e:
        return Response({"detail": str(e)}, status=401)

    try:
        amount = int(float(request.data.get('amount', 0)) * 100)  # Convert to paise
        currency = request.data.get('currency', 'INR')

        if amount <= 0:
            return Response({"detail": "Invalid amount"}, status=400)

        # Create Razorpay order
        order_data = {
            'amount': amount,
            'currency': currency,
            'payment_capture': 1  # Auto capture
        }

        order = client.order.create(data=order_data)

        return Response({
            'order_id': order['id'],
            'amount': order['amount'],
            'currency': order['currency'],
            'key_id': settings.RAZORPAY_KEY_ID
        })

    except Exception as e:
        return Response({'detail': str(e)}, status=500)


@api_view(['POST'])
def verify_payment(request):
    """
    Verify Razorpay payment and create donation/participation record
    Expected payload: {
        razorpay_order_id: string,
        razorpay_payment_id: string,
        razorpay_signature: string,
        donation_type: 'campaign' | 'direct',
        campaign_id: number (if campaign),
        ngo_id: number (if direct),
        participation_type: string (for campaign),
        items_description: string (optional)
    }
    """
    try:
        user_id = get_user_from_token(request)
    except AuthenticationFailed as e:
        return Response({"detail": str(e)}, status=401)

    try:
        # Get payment details
        razorpay_order_id = request.data.get('razorpay_order_id')
        razorpay_payment_id = request.data.get('razorpay_payment_id')
        razorpay_signature = request.data.get('razorpay_signature')

        # Verify signature
        generated_signature = hmac.new(
            settings.RAZORPAY_KEY_SECRET.encode(),
            f"{razorpay_order_id}|{razorpay_payment_id}".encode(),
            hashlib.sha256
        ).hexdigest()

        if generated_signature != razorpay_signature:
            return Response({"detail": "Payment verification failed"}, status=400)

        # Fetch payment details from Razorpay
        payment = client.payment.fetch(razorpay_payment_id)
        amount = float(payment['amount']) / 100  # Convert from paise to rupees

        # Get donation type
        donation_type = request.data.get('donation_type', 'direct')

        if donation_type == 'campaign':
            # Create campaign participation
            campaign_id = request.data.get('campaign_id')
            participation_type = request.data.get('participation_type', 'money')
            items_description = request.data.get('items_description')

            campaign = Campaign.objects.get(id=campaign_id)
            donor = User.objects.get(id=user_id)

            participation = CampaignParticipation.objects.create(
                campaign=campaign,
                donor=donor,
                participation_type=participation_type,
                amount=amount if participation_type == 'money' else None,
                items_description=items_description if participation_type == 'item' else None
            )

            return Response({
                "detail": "Payment verified and participation recorded",
                "participation_id": participation.id,
                "amount": float(participation.amount) if participation.amount else 0
            })

        else:
            # Create direct donation
            ngo_id = request.data.get('ngo_id')
            
            ngo = NGO.objects.get(id=ngo_id)
            donor = User.objects.get(id=user_id)

            donation = Donation.objects.create(
                donor=donor,
                ngo=ngo,
                type='money',
                amount=amount
            )

            return Response({
                "detail": "Payment verified and donation recorded",
                "donation_id": donation.id,
                "amount": float(donation.amount)
            })

    except Campaign.DoesNotExist:
        return Response({"detail": "Campaign not found"}, status=404)
    except NGO.DoesNotExist:
        return Response({"detail": "NGO not found"}, status=404)
    except User.DoesNotExist:
        return Response({"detail": "User not found"}, status=404)
    except Exception as e:
        return Response({"detail": str(e)}, status=500)
