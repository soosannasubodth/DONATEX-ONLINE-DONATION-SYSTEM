import json
import re
import jwt

from django.http import JsonResponse
from django.db import IntegrityError
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt

from django.contrib.auth.hashers import make_password, check_password

from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.decorators import api_view, authentication_classes
from rest_framework.response import Response
from rest_framework.exceptions import AuthenticationFailed

from .models import User, NGO
from .serializers import NGOSerializer
from .models import Donation, CampaignParticipation
from django.db.models import Sum, Q, Count
from datetime import datetime
from .serializers import DonationSerializer
from .serializers import DonorDonationListSerializer
from .serializers import UtilizationReportSerializer, ReportProofSerializer
from .models import UtilizationReport, ReportProof
from .models import SiteSetting
from .serializers import SiteSettingSerializer
from .models import NGOPhoto, NGO
from .serializers import NGODetailSerializer
from .models import Announcement
from .serializers import AnnouncementSerializer
from django.utils import timezone
from .models import Ticket, TicketMessage, OTP
from .serializers import TicketSerializer, TicketDetailSerializer, TicketMessageSerializer
from .models import Campaign, CampaignParticipation, Subscriber
from .serializers import CampaignSerializer, CampaignDetailSerializer, CampaignParticipationSerializer
from rest_framework.decorators import permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated

import random
from django.core.mail import send_mail



# ------------------------
# REGISTER
# ------------------------
@csrf_exempt
def register(request):
    if request.method != "POST":
        return JsonResponse({"message": "Invalid request method"}, status=405)

    try:
        data = json.loads(request.body)

        full_name = data.get("full_name", "").strip()
        email = data.get("email", "").strip()
        password = data.get("password", "")
        role = data.get("role", "donor")

        organization_name = data.get("organization_name", "")
        registration_number = data.get("registration_number", "")
        address = data.get("address", "")
        phone_number = data.get("phone_number", "")

        if not full_name or not email or not password:
            return JsonResponse({"message": "All required fields must be filled"}, status=400)

        if not re.match(r'^[A-Z]', full_name):
            return JsonResponse({"message": "Full name must start with a capital letter"}, status=400)

        if len(password) < 6:
            return JsonResponse({"message": "Password must be at least 6 characters long"}, status=400)

        if User.objects.filter(email=email).exists():
            return JsonResponse({"message": "Email already registered"}, status=400)

        if role == "ngo":
            if not all([organization_name, registration_number, address, phone_number]):
                return JsonResponse({"message": "All NGO fields are required"}, status=400)

        password_hashed = make_password(password)

        User.objects.create(
            full_name=full_name,
            email=email,
            password=password_hashed,
            role=role,
            organization_name=organization_name if role == "ngo" else "",
            registration_number=registration_number if role == "ngo" else "",
            address=address if role == "ngo" else "",
            phone_number=phone_number if role == "ngo" else ""
        )

        return JsonResponse({"message": "Registration successful"}, status=201)

    except IntegrityError:
        return JsonResponse({"message": "Email already exists"}, status=400)
    except Exception as e:
        return JsonResponse({"message": str(e)}, status=500)


# ------------------------
# EMAIL AJAX CHECK
# ------------------------
def check_email(request):
    if request.method != "GET":
        return JsonResponse({"exists": False}, status=405)

    email = request.GET.get("email", "").strip()
    if not email:
        return JsonResponse({"exists": False})

    exists = User.objects.filter(email=email).exists()
    return JsonResponse({"exists": exists})


# ------------------------
# LOGIN
# ------------------------
@csrf_exempt
def login_view(request):
    if request.method != "POST":
        return JsonResponse({"message": "Invalid request method"}, status=405)

    try:
        data = json.loads(request.body)
        email = data.get("email", "").strip()
        password = data.get("password", "")

        if not email or not password:
            return JsonResponse({"message": "Email and password are required"}, status=400)

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return JsonResponse({"message": "Invalid email or password"}, status=401)

        if not check_password(password, user.password):
            return JsonResponse({"message": "Invalid email or password"}, status=401)

        # ✅ Create tokens with proper user_id claim
        try:
            refresh = RefreshToken.for_user(user)
            # Ensure user_id is in the token payload
            refresh['user_id'] = user.id
            access_token = refresh.access_token
            access_token['user_id'] = user.id
        except Exception as token_error:
            # Fallback: manually create a simple JWT token
            import jwt
            from datetime import datetime, timedelta
            
            payload = {
                'user_id': user.id,
                'email': user.email,
                'iat': datetime.utcnow(),
                'exp': datetime.utcnow() + timedelta(days=180)
            }
            access_token = jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')
            refresh_token = jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')
            
            return JsonResponse({
                "message": "Login successful",
                "access_token": access_token,
                "refresh_token": refresh_token,
                "user_id": user.id,
                "username": user.full_name,
                "email": user.email,
                "role": user.role
            }, status=200)

        return JsonResponse({
            "message": "Login successful",
            "access_token": str(access_token),
            "refresh_token": str(refresh),
            "user_id": user.id,
            "username": user.full_name,
            "email": user.email,
            "role": user.role
        }, status=200)

    except Exception as e:
        import traceback
        traceback.print_exc()
        return JsonResponse({"message": str(e)}, status=500)


# ------------------------
# TOKEN VALIDATION (HELPER)
# ------------------------
def get_user_from_token(request):
    auth_header = request.headers.get("Authorization")

    if not auth_header or not auth_header.startswith("Bearer "):
        raise AuthenticationFailed("Token missing")

    token = auth_header.split(" ")[1]

    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=["HS256"]
        )
    except jwt.ExpiredSignatureError:
        raise AuthenticationFailed("Token expired")
    except jwt.InvalidTokenError:
        raise AuthenticationFailed("Invalid token")

    user_id = payload.get("user_id")

    if not user_id:
        raise AuthenticationFailed("Invalid token payload")

    return user_id


# ------------------------
# LIST NGOs (BROWSE NGOs)
# ------------------------
@api_view(["GET"])
@authentication_classes([])   # disable DRF auth
def list_ngos(request):
    # ✅ Only return approved NGOs for public listing
    ngos = NGO.objects.filter(status="approved")
    serializer = NGOSerializer(ngos, many=True, context={"request": request})
    return Response(serializer.data)


