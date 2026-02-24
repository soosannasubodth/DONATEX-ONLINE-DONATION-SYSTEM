from django.db import models

class User(models.Model):
    full_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255)
    role = models.CharField(max_length=20)

    # NGO-specific fields
    organization_name = models.CharField(max_length=100, null=True, blank=True)
    registration_number = models.CharField(max_length=50, null=True, blank=True)
    address = models.CharField(max_length=255, null=True, blank=True)
    phone_number = models.CharField(max_length=20, null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'users'

    def __str__(self):
        return self.full_name
    
class NGO(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE
    )

    name = models.CharField(max_length=100)
    description = models.TextField()
    about = models.TextField(null=True, blank=True)
    category = models.CharField(max_length=100)
    logo = models.ImageField(upload_to="logos/", null=True, blank=True)
    # status can be 'pending', 'approved', or 'rejected'
    status = models.CharField(max_length=20, default="pending")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "ngos"


class NGOPhoto(models.Model):
    ngo = models.ForeignKey(NGO, on_delete=models.CASCADE, related_name='photos')
    image = models.ImageField(upload_to='ngo_photos/')
    caption = models.CharField(max_length=255, null=True, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'ngo_photos'


class Donation(models.Model):
    donor = models.ForeignKey(User, on_delete=models.CASCADE)
    ngo = models.ForeignKey(NGO, on_delete=models.CASCADE)
    type = models.CharField(max_length=10)   # ✅ FIXED (matches DB)
    amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    items = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "donations"


class UtilizationReport(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("verified", "Verified"),
        ("rejected", "Rejected"),
    ]

    donation = models.ForeignKey(Donation, on_delete=models.CASCADE, related_name="reports")
    title = models.CharField(max_length=200)
    description = models.TextField()
    amount_used = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    items_used = models.TextField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    created_at = models.DateTimeField(auto_now_add=True)
    verified_by = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL, related_name="verified_reports")
    verified_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "utilization_reports"


class ReportProof(models.Model):
    report = models.ForeignKey(UtilizationReport, on_delete=models.CASCADE, related_name="proofs")
    file = models.FileField(upload_to="report_proofs/")
    caption = models.CharField(max_length=255, null=True, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "report_proofs"


class SiteSetting(models.Model):
    """Simple key/value for site-wide settings (singleton-like)."""
    site_title = models.CharField(max_length=200, default="Donate Platform")
    default_currency = models.CharField(max_length=10, default="INR")
    registration_open = models.BooleanField(default=True)
    require_ngo_approval = models.BooleanField(default=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "site_settings"

    def __str__(self):
        return f"SiteSettings"


class Announcement(models.Model):
    """Admin announcements for donors and NGOs"""
    
    ngo = models.ForeignKey(NGO, on_delete=models.CASCADE, null=True, blank=True, related_name='announcements')
    title = models.CharField(max_length=150)
    description = models.TextField()
    image = models.ImageField(upload_to="announcements/", null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "announcements"
        ordering = ["-created_at"]

    def __str__(self):
        return self.title


class Ticket(models.Model):
    """Support ticket raised by a Donor or NGO."""
    STATUS_CHOICES = [
        ("open", "Open"),
        ("closed", "Closed"),
    ]

    # The user who created the ticket (donor or NGO user)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tickets')
    ngo = models.ForeignKey(NGO, on_delete=models.CASCADE, null=True, blank=True, related_name='tickets')
    title = models.CharField(max_length=200)
    description = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'tickets'
        ordering = ['-created_at']

    def _str_(self):
        return f"#{self.id} {self.title}"


class TicketMessage(models.Model):
    """Messages in a ticket thread."""
    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE)
    message = models.TextField()
    attachment = models.FileField(upload_to='ticket_attachments/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'ticket_messages'
        ordering = ['created_at']

    def __str__(self):
        return f"Msg {self.id} on Ticket {self.ticket_id}"


class Campaign(models.Model):
    """NGO campaigns that donors can participate in"""
    STATUS_CHOICES = [
        ("pending", "Pending Approval"),
        ("approved", "Approved"),
        ("rejected", "Rejected"),
        ("active", "Active"),
        ("completed", "Completed"),
    ]

    ngo = models.ForeignKey(NGO, on_delete=models.CASCADE, related_name='campaigns')
    title = models.CharField(max_length=200)
    description = models.TextField()
    goal_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    goal_items = models.TextField(null=True, blank=True)  # e.g., "100 school bags, 50 books"
    image = models.ImageField(upload_to="campaigns/", null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    approved_by = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL, related_name="approved_campaigns")
    approved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'campaigns'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.ngo.name}"


class CampaignParticipation(models.Model):
    """Donor participation/contribution to a campaign"""
    TYPE_CHOICES = [
        ("money", "Money Donation"),
        ("item", "Item Donation"),
    ]

    campaign = models.ForeignKey(Campaign, on_delete=models.CASCADE, related_name='participants')
    donor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='campaign_participations')
    participation_type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    items_description = models.TextField(null=True, blank=True)
    participated_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'campaign_participations'
        ordering = ['-participated_at']

    def __str__(self):
        return f"{self.donor.full_name} → {self.campaign.title}"

class OTP(models.Model):
    email = models.EmailField()
    otp_code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'otps'

    def __str__(self):
        return f"{self.email} - {self.otp_code}"

class Subscriber(models.Model):
    email = models.EmailField(unique=True)
    subscribed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'subscribers'
        ordering = ['-subscribed_at']

    def __str__(self):
        return self.email