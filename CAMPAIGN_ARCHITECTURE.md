# Campaign System Architecture

## Frontend Components Map

```
┌─────────────────────────────────────────────────────────────┐
│                    DONATE PLATFORM                          │
├─────────────────────────────────────────────────────────────┤
│
│  ┌──────────────────────────────────────────────────────┐
│  │               DONOR FLOW                             │
│  ├──────────────────────────────────────────────────────┤
│  │
│  │  DonorDashboard
│  │  ├─ 🎯 Active Campaigns → DonorCampaigns
│  │  │  ├─ Campaign Grid (filtered by status)
│  │  │  └─ [Click Card] → CampaignDetail
│  │  │
│  │  └─ My Participations → MyParticipations
│  │     ├─ Participation List (filtered by type)
│  │     └─ [View Campaign] → CampaignDetail
│  │
│  │  CampaignDetail (/donor/campaigns/:id)
│  │  ├─ Campaign Description
│  │  ├─ Funding Progress Bar
│  │  ├─ [Participate Button]
│  │  │  └─ Participate Form
│  │  │     ├─ Money/Items Toggle
│  │  │     ├─ Amount/Description Input
│  │  │     └─ [Submit] → POST /api/campaigns/{id}/participate/
│  │  └─ Recent Participants List
│  │
│  └─────────────────────────────────────────────────────┘
│
│  ┌──────────────────────────────────────────────────────┐
│  │               NGO FLOW                               │
│  ├──────────────────────────────────────────────────────┤
│  │
│  │  NgoDashboard
│  │  └─ 🎯 Campaigns → NgoCampaigns
│  │     ├─ Campaign List (filtered by status)
│  │     ├─ [+ New Campaign] → CreateCampaign
│  │     └─ [Click Card] → CampaignDetail (NGO view)
│  │
│  │  CreateCampaign (/ngo/campaigns/create)
│  │  ├─ Title Input (required)
│  │  ├─ Description (required)
│  │  ├─ Goal Amount (optional)
│  │  ├─ Items Needed (optional)
│  │  ├─ Start/End Date (required)
│  │  ├─ Image Upload (optional)
│  │  └─ [Create Campaign] → POST /api/campaigns/create/
│  │
│  │  NgoCampaigns (/ngo/campaigns)
│  │  ├─ Status Filter (all/pending/approved/rejected/active/completed)
│  │  ├─ Campaign Cards
│  │  │  ├─ Title & Description
│  │  │  ├─ Participant Count
│  │  │  ├─ Total Amount Raised
│  │  │  ├─ Status Badge (color-coded)
│  │  │  └─ [Click] → Campaign Details
│  │  └─ Empty State → Link to Create
│  │
│  └─────────────────────────────────────────────────────┘
│
│  ┌──────────────────────────────────────────────────────┐
│  │               ADMIN FLOW                             │
│  ├──────────────────────────────────────────────────────┤
│  │
│  │  AdminDashboard
│  │  └─ 🎯 Campaign Approvals → AdminCampaignApproval
│  │
│  │  AdminCampaignApproval (/admin/campaigns/approval)
│  │  ├─ Campaign Table
│  │  │  ├─ Title | NGO | Duration | Goal | Submitted | Actions
│  │  │  └─ [Approve Button] → PATCH /api/admin/campaigns/{id}/approve/?action=approve
│  │  │  └─ [Reject Button] → PATCH /api/admin/campaigns/{id}/approve/?action=reject
│  │  └─ Empty State (No pending campaigns)
│  │
│  └─────────────────────────────────────────────────────┘

└─────────────────────────────────────────────────────────────┘
```

## API Endpoints Integration

```
Frontend Request Flow                Backend Processing
┌──────────────────────┐            ┌──────────────────────┐
│  DonorCampaigns      │            │ django views.py      │
│  GET /api/campaigns/ │──────────→ │ @api_view ["GET"]   │
│                      │            │ donor_list_campaigns │
└──────────────────────┘            └──────────────────────┘
                                            │
                                            ↓
                                    ┌──────────────────────┐
                                    │ models.py            │
                                    │ Campaign.objects     │
                                    │ .filter(status in    │
                                    │ ['approved','active'])
                                    └──────────────────────┘
                                            │
                                            ↓
                                    ┌──────────────────────┐
                                    │ serializers.py       │
                                    │ CampaignSerializer   │
                                    │ (compute aggregates) │
                                    └──────────────────────┘
                                            │
                                            ↓
                                    JSON Response
                                    [{id, title, ngo_name,
                                      image_url, status,
                                      participant_count,
                                      total_amount_raised,
                                      ...}]
```

## State Management Flow

```
DonorCampaigns.jsx
├─ State: campaigns, loading, error, filter
├─ Effect: fetchCampaigns() on mount
│  └─ GET /api/campaigns/
│     └─ Update campaigns state
├─ Effect: filterCampaigns based on filter state
└─ Render: Display filtered campaigns

CampaignDetail.jsx
├─ State: campaign, participants, loading, showParticipateForm, submitting
├─ Effect: fetchCampaignDetail() on mount/campaignId change
│  └─ GET /api/campaigns/{id}/
│     └─ Update campaign & participants state
├─ Handler: handleParticipate(e)
│  └─ POST /api/campaigns/{id}/participate/
│     ├─ Validate form data
│     ├─ Submit participation data
│     └─ Re-fetch campaign detail
└─ Render: Display campaign with form if user is donor
```

## Database Schema Relationships