@api_view(["GET"])
@authentication_classes([])
def admin_list_pending_ngos(request):
    try:
        user_id = get_user_from_token(request)
    except AuthenticationFailed as e:
        return Response({"detail": str(e)}, status=401)

    try:
        admin_user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({"detail": "Unauthorized"}, status=403)

    if admin_user.role != "admin":
        return Response({"detail": "Forbidden"}, status=403)

    ngos = NGO.objects.filter(status="pending").order_by("created_at")
    serializer = NGOSerializer(ngos, many=True, context={"request": request})
    return Response(serializer.data)


@api_view(["POST"])
@authentication_classes([])
def admin_change_ngo_status(request, ngo_id):
    # body should contain: {"status": "approved"} or "rejected"
    try:
        user_id = get_user_from_token(request)
    except AuthenticationFailed as e:
        return Response({"detail": str(e)}, status=401)

    try:
        admin_user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({"detail": "Unauthorized"}, status=403)

    if admin_user.role != "admin":
        return Response({"detail": "Forbidden"}, status=403)

    try:
        ngo = NGO.objects.get(id=ngo_id)
    except NGO.DoesNotExist:
        return Response({"detail": "NGO not found"}, status=404)

    new_status = request.data.get("status")
    if new_status not in ["approved", "rejected", "pending"]:
        return Response({"detail": "Invalid status"}, status=400)

    ngo.status = new_status
    ngo.save()

    return Response({"message": "NGO status updated", "ngo": NGOSerializer(ngo, context={"request": request}).data})

@api_view(["POST"])
@authentication_classes([])
def create_donation(request):
    try:
        user_id = get_user_from_token(request)
    except AuthenticationFailed as e:
        return Response({"detail": str(e)}, status=401)
    
    data = request.data

    ngo_id = data.get("ngo_id")
    donation_type = data.get("type")   # ✅ FIXED
    amount = data.get("amount")
    items = data.get("items")

    if donation_type not in ["money", "item"]:
        return Response({"message": "Invalid donation type"}, status=400)
    
    # ✅ Validate that NGO exists
    try:
        ngo = NGO.objects.get(id=ngo_id)
    except NGO.DoesNotExist:
        return Response({"detail": "NGO not found"}, status=404)

    try:
        donation = Donation.objects.create(
            donor_id=user_id,
            ngo_id=ngo_id,
            type=donation_type,   # ✅ FIXED
            amount=amount if donation_type == "money" else None,
            items=items if donation_type == "item" else None,
        )
        return Response(DonationSerializer(donation).data, status=201)
    except IntegrityError as e:
        return Response({"detail": f"Failed to create donation: {str(e)}"}, status=400)
    except Exception as e:
        return Response({"detail": f"Error: {str(e)}"}, status=500)
@api_view(["GET"])
@authentication_classes([])
def donor_my_donations(request):
    try:
        user_id = get_user_from_token(request)
    except AuthenticationFailed as e:
        return Response({"detail": str(e)}, status=401)

    donations = Donation.objects.filter(
        donor_id=user_id
    ).order_by("-created_at")

    serializer = DonorDonationListSerializer(donations, many=True)
    return Response(serializer.data)

@api_view(["GET"])
@authentication_classes([])
def ngo_donations(request):
    try:
        user_id = get_user_from_token(request)
    except AuthenticationFailed as e:
        return Response({"detail": str(e)}, status=401)
    try:
        ngo_user = User.objects.get(id=user_id, role="ngo")
    except User.DoesNotExist:
        return Response({"detail": "Unauthorized"}, status=403)

    # find the NGO profile belonging to this user
    ngo = NGO.objects.filter(user=ngo_user).first()
    if not ngo:
        return Response({"detail": "NGO profile not found"}, status=404)

    # base queryset
    donations_qs = Donation.objects.filter(ngo=ngo).order_by("-created_at")

    # optional filters: donor (name or id), start_date, end_date
    donor = request.query_params.get("donor") if hasattr(request, "query_params") else request.GET.get("donor")
    donor_id = request.query_params.get("donor_id") if hasattr(request, "query_params") else request.GET.get("donor_id")
    start_date = request.query_params.get("start_date") if hasattr(request, "query_params") else request.GET.get("start_date")
    end_date = request.query_params.get("end_date") if hasattr(request, "query_params") else request.GET.get("end_date")

    if donor_id:
        donations_qs = donations_qs.filter(donor_id=donor_id)
    elif donor:
        donations_qs = donations_qs.filter(donor__full_name__icontains=donor)

    # parse dates if provided (expecting YYYY-MM-DD)
    if start_date:
        try:
            sd = datetime.strptime(start_date, "%Y-%m-%d")
            donations_qs = donations_qs.filter(created_at__date__gte=sd.date())
        except ValueError:
            return Response({"detail": "Invalid start_date format. Use YYYY-MM-DD."}, status=400)

    if end_date:
        try:
            ed = datetime.strptime(end_date, "%Y-%m-%d")
            donations_qs = donations_qs.filter(created_at__date__lte=ed.date())
        except ValueError:
            return Response({"detail": "Invalid end_date format. Use YYYY-MM-DD."}, status=400)

    # totals
    total_count = donations_qs.count()
    agg = donations_qs.aggregate(total_amount=Sum('amount'))
    total_amount = agg.get('total_amount') or 0

    data = []
    for d in donations_qs:
        data.append({
            "id": d.id,
            "donor_name": d.donor.full_name,
            "donor_id": d.donor.id,
            "type": d.type,
            "amount": float(d.amount) if d.amount is not None else None,
            "items": d.items,
            "payment_method": "N/A",
            "created_at": d.created_at,
        })

    return Response({
        "totals": {"count": total_count, "total_amount": float(total_amount)},
        "donations": data
    })


