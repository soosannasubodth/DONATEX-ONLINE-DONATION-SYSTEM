from django.contrib import admin
from .models import Ticket, TicketMessage, Campaign, CampaignParticipation


@admin.register(Ticket)
class TicketAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "user", "ngo", "status", "created_at")
    list_filter = ("status",)
    search_fields = ("title", "description", "user__full_name", "ngo__name")


@admin.register(TicketMessage)
class TicketMessageAdmin(admin.ModelAdmin):
    list_display = ("id", "ticket", "sender", "created_at")
    search_fields = ("message", "sender__full_name")


@admin.register(Campaign)
class CampaignAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "ngo", "status", "start_date", "end_date", "created_at")
    list_filter = ("status", "created_at")
    search_fields = ("title", "description", "ngo__name")
    readonly_fields = ("created_at", "approved_at")


@admin.register(CampaignParticipation)
class CampaignParticipationAdmin(admin.ModelAdmin):
    list_display = ("id", "campaign", "donor", "participation_type", "amount", "participated_at")
    list_filter = ("participation_type", "participated_at")
    search_fields = ("campaign__title", "donor__full_name")