```
User (Django Auth)
├─ id (PK)
├─ username
├─ email
├─ full_name
├─ role (donor/ngo/admin)
└─ ...

NGO
├─ id (PK)
├─ user_id (FK → User)
├─ name
└─ ...

Campaign (NEW)
├─ id (PK)
├─ ngo_id (FK → NGO)
├─ title
├─ description
├─ goal_amount
├─ goal_items
├─ image
├─ status (pending|approved|rejected|active|completed)
├─ start_date
├─ end_date
├─ created_at
├─ approved_by (FK → User, nullable)
├─ approved_at (nullable)

CampaignParticipation (NEW)
├─ id (PK)
├─ campaign_id (FK → Campaign)
├─ donor_id (FK → User)
├─ participation_type (money|item)
├─ amount (decimal, nullable)
├─ items_description (text, nullable)
├─ participated_at
└─ unique_together: (campaign_id, donor_id)
```

## Component File Structure

```
frontend/
├─ src/
│  ├─ App.jsx (Updated with 9 new routes)
│  ├─ pages/
│  │  ├─ donor/
│  │  │  ├─ DonorDashboard.jsx (Updated with campaign cards)
│  │  │  ├─ DonorCampaigns.jsx ✨ NEW
│  │  │  ├─ DonorCampaigns.css ✨ NEW
│  │  │  ├─ CampaignDetail.jsx ✨ NEW
│  │  │  ├─ CampaignDetail.css ✨ NEW
│  │  │  ├─ MyParticipations.jsx ✨ NEW
│  │  │  ├─ MyParticipations.css ✨ NEW
│  │  │  └─ ... (other donor pages)
│  │  │
│  │  ├─ ngo/
│  │  │  ├─ NgoDashboard.jsx (Updated with campaign card)
│  │  │  ├─ NgoCampaigns.jsx ✨ NEW
│  │  │  ├─ NgoCampaigns.css ✨ NEW
│  │  │  ├─ CreateCampaign.jsx ✨ NEW
│  │  │  ├─ CreateCampaign.css ✨ NEW
│  │  │  └─ ... (other ngo pages)
│  │  │
│  │  └─ admin/
│  │     ├─ AdminDashboard.jsx (Updated with campaign card)
│  │     ├─ AdminCampaignApproval.jsx ✨ NEW
│  │     ├─ AdminCampaignApproval.css ✨ NEW
│  │     └─ ... (other admin pages)
│  │
│  └─ ... (other frontend files)

backend/
├─ donatex/
│  ├─ models.py (Updated: Campaign, CampaignParticipation models)
│  ├─ serializers.py (Updated: 3 campaign serializers)
│  ├─ views.py (Updated: 8 campaign endpoints)
│  ├─ urls.py (Updated: 8 campaign routes)
│  ├─ admin.py (Updated: 2 campaign model admins)
│  ├─ migrations/
│  │  ├─ 0011_campaign_campaignparticipation.py
│  │  └─ 0012_campaign_models.py
│  └─ ... (other backend files)
```

## Feature Checklist

### ✅ Donor Features
- [x] Browse approved/active campaigns
- [x] View campaign details (description, goal, progress, timeline)
- [x] Participate in campaigns (money or items)
- [x] Track all participations in dedicated dashboard
- [x] Filter participations by type
- [x] Real-time confirmation on participation

### ✅ NGO Features
- [x] Create campaigns with required fields
- [x] Upload campaign image
- [x] Set financial and item goals
- [x] View all campaigns with status indicators
- [x] Filter campaigns by status
- [x] Monitor participant count and funds raised
- [x] Empty state with CTA to create first campaign

### ✅ Admin Features
- [x] View pending campaigns in queue
- [x] Review campaign details in table format
- [x] Approve campaigns (changes status to approved)
- [x] Reject campaigns (changes status to rejected)
- [x] Track which admin approved (recorded in approved_by field)
- [x] Real-time feedback on actions

### ✅ System Features
- [x] Role-based access control (ProtectedRoute)
- [x] Bearer token authentication for API calls
- [x] Error handling with user-friendly messages
- [x] Loading states during async operations
- [x] Empty states with actionable CTAs
- [x] Responsive mobile design
- [x] Color-coded status badges
- [x] Progress bars for funding goals
- [x] Participant aggregation and stats
- [x] Form validation

## Testing Scenarios

### Scenario 1: Complete Campaign Workflow
1. **NGO**: Creates campaign "School Supplies Drive"
   - Status: pending
2. **Admin**: Reviews and approves campaign
   - Status: approved
3. **Donor**: Browses "Active Campaigns"
   - Sees approved campaign
4. **Donor**: Views campaign details
   - Sees 0 participants, ₹0 raised
5. **Donor**: Participates with ₹500
   - CampaignParticipation created
   - Campaign participant_count increases
   - total_amount_raised updates to ₹500
6. **Donor**: Views "My Participations"
   - Sees "School Supplies Drive" with ₹500 contribution
7. **NGO**: Views "NgoCampaigns"
   - Sees campaign with 1 participant, ₹500 raised

### Scenario 2: NGO Campaign Creation → Admin Rejection
1. **NGO**: Creates campaign with incomplete description
2. **Admin**: Rejects campaign with reason
   - Status: rejected
3. **NGO**: Sees rejected campaign in their list
4. **NGO**: Can create new campaign

### Scenario 3: Item Donation
1. **Donor**: Views campaign "Clothing Drive"
2. **Donor**: Chooses "Donate Items"
3. **Donor**: Enters "20 winter coats, good condition"
4. **System**: Records item donation
5. **Donor**: Views in "My Participations"
   - Shows "Items: 20 winter coats, good condition"

---

**Implementation Status**: ✅ COMPLETE & DEPLOYED
**Frontend Pages**: 6 fully functional components
**Backend Endpoints**: 8 fully functional API endpoints
**Database**: Campaign & CampaignParticipation tables populated
**User Flows**: All three roles fully supported