@api_view(["POST"])
@authentication_classes([])
def create_report(request):
    """NGO creates a utilization report for a donation (multipart/form-data)
    Expected fields: donation_id, title, description, amount_used (optional), items_used (optional), proofs[] files
    """
    try:
        user_id = get_user_from_token(request)
    except AuthenticationFailed as e:
        return Response({"detail": str(e)}, status=401)

    try:
        ngo_user = User.objects.get(id=user_id, role="ngo")
    except User.DoesNotExist:
        return Response({"detail": "Unauthorized"}, status=403)

    donation_id = request.data.get("donation_id")
    title = request.data.get("title")
    description = request.data.get("description")
    amount_used = request.data.get("amount_used")
    items_used = request.data.get("items_used")

    if not donation_id or not title or not description:
        return Response({"detail": "donation_id, title and description are required"}, status=400)

    try:
        donation = Donation.objects.get(id=donation_id, ngo__user=ngo_user)
    except Donation.DoesNotExist:
        return Response({"detail": "Donation not found or not owned by this NGO"}, status=404)

    report = UtilizationReport.objects.create(
        donation=donation,
        title=title,
        description=description,
        amount_used=amount_used if amount_used else None,
        items_used=items_used if items_used else None,
    )

    # handle proof files
    files = request.FILES.getlist("proofs") if hasattr(request, "FILES") else []
    for f in files:
        ReportProof.objects.create(report=report, file=f)

    return Response(UtilizationReportSerializer(report, context={"request": request}).data, status=201)


@api_view(["GET"])
@authentication_classes([])
def ngo_reports(request):
    try:
        user_id = get_user_from_token(request)
    except AuthenticationFailed as e:
        return Response({"detail": str(e)}, status=401)

    try:
        ngo_user = User.objects.get(id=user_id, role="ngo")
    except User.DoesNotExist:
        return Response({"detail": "Unauthorized"}, status=403)

    reports = UtilizationReport.objects.filter(donation__ngo__user=ngo_user).order_by("-created_at")
    serializer = UtilizationReportSerializer(reports, many=True, context={"request": request})
    return Response(serializer.data)


@api_view(["GET"])
@authentication_classes([])
def pending_reports(request):
    try:
        user_id = get_user_from_token(request)
    except AuthenticationFailed as e:
        return Response({"detail": str(e)}, status=401)

    try:
        admin_user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({"detail": "Unauthorized"}, status=403)

    if admin_user.role != "admin":
        return Response({"detail": "Forbidden"}, status=403)

    reports = UtilizationReport.objects.filter(status="pending").order_by("created_at")
    serializer = UtilizationReportSerializer(reports, many=True, context={"request": request})
    return Response(serializer.data)


@api_view(["POST"])
@authentication_classes([])
def verify_report(request, report_id):
    try:
        user_id = get_user_from_token(request)
    except AuthenticationFailed as e:
        return Response({"detail": str(e)}, status=401)

    try:
        admin_user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({"detail": "Unauthorized"}, status=403)

    if admin_user.role != "admin":
        return Response({"detail": "Forbidden"}, status=403)

    try:
        report = UtilizationReport.objects.get(id=report_id)
    except UtilizationReport.DoesNotExist:
        return Response({"detail": "Report not found"}, status=404)

    action = request.data.get("action")  # expected: 'verify' or 'reject'
    if action not in ["verify", "reject"]:
        return Response({"detail": "Invalid action"}, status=400)

    if action == "verify":
        report.status = "verified"
        report.verified_by = admin_user
        report.verified_at = timezone.now()
    else:
        report.status = "rejected"

    report.save()
    return Response(UtilizationReportSerializer(report, context={"request": request}).data)


@api_view(["GET"])
@authentication_classes([])
def verified_reports(request):
    reports = UtilizationReport.objects.filter(status="verified").order_by("-verified_at")
    serializer = UtilizationReportSerializer(reports, many=True, context={"request": request})
    return Response(serializer.data)


@api_view(["GET"])
@authentication_classes([])
def ngo_verified_reports(request):
    """NGO sees their own verified reports"""
    try:
        user_id = get_user_from_token(request)
    except AuthenticationFailed as e:
        return Response({"detail": str(e)}, status=401)

    try:
        ngo_user = User.objects.get(id=user_id, role="ngo")
    except User.DoesNotExist:
        return Response({"detail": "Unauthorized"}, status=403)

    reports = UtilizationReport.objects.filter(
        donation__ngo__user=ngo_user,
        status="verified"
    ).order_by("-verified_at")
    serializer = UtilizationReportSerializer(reports, many=True, context={"request": request})
    return Response(serializer.data)


@api_view(["GET"])
@authentication_classes([])
def donation_reports(request, donation_id):
    """Donor sees reports for their specific donation"""
    try:
        user_id = get_user_from_token(request)
    except AuthenticationFailed as e:
        return Response({"detail": str(e)}, status=401)

    try:
        donation = Donation.objects.get(id=donation_id, donor_id=user_id)
    except Donation.DoesNotExist:
        return Response({"detail": "Donation not found or not owned by you"}, status=404)

    reports = UtilizationReport.objects.filter(
        donation=donation,
        status="verified"
    ).order_by("-verified_at")
    serializer = UtilizationReportSerializer(reports, many=True, context={"request": request})
    return Response(serializer.data)


@api_view(["GET", "POST"])   # ✅ CHANGED: allow GET + POST
def ngo_profile_submit_or_update(request):
    # 1️⃣ Authenticate user
    try:
        user_id = get_user_from_token(request)
    except AuthenticationFailed as e:
        return Response({"detail": str(e)}, status=401)

    # 2️⃣ Ensure user is NGO
    try:
        user = User.objects.get(id=user_id, role="ngo")
    except User.DoesNotExist:
        return Response(
            {"message": "Only NGO users can submit profile"},
            status=403
        )

    # =======================
    # ✅ GET: FETCH NGO PROFILE
    # =======================
    if request.method == "GET":
        ngo = NGO.objects.filter(user=user).first()

        if not ngo:
            return Response(
                {"message": "NGO profile not found"},
                status=404
            )

        return Response(
            NGOSerializer(ngo, context={"request": request}).data,
            status=200
        )

    # =======================
    # POST: CREATE / UPDATE (YOUR ORIGINAL LOGIC)
    # =======================
    data = request.data

    # 3️⃣ Validate required fields
    name = data.get("name")
    description = data.get("description")
    category = data.get("category")
    logo = request.FILES.get("logo")

    if not name or not description or not category:
        return Response(
            {"message": "Name, description and category are required"},
            status=400
        )

    # 4️⃣ Check if NGO profile already exists for this user
    ngo = NGO.objects.filter(user=user).first()

    if ngo:
        # 🔁 UPDATE FLOW
        ngo.name = name
        ngo.description = description
        ngo.category = category
        if logo:
            ngo.logo = logo
        ngo.status = "pending"   # re-approval required
        ngo.save()

        return Response(
            {
                "message": "NGO profile updated and sent for approval",
                "ngo": NGOSerializer(ngo, context={"request": request}).data
            },
            status=200
        )

    else:
        # 🆕 CREATE FLOW
        ngo = NGO.objects.create(
            user=user,
            name=name,
            description=description,
            category=category,
            logo=logo,
            status="pending"
        )

        return Response(
            {
                "message": "NGO profile submitted successfully",
                "ngo": NGOSerializer(ngo, context={"request": request}).data
            },
            status=201
        )


