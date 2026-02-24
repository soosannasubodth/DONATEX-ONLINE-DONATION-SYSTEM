from donatex.models import CampaignParticipation, Campaign

print("=== Checking Campaign Participations ===\n")

# Get all money participations
money_participations = CampaignParticipation.objects.filter(participation_type='money').order_by('-id')

print(f"Total money participations: {money_participations.count()}\n")

if money_participations.exists():
    print("Recent money participations:")
    for p in money_participations[:5]:
        print(f"  ID: {p.id}")
        print(f"  Donor: {p.donor.username}")
        print(f"  Campaign: {p.campaign.title}")
        print(f"  Amount: ₹{p.amount}")
        print(f"  Date: {p.participated_at}")
        print()

# Check all participations for latest campaign
print("\n=== Checking Latest Campaign ===")
latest_campaign = Campaign.objects.order_by('-id').first()
if latest_campaign:
    print(f"Campaign: {latest_campaign.title}")
    print(f"Goal: ₹{latest_campaign.goal_amount}")
    
    all_participations = latest_campaign.participants.all()
    print(f"Total participants: {all_participations.count()}")
    
    from django.db.models import Sum
    money_raised = latest_campaign.participants.filter(participation_type='money').aggregate(Sum('amount'))['amount__sum'] or 0
    print(f"Money raised: ₹{money_raised}")
    
    if all_participations.exists():
        print("\nParticipants:")
        for p in all_participations:
            print(f"  - {p.donor.username}: {p.participation_type} - {p.amount if p.participation_type == 'money' else p.items_description}")
