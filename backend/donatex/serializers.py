from rest_framework import serializers
from django.conf import settings
from .models import User
from .models import NGO  
from .models import Donation

from .models import UtilizationReport, ReportProof
from .models import SiteSetting
from .models import NGOPhoto, NGO
from .models import Announcement
from .models import Ticket, TicketMessage
from .models import Campaign, CampaignParticipation

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'full_name', 'email', 'password', 'role',
            'organization_name', 'registration_number', 'address', 'phone_number'
        ]
class NGOSerializer(serializers.ModelSerializer):
    logo = serializers.SerializerMethodField()

    class Meta:
        model = NGO
        fields = ["id", "name", "description", "category", "logo", "status", "created_at"]

    def get_logo(self, obj):
        if not obj.logo:
            return None

        # ensure no stray whitespace/newlines
        try:
            url = obj.logo.url
        except Exception:
            url = str(obj.logo)

        # remove leading/trailing and any internal whitespace/newlines
        url = "".join(url.split())

        # If serializer context contains request, build absolute URI
        request = self.context.get("request")
        if request:
            return url if url.startswith("http") else request.build_absolute_uri(url)

        # Fallback: prefix with MEDIA_URL if relative
        return url if url.startswith("http") else str(settings.MEDIA_URL).rstrip("/") + url
 
class DonationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Donation
        fields = "__all__"

class DonorDonationListSerializer(serializers.ModelSerializer):
    ngo_name = serializers.CharField(source="ngo.name", read_only=True)

    class Meta:
        model = Donation
        fields = [
            "id",
            "ngo_name",
            "type",
            "amount",
            "items",
            "created_at",
        ]


class ReportProofSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = ReportProof
        fields = ["id", "file", "file_url", "caption", "uploaded_at"]

    def get_file_url(self, obj):
        try:
            request = self.context.get("request")
            return request.build_absolute_uri(obj.file.url) if request else str(obj.file.url)
        except Exception:
            return str(obj.file)


class UtilizationReportSerializer(serializers.ModelSerializer):
    proofs = ReportProofSerializer(many=True, read_only=True)
    donation_id = serializers.IntegerField(source="donation.id", read_only=True)

    class Meta:
        model = UtilizationReport
        fields = ["id", "donation", "donation_id", "title", "description", "amount_used", "items_used", "status", "created_at", "verified_by", "verified_at", "proofs"]


class SiteSettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteSetting
        fields = ['id', 'site_title', 'default_currency', 'registration_open', 'require_ngo_approval', 'updated_at']


class NGOPhotoSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = NGOPhoto
        fields = ['id', 'image', 'image_url', 'caption', 'uploaded_at']

    def get_image_url(self, obj):
        try:
            request = self.context.get('request')
            return request.build_absolute_uri(obj.image.url) if request else str(obj.image.url)
        except Exception:
            return str(obj.image)


class NGODetailSerializer(serializers.ModelSerializer):
    logo = serializers.SerializerMethodField()
    photos = NGOPhotoSerializer(many=True, read_only=True)

    class Meta:
        model = NGO
        fields = ['id', 'name', 'description', 'about', 'category', 'logo', 'status', 'created_at', 'photos']

    def get_logo(self, obj):
        if not obj.logo:
            return None
        try:
            request = self.context.get('request')
            return request.build_absolute_uri(obj.logo.url) if request else str(obj.logo.url)
        except Exception:
            return str(obj.logo)


class AnnouncementSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    ngo_name = serializers.CharField(source='ngo.name', read_only=True, required=False)

    class Meta:
        model = Announcement
        fields = ['id', 'ngo', 'ngo_name', 'title', 'description', 'image', 'image_url', 'created_at']

    def get_image_url(self, obj):
        if not obj.image:
            return None
        try:
            request = self.context.get('request')
            return request.build_absolute_uri(obj.image.url) if request else str(obj.image.url)
        except Exception:
            return str(obj.image)


class TicketMessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.full_name', read_only=True)
    attachment_url = serializers.SerializerMethodField()

    class Meta:
        model = TicketMessage
        fields = ['id', 'ticket', 'sender', 'sender_name', 'message', 'attachment', 'attachment_url', 'created_at']

    def get_attachment_url(self, obj):
        try:
            request = self.context.get('request')
            return request.build_absolute_uri(obj.attachment.url) if obj.attachment and request else (str(obj.attachment) if obj.attachment else None)
        except Exception:
            return str(obj.attachment) if obj.attachment else None


class TicketSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ticket
        fields = ['id', 'user', 'ngo', 'title', 'description', 'status', 'created_at']


class TicketDetailSerializer(serializers.ModelSerializer):
    messages = TicketMessageSerializer(many=True, read_only=True)
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    ngo_name = serializers.CharField(source='ngo.name', read_only=True)

    class Meta:
        model = Ticket
        fields = ['id', 'user', 'user_name', 'ngo', 'ngo_name', 'title', 'description', 'status', 'created_at', 'messages']


class CampaignParticipationSerializer(serializers.ModelSerializer):
    donor_name = serializers.CharField(source='donor.full_name', read_only=True)
    campaign_id = serializers.ReadOnlyField(source='campaign.id')
    campaign_title = serializers.ReadOnlyField(source='campaign.title')
    ngo_name = serializers.ReadOnlyField(source='campaign.ngo.name')

    class Meta:
        model = CampaignParticipation
        fields = [
            'id', 'donor', 'donor_name', 'campaign', 'campaign_id', 'campaign_title', 
            'ngo_name', 'participation_type', 'amount', 'items_description', 'participated_at'
        ]


class CampaignSerializer(serializers.ModelSerializer):
    ngo_name = serializers.CharField(source='ngo.name', read_only=True)
    image_url = serializers.SerializerMethodField()
    participant_count = serializers.SerializerMethodField()
    total_amount_raised = serializers.SerializerMethodField()

    class Meta:
        model = Campaign
        fields = ['id', 'ngo', 'ngo_name', 'title', 'description', 'goal_amount', 'goal_items', 'image', 'image_url', 'status', 'start_date', 'end_date', 'created_at', 'approved_by', 'approved_at', 'participant_count', 'total_amount_raised']

    def get_image_url(self, obj):
        if not obj.image:
            return None
        try:
            request = self.context.get('request')
            return request.build_absolute_uri(obj.image.url) if request else str(obj.image.url)
        except Exception:
            return str(obj.image)

    def get_participant_count(self, obj):
        return obj.participants.count()

    def get_total_amount_raised(self, obj):
        from django.db.models import Sum
        total = obj.participants.filter(participation_type='money').aggregate(Sum('amount'))['amount__sum'] or 0
        return float(total)


class CampaignDetailSerializer(serializers.ModelSerializer):
    ngo_name = serializers.CharField(source='ngo.name', read_only=True)
    image_url = serializers.SerializerMethodField()
    participants = CampaignParticipationSerializer(many=True, read_only=True)
    participant_count = serializers.SerializerMethodField()
    total_amount_raised = serializers.SerializerMethodField()
    approved_by_name = serializers.CharField(source='approved_by.full_name', read_only=True, required=False)

    class Meta:
        model = Campaign
        fields = ['id', 'ngo', 'ngo_name', 'title', 'description', 'goal_amount', 'goal_items', 'image', 'image_url', 'status', 'start_date', 'end_date', 'created_at', 'approved_by', 'approved_by_name', 'approved_at', 'participants', 'participant_count', 'total_amount_raised']

    def get_image_url(self, obj):
        if not obj.image:
            return None
        try:
            request = self.context.get('request')
            return request.build_absolute_uri(obj.image.url) if request else str(obj.image.url)
        except Exception:
            return str(obj.image)

    def get_participant_count(self, obj):
        return obj.participants.count()

    def get_total_amount_raised(self, obj):
        from django.db.models import Sum
        total = obj.participants.filter(participation_type='money').aggregate(Sum('amount'))['amount__sum'] or 0
        return float(total)