@api_view(["GET", "PATCH"])
@authentication_classes([])
def user_profile(request):
    """Get or update logged-in user profile"""
    try:
        user_id = get_user_from_token(request)
    except AuthenticationFailed as e:
        return Response({"detail": str(e)}, status=401)

    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({"detail": "User not found"}, status=404)

    if request.method == "GET":
        return Response({
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "role": user.role,
            "address": user.address,
            "phone_number": user.phone_number,
            "organization_name": user.organization_name,
            "registration_number": user.registration_number,
            "created_at": user.created_at,
        })

    # PATCH - update profile
    data = request.data
    if "full_name" in data:
        user.full_name = data["full_name"]
    if "email" in data:
        if User.objects.filter(email=data["email"]).exclude(id=user.id).exists():
            return Response({"detail": "Email already in use"}, status=400)
        user.email = data["email"]
    if "password" in data and len(data["password"]) >= 6:
        user.password = make_password(data["password"])
    if "address" in data:
        user.address = data["address"]
    if "phone_number" in data:
        user.phone_number = data["phone_number"]
    if user.role == "ngo":
        if "organization_name" in data:
            user.organization_name = data["organization_name"]
        if "registration_number" in data:
            user.registration_number = data["registration_number"]

    user.save()
    return Response({
        "message": "Profile updated successfully",
        "id": user.id,
        "full_name": user.full_name,
        "email": user.email,
        "role": user.role,
    })


@api_view(["GET"])
@authentication_classes([])
def list_users(request):
    """Admin lists all users"""
    try:
        user_id = get_user_from_token(request)
    except AuthenticationFailed as e:
        return Response({"detail": str(e)}, status=401)

    try:
        admin_user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({"detail": "Unauthorized"}, status=403)

    if admin_user.role != "admin":
        return Response({"detail": "Forbidden"}, status=403)

    # Optional filter by role
    role_filter = request.query_params.get("role") if hasattr(request, "query_params") else request.GET.get("role")
    
    users_qs = User.objects.all().order_by("-created_at")
    if role_filter:
        users_qs = users_qs.filter(role=role_filter)

    data = []
    for u in users_qs:
        data.append({
            "id": u.id,
            "full_name": u.full_name,
            "email": u.email,
            "role": u.role,
            "address": u.address,
            "organization_name": u.organization_name,
            "phone_number": u.phone_number,
            "created_at": u.created_at,
        })

    return Response(data)


@api_view(["PATCH", "DELETE"])
@authentication_classes([])
def manage_user(request, user_id):
    """Admin patches or deletes a user"""
    try:
        admin_id = get_user_from_token(request)
    except AuthenticationFailed as e:
        return Response({"detail": str(e)}, status=401)

    try:
        admin_user = User.objects.get(id=admin_id)
    except User.DoesNotExist:
        return Response({"detail": "Unauthorized"}, status=403)

    if admin_user.role != "admin":
        return Response({"detail": "Forbidden"}, status=403)

    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({"detail": "User not found"}, status=404)

    if request.method == "DELETE":
        user.delete()
        return Response({"message": "User deleted successfully"})

    # PATCH
    data = request.data
    if "full_name" in data:
        user.full_name = data["full_name"]
    if "email" in data:
        if User.objects.filter(email=data["email"]).exclude(id=user.id).exists():
            return Response({"detail": "Email already in use"}, status=400)
        user.email = data["email"]
    if "role" in data and data["role"] in ["donor", "ngo", "admin"]:
        user.role = data["role"]
    if "address" in data:
        user.address = data["address"]
    if "phone_number" in data:
        user.phone_number = data["phone_number"]

    user.save()
    return Response({
        "message": "User updated successfully",
        "id": user.id,
        "full_name": user.full_name,
        "email": user.email,
        "role": user.role,
        "address": user.address,
        "phone_number": user.phone_number,
        "organization_name": user.organization_name,
    })


