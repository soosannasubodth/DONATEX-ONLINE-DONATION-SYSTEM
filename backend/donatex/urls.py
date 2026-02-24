from django.urls import path
from .views import register, check_email,login_view,list_ngos,create_donation,donor_my_donations,ngo_donations,ngo_profile_submit_or_update
from .views import admin_list_pending_ngos, admin_change_ngo_status, get_ngo_detail
from .views import create_report, ngo_reports, pending_reports, verify_report, verified_reports, ngo_verified_reports, donation_reports
from .views import user_profile, list_users, manage_user
from .views import admin_stats
from .views import admin_settings
from .views import admin_announcements, donor_announcements, ngo_announcements
from .views import create_ticket, my_tickets, admin_list_tickets, ticket_detail, admin_post_ticket_message, admin_update_ticket_status
from .views import ngo_create_campaign, ngo_list_campaigns, admin_list_pending_campaigns, admin_approve_campaign, donor_list_campaigns, campaign_detail, donor_participate_campaign, donor_my_participations, donor_stats, ngo_stats
from .views import send_otp, verify_otp, reset_password
from .views import create_ticket, my_tickets, admin_list_tickets, ticket_detail, admin_post_ticket_message, admin_update_ticket_status
from .views import ngo_create_campaign, ngo_list_campaigns, admin_list_pending_campaigns, admin_approve_campaign, donor_list_campaigns, campaign_detail, donor_participate_campaign, donor_my_participations, donor_stats, ngo_stats
from .views import send_otp, verify_otp, reset_password
from .views import subscribe_newsletter, admin_list_subscribers
from .payment_views import create_order, verify_payment

urlpatterns = [
    path("register/", register, name="register"),
    path("check-email/", check_email, name="check_email"),
    path("api/login/", login_view, name="login"),
    path("api/password-reset/send-otp/", send_otp),
    path("api/password-reset/verify-otp/", verify_otp),
    path("api/password-reset/reset/", reset_password),
    path("api/ngos/", list_ngos),
    path("api/ngos/<int:ngo_id>/", get_ngo_detail),
    path("api/admin/ngos/pending/", admin_list_pending_ngos),
    path("api/admin/ngos/<int:ngo_id>/status/", admin_change_ngo_status),
    path("api/donations/",create_donation),
    path("api/my-donations/", donor_my_donations),
    path("api/ngo/donations/", ngo_donations),
    path("api/reports/", create_report),
    path("api/ngo/reports/", ngo_reports),
    path("api/ngo/reports/verified/", ngo_verified_reports),
    path("api/reports/pending/", pending_reports),
    path("api/reports/<int:report_id>/verify/", verify_report),
    path("api/reports/verified/", verified_reports),
    path("api/donations/<int:donation_id>/reports/", donation_reports),
    path("api/ngo/profile/", ngo_profile_submit_or_update),
    path("api/users/me/", user_profile),
    path("api/users/", list_users),
    path("api/users/<int:user_id>/", manage_user),
    path("api/admin/stats/", admin_stats),
    path("api/admin/settings/", admin_settings),
    path("api/admin/announcements/", admin_announcements),
    path("api/announcements/donor/", donor_announcements),
    path("api/announcements/ngo/", ngo_announcements),
    # Support tickets
    path("api/tickets/", create_ticket),
    path("api/tickets/my/", my_tickets),
    path("api/admin/tickets/", admin_list_tickets),
    path("api/tickets/<int:ticket_id>/", ticket_detail),
    path("api/admin/tickets/<int:ticket_id>/messages/", admin_post_ticket_message),
    path("api/admin/tickets/<int:ticket_id>/status/", admin_update_ticket_status),
    # Campaigns
    path("api/campaigns/create/", ngo_create_campaign),
    path("api/ngo/campaigns/", ngo_list_campaigns),
    path("api/admin/campaigns/pending/", admin_list_pending_campaigns),
    path("api/admin/campaigns/<int:campaign_id>/approve/", admin_approve_campaign),
    path("api/campaigns/", donor_list_campaigns),
    path("api/campaigns/<int:campaign_id>/", campaign_detail),
    path("api/campaigns/<int:campaign_id>/participate/", donor_participate_campaign),
    path("api/donor/participations/", donor_my_participations),
    path("api/donor/stats/", donor_stats),
    path("api/ngo/stats/", ngo_stats),

    # Payment endpoints
    path("api/payments/create-order/", create_order),
    path("api/payments/verify/", verify_payment),
    
    # Newsletter
    path("api/ensure-subscription/", subscribe_newsletter), # Public
    path("api/admin/subscribers/", admin_list_subscribers), # Admin only
]