@api_view(["GET"])
@authentication_classes([])
def admin_stats(request):
    """Return donation statistics and NGO performance for admins"""
    try:
        user_id = get_user_from_token(request)
    except AuthenticationFailed as e:
        return Response({"detail": str(e)}, status=401)

    try:
        admin_user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({"detail": "Unauthorized"}, status=403)

    if admin_user.role != "admin":
        return Response({"detail": "Forbidden"}, status=403)

    # --- 1. Overall Aggregates (Donations + CampaignParticipations) ---
    # Direct Donations
    d_count = Donation.objects.count()
    d_money_sum = Donation.objects.filter(type='money').aggregate(s=Sum('amount'))['s'] or 0
    d_money_count = Donation.objects.filter(type='money').count()
    d_item_count = Donation.objects.filter(type='item').count()

    # Campaign Participations
    cp_count = CampaignParticipation.objects.count()
    cp_money_sum = CampaignParticipation.objects.filter(participation_type='money').aggregate(s=Sum('amount'))['s'] or 0
    cp_money_count = CampaignParticipation.objects.filter(participation_type='money').count()
    cp_item_count = CampaignParticipation.objects.filter(participation_type='item').count()

    # Combined Totals
    total_donations = d_count + cp_count
    total_money = float(d_money_sum) + float(cp_money_sum)
    money_count = d_money_count + cp_money_count
    item_count = d_item_count + cp_item_count

    # --- 2. Dashboard Specific Counts ---
    total_donors = User.objects.filter(role='donor').count()
    total_ngos = NGO.objects.count() # All NGOs
    pending_ngo_profiles = NGO.objects.filter(status='pending').count()
    pending_campaigns = Campaign.objects.filter(status='pending').count()
    # Support Stats - Only count tickets where the last message is NOT from an admin
    open_tickets_qs = Ticket.objects.filter(status='open')
    actionable_tickets_count = 0
    for ticket in open_tickets_qs:
        last_msg = TicketMessage.objects.filter(ticket=ticket).order_by('-created_at').first()
        if last_msg:
            if last_msg.sender.role != 'admin':
                actionable_tickets_count += 1
        else:
            actionable_tickets_count += 1
    open_tickets = actionable_tickets_count

    # --- 3. Per-NGO Aggregates ---
    ngo_stats = {}

    # Donations per NGO
    d_qs = Donation.objects.values('ngo__id', 'ngo__name').annotate(
        count=Count('id'),
        total=Sum('amount')
    )
    for item in d_qs:
        nid = item['ngo__id']
        name = item['ngo__name']
        val = float(item['total'] or 0)
        c = item['count']
        ngo_stats[nid] = {
            'ngo_id': nid,
            'ngo_name': name,
            'donation_count': c,
            'total_amount': val
        }

    # Campaign Participations per NGO (via Campaign)
    cp_qs = CampaignParticipation.objects.values('campaign__ngo__id', 'campaign__ngo__name').annotate(
        count=Count('id'),
        total=Sum('amount')
    )
    for item in cp_qs:
        nid = item['campaign__ngo__id']
        name = item['campaign__ngo__name']
        val = float(item['total'] or 0)
        c = item['count']

        if nid in ngo_stats:
            ngo_stats[nid]['donation_count'] += c
            ngo_stats[nid]['total_amount'] += val
        else:
            nid_key = nid if nid else f"unknown_{random.randint(1000,9999)}"
            ngo_stats[nid_key] = {
                'ngo_id': nid,
                'ngo_name': name or "Unknown NGO",
                'donation_count': c,
                'total_amount': val
            }

    per_ngo = list(ngo_stats.values())
    per_ngo.sort(key=lambda x: x['total_amount'], reverse=True)

    # --- 4. Monthly Buckets ---
    now = timezone.now()
    monthly = []
    for i in range(11, -1, -1):
        month_dt = now.replace(day=1)
        year = month_dt.year
        month = month_dt.month - i
        while month <= 0:
            month += 12
            year -= 1
        
        start = datetime(year, month, 1)
        if month == 12:
            end = datetime(year + 1, 1, 1)
        else:
            end = datetime(year, month + 1, 1)

        d_agg = Donation.objects.filter(created_at__gte=start, created_at__lt=end).aggregate(
            s=Sum('amount'), c=Count('id')
        )
        # Use participated_at for CampaignParticipation
        cp_agg = CampaignParticipation.objects.filter(participated_at__gte=start, participated_at__lt=end).aggregate(
            s=Sum('amount'), c=Count('id')
        )

        d_amt = d_agg.get('s') or 0
        d_cnt = d_agg.get('c') or 0
        cp_amt = cp_agg.get('s') or 0
        cp_cnt = cp_agg.get('c') or 0

        monthly.append({
            'month': f"{year}-{month:02d}",
            'label': start.strftime('%b %Y'),
            'donation_count': d_cnt + cp_cnt,
            'total_amount': float(d_amt) + float(cp_amt),
        })

    return Response({
        # Fields for AdminDashboard
        'total_donors': total_donors,
        'total_ngos': total_ngos,
        'total_money': total_money,
        'total_items': item_count,
        'pending_ngo_profiles': pending_ngo_profiles,
        'pending_campaigns': pending_campaigns,
        'open_tickets': open_tickets,

        # Fields for Statistics Page
        'totals': {
            'total_donations': total_donations,
            'total_money_amount': total_money,
            'money_count': money_count,
            'item_count': item_count,
        },
        'per_ngo': per_ngo,
        'monthly': monthly,
    })


@api_view(["GET"])
@authentication_classes([])
def get_ngo_detail(request, ngo_id):
    """Public endpoint: return detailed NGO profile including photos"""
    try:
        ngo = NGO.objects.get(id=ngo_id, status='approved')
    except NGO.DoesNotExist:
        return Response({'detail': 'NGO not found'}, status=404)

    serializer = NGODetailSerializer(ngo, context={'request': request})
    return Response(serializer.data)


@api_view(["GET", "PATCH"])
@authentication_classes([])
def admin_settings(request):
    try:
        user_id = get_user_from_token(request)
    except AuthenticationFailed as e:
        return Response({"detail": str(e)}, status=401)

    try:
        admin_user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({"detail": "Unauthorized"}, status=403)

    if admin_user.role != "admin":
        return Response({"detail": "Forbidden"}, status=403)

    # Ensure there's a single SiteSetting row. Create if missing.
    setting = SiteSetting.objects.first()
    if not setting:
        setting = SiteSetting.objects.create()

    if request.method == "GET":
        return Response(SiteSettingSerializer(setting).data)

    # PATCH - update allowed fields
    data = request.data
    for key in ["site_title", "default_currency", "registration_open", "require_ngo_approval"]:
        if key in data:
            setattr(setting, key, data[key])
    setting.save()
    return Response(SiteSettingSerializer(setting).data)


# ========================
# ANNOUNCEMENTS ENDPOINTS
# ========================

@api_view(["POST", "GET"])
@authentication_classes([])
def admin_announcements(request):
    """Admin: Create and list announcements"""
    try:
        user_id = get_user_from_token(request)
    except AuthenticationFailed as e:
        return Response({"detail": str(e)}, status=401)

    try:
        admin_user = User.objects.get(id=user_id, role="admin")
    except User.DoesNotExist:
        return Response({"detail": "Unauthorized"}, status=403)

    if request.method == "POST":
        try:
            # Create announcement
            data = request.data
            ngo_id = data.get("ngo_id")
            title = data.get("title", "").strip()
            description = data.get("description", "").strip()
            
            if not title or not description:
                return Response({"detail": "Title and description are required"}, status=400)

            # Handle image from FILES
            image = None
            if hasattr(request, "FILES") and "image" in request.FILES:
                image = request.FILES["image"]

            announcement = Announcement.objects.create(
                ngo_id=ngo_id if ngo_id else None,
                title=title,
                description=description,
                image=image
            )

            return Response(AnnouncementSerializer(announcement, context={"request": request}).data, status=201)
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({"detail": f"Error creating announcement: {str(e)}"}, status=500)

    # GET - list all announcements
    announcements = Announcement.objects.all().order_by("-created_at")
    serializer = AnnouncementSerializer(announcements, many=True, context={"request": request})
    return Response(serializer.data)


# ------------------------
# SUPPORT TICKETS
# ------------------------


@api_view(["POST"])
@authentication_classes([])
def create_ticket(request):
    """Donor or NGO creates a support ticket"""
    try:
        user_id = get_user_from_token(request)
    except AuthenticationFailed as e:
        return Response({"detail": str(e)}, status=401)

    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({"detail": "Unauthorized"}, status=403)

    if user.role not in ["donor", "ngo"]:
        return Response({"detail": "Only donors or NGOs can create tickets"}, status=403)

    title = request.data.get("title", "").strip()
    description = request.data.get("description", "").strip()
    ngo_id = request.data.get("ngo_id")

    if not title or not description:
        return Response({"detail": "Title and description are required"}, status=400)

    # If an NGO user creates the ticket, attach their NGO profile if present
    ngo_obj = None
    if user.role == "ngo":
        ngo_obj = NGO.objects.filter(user=user).first()
    elif ngo_id:
        ngo_obj = NGO.objects.filter(id=ngo_id).first()

    ticket = Ticket.objects.create(user=user, ngo=ngo_obj, title=title, description=description)
    return Response(TicketSerializer(ticket).data, status=201)


@api_view(["GET"])
@authentication_classes([])
def my_tickets(request):
    """List tickets for the logged-in donor/NGO"""
    try:
        user_id = get_user_from_token(request)
    except AuthenticationFailed as e:
        return Response({"detail": str(e)}, status=401)

    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({"detail": "Unauthorized"}, status=403)

    if user.role not in ["donor", "ngo"]:
        return Response({"detail": "Only donors or NGOs can view their tickets"}, status=403)

    tickets = Ticket.objects.filter(user=user).order_by("-created_at")
    return Response(TicketSerializer(tickets, many=True).data)


@api_view(["GET"])
@authentication_classes([])
def admin_list_tickets(request):
    """Admin: list all tickets"""
    try:
        user_id = get_user_from_token(request)
    except AuthenticationFailed as e:
        return Response({"detail": str(e)}, status=401)

    try:
        admin_user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({"detail": "Unauthorized"}, status=403)

    if admin_user.role != "admin":
        return Response({"detail": "Forbidden"}, status=403)

    tickets = Ticket.objects.all().order_by("-created_at")
    return Response(TicketSerializer(tickets, many=True).data)


@api_view(["GET"])
@authentication_classes([])
def ticket_detail(request, ticket_id):
    """Return ticket with messages. Accessible to ticket owner or admin."""
    try:
        user_id = get_user_from_token(request)
    except AuthenticationFailed as e:
        return Response({"detail": str(e)}, status=401)

    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({"detail": "Unauthorized"}, status=403)

    try:
        ticket = Ticket.objects.get(id=ticket_id)
    except Ticket.DoesNotExist:
        return Response({"detail": "Ticket not found"}, status=404)

    if user.role != "admin" and ticket.user_id != user.id:
        return Response({"detail": "Forbidden"}, status=403)

    serializer = TicketDetailSerializer(ticket, context={"request": request})
    return Response(serializer.data)


@api_view(["POST"])
@authentication_classes([])
def admin_post_ticket_message(request, ticket_id):
    """Admin posts a reply message to a ticket (only admin can reply)."""
    try:
        user_id = get_user_from_token(request)
    except AuthenticationFailed as e:
        return Response({"detail": str(e)}, status=401)

    try:
        admin_user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({"detail": "Unauthorized"}, status=403)

    if admin_user.role != "admin":
        return Response({"detail": "Forbidden"}, status=403)

    try:
        ticket = Ticket.objects.get(id=ticket_id)
    except Ticket.DoesNotExist:
        return Response({"detail": "Ticket not found"}, status=404)

    message_text = request.data.get("message", "").strip()
    attachment = None
    if hasattr(request, "FILES") and "attachment" in request.FILES:
        attachment = request.FILES["attachment"]

    if not message_text and not attachment:
        return Response({"detail": "Message text or attachment required"}, status=400)

    msg = TicketMessage.objects.create(ticket=ticket, sender=admin_user, message=message_text, attachment=attachment)

    # ensure ticket is open when admin replies
    if ticket.status != "open":
        ticket.status = "open"
        ticket.save()

    return Response(TicketMessageSerializer(msg, context={"request": request}).data, status=201)


@api_view(["PATCH"])
@authentication_classes([])
def admin_update_ticket_status(request, ticket_id):
    """Admin changes ticket status (open/closed)"""
    try:
        user_id = get_user_from_token(request)
    except AuthenticationFailed as e:
        return Response({"detail": str(e)}, status=401)

    try:
        admin_user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({"detail": "Unauthorized"}, status=403)

    if admin_user.role != "admin":
        return Response({"detail": "Forbidden"}, status=403)

    try:
        ticket = Ticket.objects.get(id=ticket_id)
    except Ticket.DoesNotExist:
        return Response({"detail": "Ticket not found"}, status=404)

    new_status = request.data.get("status")
    if new_status not in ["open", "closed"]:
        return Response({"detail": "Invalid status"}, status=400)

    ticket.status = new_status
    ticket.save()
    return Response(TicketSerializer(ticket).data)


@api_view(["GET"])
@authentication_classes([])
def donor_announcements(request):
    """Donors: Get announcements (all announcements visible to donors)"""
    try:
        user_id = get_user_from_token(request)
        # Verify user is a donor
        donor_user = User.objects.get(id=user_id, role="donor")
    except AuthenticationFailed:
        # No token or invalid token - return empty list instead of error
        return Response([])
    except User.DoesNotExist:
        # Token exists but user is not a donor - return empty list
        return Response([])

    # Get all announcements (not tied to specific NGO)
    announcements = Announcement.objects.filter(ngo__isnull=True).order_by("-created_at")

    serializer = AnnouncementSerializer(announcements, many=True, context={"request": request})
    return Response(serializer.data)


@api_view(["GET"])
@authentication_classes([])
def ngo_announcements(request):
    """NGOs: Get announcements for their NGO"""
    try:
        user_id = get_user_from_token(request)
        ngo_user = User.objects.get(id=user_id, role="ngo")
    except AuthenticationFailed:
        # No token or invalid token - return empty list instead of error
        return Response([])
    except User.DoesNotExist:
        # Token exists but user is not an NGO - return empty list
        return Response([])

    # Get the NGO profile for this user
    ngo = NGO.objects.filter(user=ngo_user).first()
    if not ngo:
        return Response([])

    # Get announcements for this specific NGO or general announcements
    announcements = Announcement.objects.filter(
        Q(ngo__isnull=True) | Q(ngo=ngo)
    ).order_by("-created_at")

    serializer = AnnouncementSerializer(announcements, many=True, context={"request": request})
    return Response(serializer.data)


# ------------------------
# CAMPAIGNS
# ------------------------


@api_view(["POST"])
@authentication_classes([])
def ngo_create_campaign(request):
    """NGO creates a new campaign"""
    try:
        user_id = get_user_from_token(request)
    except AuthenticationFailed as e:
        return Response({"detail": str(e)}, status=401)

    try:
        ngo_user = User.objects.get(id=user_id, role="ngo")
    except User.DoesNotExist:
        return Response({"detail": "Unauthorized"}, status=403)

    ngo = NGO.objects.filter(user=ngo_user).first()
    if not ngo:
        return Response({"detail": "NGO profile not found"}, status=404)

    title = request.data.get("title", "").strip()
    description = request.data.get("description", "").strip()
    goal_amount = request.data.get("goal_amount")
    goal_items = request.data.get("goal_items")
    start_date = request.data.get("start_date")
    end_date = request.data.get("end_date")
    image = request.FILES.get("image") if hasattr(request, "FILES") else None

    if not all([title, description, start_date, end_date]):
        return Response({"detail": "Title, description, start_date, and end_date are required"}, status=400)

    campaign = Campaign.objects.create(
        ngo=ngo,
        title=title,
        description=description,
        goal_amount=goal_amount if goal_amount else None,
        goal_items=goal_items if goal_items else None,
        image=image,
        start_date=start_date,
        end_date=end_date,
        status="pending"
    )

    return Response(CampaignSerializer(campaign, context={"request": request}).data, status=201)


@api_view(["GET"])
@authentication_classes([])
def ngo_list_campaigns(request):
    """NGO lists their own campaigns"""
    try:
        user_id = get_user_from_token(request)
    except AuthenticationFailed as e:
        return Response({"detail": str(e)}, status=401)

    try:
        ngo_user = User.objects.get(id=user_id, role="ngo")
    except User.DoesNotExist:
        return Response({"detail": "Unauthorized"}, status=403)

    ngo = NGO.objects.filter(user=ngo_user).first()
    if not ngo:
        return Response({"detail": "NGO profile not found"}, status=404)

    campaigns = Campaign.objects.filter(ngo=ngo).order_by("-created_at")
    return Response(CampaignSerializer(campaigns, many=True, context={"request": request}).data)


@api_view(["GET"])
@authentication_classes([])
def admin_list_pending_campaigns(request):
    """Admin lists pending campaigns for approval"""
    try:
        user_id = get_user_from_token(request)
    except AuthenticationFailed as e:
        return Response({"detail": str(e)}, status=401)

    try:
        admin_user = User.objects.get(id=user_id, role="admin")
    except User.DoesNotExist:
        return Response({"detail": "Unauthorized"}, status=403)

    campaigns = Campaign.objects.filter(status="pending").order_by("created_at")
    return Response(CampaignSerializer(campaigns, many=True, context={"request": request}).data)


@api_view(["POST"])
@authentication_classes([])
def admin_approve_campaign(request, campaign_id):
    """Admin approves or rejects a campaign"""
    try:
        user_id = get_user_from_token(request)
    except AuthenticationFailed as e:
        return Response({"detail": str(e)}, status=401)

    try:
        admin_user = User.objects.get(id=user_id, role="admin")
    except User.DoesNotExist:
        return Response({"detail": "Unauthorized"}, status=403)

    try:
        campaign = Campaign.objects.get(id=campaign_id)
    except Campaign.DoesNotExist:
        return Response({"detail": "Campaign not found"}, status=404)

    action = request.data.get("action")  # 'approve' or 'reject'
    if action not in ["approve", "reject"]:
        return Response({"detail": "Invalid action"}, status=400)

    if action == "approve":
        campaign.status = "approved"
        campaign.approved_by = admin_user
        campaign.approved_at = timezone.now()
    else:
        campaign.status = "rejected"

    campaign.save()
    return Response(CampaignSerializer(campaign, context={"request": request}).data)


@api_view(["GET"])
@authentication_classes([])
def donor_list_campaigns(request):
    """Donors see approved/active campaigns"""
    campaigns = Campaign.objects.filter(status__in=["approved", "active"]).order_by("-created_at")
    return Response(CampaignSerializer(campaigns, many=True, context={"request": request}).data)


@api_view(["GET"])
@authentication_classes([])
def campaign_detail(request, campaign_id):
    """View campaign details with participants"""
    try:
        campaign = Campaign.objects.get(id=campaign_id, status__in=["approved", "active"])
    except Campaign.DoesNotExist:
        return Response({"detail": "Campaign not found"}, status=404)

    return Response(CampaignDetailSerializer(campaign, context={"request": request}).data)


@api_view(["POST"])
@authentication_classes([])
def donor_participate_campaign(request, campaign_id):
    """Donor participates/contributes to a campaign"""
    try:
        user_id = get_user_from_token(request)
    except AuthenticationFailed as e:
        return Response({"detail": str(e)}, status=401)

    try:
        donor_user = User.objects.get(id=user_id, role="donor")
    except User.DoesNotExist:
        return Response({"detail": "Unauthorized"}, status=403)

    try:
        campaign = Campaign.objects.get(id=campaign_id, status__in=["approved", "active"])
    except Campaign.DoesNotExist:
        return Response({"detail": "Campaign not found"}, status=404)

    participation_type = request.data.get("participation_type")  # 'money' or 'item'
    amount = request.data.get("amount")
    items_description = request.data.get("items_description")

    if participation_type not in ["money", "item"]:
        return Response({"detail": "Invalid participation type"}, status=400)

    participation = CampaignParticipation.objects.create(
        campaign=campaign,
        donor=donor_user,
        participation_type=participation_type,
        amount=amount if participation_type == "money" else None,
        items_description=items_description if participation_type == "item" else None
    )

    return Response(CampaignParticipationSerializer(participation).data, status=201)


@api_view(["GET"])
@authentication_classes([])
def donor_my_participations(request):
    """Donor lists their campaign participations"""
    try:
        user_id = get_user_from_token(request)
    except AuthenticationFailed as e:
        return Response({"detail": str(e)}, status=401)

    try:
        donor_user = User.objects.get(id=user_id, role="donor")
    except User.DoesNotExist:
        return Response({"detail": "Unauthorized"}, status=403)

    participations = CampaignParticipation.objects.filter(donor=donor_user).order_by("-participated_at")
    return Response(CampaignParticipationSerializer(participations, many=True).data)

@api_view(["GET"])
@authentication_classes([])
def donor_stats(request):
    """Get summarized statistics for the donor dashboard"""
    try:
        user_id = get_user_from_token(request)
    except AuthenticationFailed as e:
        return Response({"detail": str(e)}, status=401)

    try:
        donor_user = User.objects.get(id=user_id, role="donor")
    except User.DoesNotExist:
        return Response({"detail": "Unauthorized"}, status=403)

    # 1. Total Donated (Money only)
    total_donated = Donation.objects.filter(donor=donor_user, type='money').aggregate(Sum('amount'))['amount__sum'] or 0
    
    # 2. Item Donations Count
    total_items = Donation.objects.filter(donor=donor_user, type='item').count()
    
    # 3. Active Campaigns (Status is 'approved' in DB)
    active_campaigns = Campaign.objects.filter(status='approved').count()
    
    # 4. Verified Impact Reports
    impact_reports = UtilizationReport.objects.filter(donation__donor=donor_user, status='verified').count()
    
    # 5. Participations
    participations = CampaignParticipation.objects.filter(donor=donor_user).count()

    return Response({
        "total_donated": float(total_donated),
        "total_items": total_items,
        "active_campaigns": active_campaigns,
        "impact_reports": impact_reports,
        "participations": participations
    })

@api_view(["GET"])
@authentication_classes([])
def ngo_stats(request):
    """Get summarized statistics for the NGO dashboard"""
    try:
        user_id = get_user_from_token(request)
    except AuthenticationFailed as e:
        return Response({"detail": str(e)}, status=401)

    try:
        ngo_user = User.objects.get(id=user_id, role="ngo")
    except User.DoesNotExist:
        return Response({"detail": "Unauthorized"}, status=403)

    # 1. Total Donations (Money only)
    total_money = Donation.objects.filter(ngo__user=ngo_user, type='money').aggregate(Sum('amount'))['amount__sum'] or 0
    
    # 2. Item Donations Count
    total_items = Donation.objects.filter(ngo__user=ngo_user, type='item').count()
    
    # 3. Active Campaigns (Status is 'approved' or 'active')
    active_campaigns = Campaign.objects.filter(ngo__user=ngo_user, status__in=['approved', 'active']).count()
    
    # 4. Pending Reports
    pending_reports = UtilizationReport.objects.filter(donation__ngo__user=ngo_user, status='pending').count()
    
    # 5. Verified Reports
    verified_reports = UtilizationReport.objects.filter(donation__ngo__user=ngo_user, status='verified').count()

    return Response({
        "total_money": float(total_money),
        "total_items": total_items,
        "active_campaigns": active_campaigns,
        "pending_reports": pending_reports,
        "verified_reports": verified_reports
    })



# ------------------------
# PASSWORD RESET (OTP)
# ------------------------
@api_view(['POST'])
@authentication_classes([])
def send_otp(request):
    email = request.data.get('email')
    if not email:
        return Response({"detail": "Email is required"}, status=400)
    
    try:
        User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({"detail": "User with this email does not exist"}, status=404)
    
    otp_code = str(random.randint(100000, 999999))
    OTP.objects.filter(email=email).delete() # Remove old OTPs
    OTP.objects.create(email=email, otp_code=otp_code)
    
    # Send email
    subject = "DonateX Password Reset OTP"
    message = f"Your OTP for password reset is: {otp_code}. It is valid for 10 minutes."
    try:
        send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [email])
    except Exception as e:
        return Response({"detail": f"Failed to send email: {str(e)}"}, status=500)
    
    return Response({"message": "OTP sent to your email"})

@api_view(['POST'])
@authentication_classes([])
def verify_otp(request):
    email = request.data.get('email')
    otp_code = request.data.get('otp')
    
    if not email or not otp_code:
        return Response({"detail": "Email and OTP are required"}, status=400)
    
    try:
        otp_entry = OTP.objects.get(email=email, otp_code=otp_code)
        # Check expiry (10 mins)
        if (timezone.now() - otp_entry.created_at).total_seconds() > 600:
            otp_entry.delete()
            return Response({"detail": "OTP has expired"}, status=400)
        
        return Response({"message": "OTP verified successfully"})
    except OTP.DoesNotExist:
        return Response({"detail": "Invalid OTP"}, status=400)

@api_view(['POST'])
@authentication_classes([])
def reset_password(request):
    email = request.data.get('email')
    otp_code = request.data.get('otp')
    new_password = request.data.get('new_password')
    
    if not email or not otp_code or not new_password:
        return Response({"detail": "Required fields missing"}, status=400)
    
    try:
        otp_entry = OTP.objects.get(email=email, otp_code=otp_code)
        if (timezone.now() - otp_entry.created_at).total_seconds() > 600:
            return Response({"detail": "OTP has expired"}, status=400)
        
        user = User.objects.get(email=email)
        user.password = make_password(new_password)
        user.save()
        
        otp_entry.delete() # Success, delete OTP
        return Response({"message": "Password reset successfully"})
    except (OTP.DoesNotExist, User.DoesNotExist):
        return Response({"detail": "Invalid request"}, status=400)


# ------------------------
# NEWSLETTER
# ------------------------
@api_view(['POST'])
@permission_classes([AllowAny])
def subscribe_newsletter(request):
    try:
        email = request.data.get('email')
        if not email:
            return Response({'error': 'Email is required'}, status=400)
        
        # Check if already subscribed
        if Subscriber.objects.filter(email=email).exists():
            return Response({'message': 'Already subscribed!'}, status=200)

        Subscriber.objects.create(email=email)
        return Response({'message': 'Successfully subscribed!'}, status=201)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
@authentication_classes([])
def admin_list_subscribers(request):
    # Verify admin role
    try:
        user_id = get_user_from_token(request)
        user = User.objects.get(id=user_id)
        if user.role != 'admin':
            return Response({'error': 'Unauthorized'}, status=403)
    except Exception:
        return Response({'error': 'Unauthorized'}, status=401)
    
    subscribers = Subscriber.objects.all().order_by('-subscribed_at')
    data = [
        {
            'id': sub.id,
            'email': sub.email,
            'subscribed_at': sub.subscribed_at
        } for sub in subscribers
    ]
    return Response(data)

