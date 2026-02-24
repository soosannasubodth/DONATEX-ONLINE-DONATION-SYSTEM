import { Routes, Route } from "react-router-dom";

import Register from "./pages/Register";
import Login from "./pages/Login";
import DonorLanding from "./pages/DonorLanding";
import AboutUs from "./pages/AboutUs";
import ImpactMap from "./pages/ImpactMap";
import OurStory from "./pages/OurStory";

import DonorDashboard from "./pages/donor/DonorDashboard";
import MyDonations from "./pages/donor/MyDonations";
import DonationUsage from "./pages/donor/DonationUsage";
import DonorSupportTickets from "./pages/donor/SupportTickets";
import DonorTicketDetail from "./pages/donor/TicketDetail";
import DonorCampaigns from "./pages/donor/DonorCampaigns";
import CampaignDetail from "./pages/donor/CampaignDetail";
import MyParticipations from "./pages/donor/MyParticipations";

import NgoDashboard from "./pages/ngo/NgoDashboard";
import NgoDonations from "./pages/ngo/NgoDonations";
import ViewDonations from "./pages/ngo/ViewDonations";
import UploadReport from "./pages/ngo/UploadReport";
import SelectDonationForReport from "./pages/ngo/SelectDonationForReport";
import MyVerifiedReports from "./pages/ngo/MyVerifiedReports";
import ViewUsageReports from "./pages/ViewUsageReports";
import NgoSupportTickets from "./pages/ngo/SupportTickets";
import NgoTicketDetail from "./pages/ngo/TicketDetail";
import NgoCampaigns from "./pages/ngo/NgoCampaigns";
import CreateCampaign from "./pages/ngo/CreateCampaign";

import AdminDashboard from "./pages/admin/AdminDashboard";
import ApproveProfiles from "./pages/admin/ApproveProfiles";
import VerifyReports from "./pages/admin/VerifyReports";
import Statistics from "./pages/admin/Statistics";
import Settings from "./pages/admin/Settings";
import CreateAnnouncement from "./pages/admin/CreateAnnouncement";
import AdminTickets from "./pages/admin/AdminTickets";
import AdminTicketDetail from "./pages/admin/AdminTicketDetail";
import AdminCampaignApproval from "./pages/admin/AdminCampaignApproval";
import ProtectedRoute from "./components/ProtectedRoute";
import NgoProfile from "./pages/ngo/NgoProfile";
import NgOAccountProfile from "./pages/ngo/NgOAccountProfile";
import DonorProfile from "./pages/donor/DonorProfile";
import ManageUsers from "./pages/admin/ManageUsers";


function App() {
  return (
    <Routes>
      {/* ✅ PUBLIC LANDING PAGE */}
      <Route path="/" element={<DonorLanding />} />

      {/* ✅ PUBLIC AUTH PAGES */}
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/about" element={<AboutUs />} />
      <Route path="/impact-map" element={<ImpactMap />} />
      <Route path="/our-story" element={<OurStory />} />

      {/* ✅ DONOR DASHBOARD */}
      <Route
        path="/donor/dashboard"
        element={
          <ProtectedRoute allowedRole="donor">
            <DonorDashboard />
          </ProtectedRoute>
        }
      />

      {/* ✅ DONOR → MY DONATIONS */}
      <Route
        path="/donor/my-donations"
        element={
          <ProtectedRoute allowedRole="donor">
            <MyDonations />
          </ProtectedRoute>
        }
      />

      {/* ✅ DONOR → HOW DONATIONS WERE USED */}
      <Route
        path="/donor/donation-usage"
        element={
          <ProtectedRoute allowedRole="donor">
            <DonationUsage />
          </ProtectedRoute>
        }
      />

      {/* ✅ NGO DASHBOARD */}
      <Route
        path="/ngo-dashboard"
        element={
          <ProtectedRoute allowedRole="ngo">
            <NgoDashboard />
          </ProtectedRoute>
        }
      />

      {/* ✅ NGO → VIEW DONATIONS RECEIVED (new detailed view) */}
      <Route
        path="/ngo-dashboard/donations"
        element={
          <ProtectedRoute allowedRole="ngo">
            <ViewDonations />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ngo/profile"
        element={
          <ProtectedRoute allowedRole="ngo">
            <NgoProfile />
          </ProtectedRoute>
        }
      />

      {/* ✅ NGO → MY VERIFIED REPORTS */}
      <Route
        path="/ngo/verified-reports"
        element={
          <ProtectedRoute allowedRole="ngo">
            <MyVerifiedReports />
          </ProtectedRoute>
        }
      />

      {/* ✅ NGO → UPLOAD UTILIZATION REPORT */}
      <Route
        path="/ngo/select-donation-report"
        element={
          <ProtectedRoute allowedRole="ngo">
            <SelectDonationForReport />
          </ProtectedRoute>
        }
      />

      <Route
        path="/ngo/upload-report/:donationId"
        element={
          <ProtectedRoute allowedRole="ngo">
            <UploadReport />
          </ProtectedRoute>
        }
      />

      {/* ✅ PUBLIC → VIEW VERIFIED USAGE REPORTS */}
      <Route
        path="/usage-reports"
        element={<ViewUsageReports />}
      />

      {/* ✅ ADMIN DASHBOARD */}
      <Route
        path="/admin-dashboard"
        element={
          <ProtectedRoute allowedRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* ✅ ADMIN → APPROVE PROFILES */}
      <Route
        path="/admin/approve-profiles"
        element={
          <ProtectedRoute allowedRole="admin">
            <ApproveProfiles />
          </ProtectedRoute>
        }
      />

      {/* ✅ ADMIN → VERIFY REPORTS */}
      <Route
        path="/admin/verify-reports"
        element={
          <ProtectedRoute allowedRole="admin">
            <VerifyReports />
          </ProtectedRoute>
        }
      />
      {/* ✅ ADMIN → STATISTICS */}
      <Route
        path="/admin/statistics"
        element={
          <ProtectedRoute allowedRole="admin">
            <Statistics />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <ProtectedRoute allowedRole="admin">
            <Settings />
          </ProtectedRoute>
        }
      />

      {/* ✅ NGO ACCOUNT PROFILE */}
      <Route
        path="/ngo/account"
        element={
          <ProtectedRoute allowedRole="ngo">
            <NgOAccountProfile />
          </ProtectedRoute>
        }
      />

      {/* ✅ DONOR PROFILE */}
      <Route
        path="/donor/profile"
        element={
          <ProtectedRoute allowedRole="donor">
            <DonorProfile />
          </ProtectedRoute>
        }
      />

      {/* ✅ ADMIN MANAGE USERS */}
      <Route
        path="/admin/manage-users"
        element={
          <ProtectedRoute allowedRole="admin">
            <ManageUsers />
          </ProtectedRoute>
        }
      />

      {/* ✅ ADMIN CREATE ANNOUNCEMENT */}
      <Route
        path="/admin/create-announcement"
        element={
          <ProtectedRoute allowedRole="admin">
            <CreateAnnouncement />
          </ProtectedRoute>
        }
      />

      {/* ✅ DONOR SUPPORT TICKETS */}
      <Route
        path="/donor/support"
        element={
          <ProtectedRoute allowedRole="donor">
            <DonorSupportTickets />
          </ProtectedRoute>
        }
      />
      <Route
        path="/donor/support/:ticketId"
        element={
          <ProtectedRoute allowedRole="donor">
            <DonorTicketDetail />
          </ProtectedRoute>
        }
      />

      {/* ✅ NGO SUPPORT TICKETS */}
      <Route
        path="/ngo/support"
        element={
          <ProtectedRoute allowedRole="ngo">
            <NgoSupportTickets />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ngo/support/:ticketId"
        element={
          <ProtectedRoute allowedRole="ngo">
            <NgoTicketDetail />
          </ProtectedRoute>
        }
      />

      {/* ✅ ADMIN SUPPORT TICKETS */}
      <Route
        path="/admin/support"
        element={
          <ProtectedRoute allowedRole="admin">
            <AdminTickets />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/support/:ticketId"
        element={
          <ProtectedRoute allowedRole="admin">
            <AdminTicketDetail />
          </ProtectedRoute>
        }
      />

      {/* ✅ DONOR CAMPAIGNS */}
      <Route
        path="/donor/campaigns"
        element={
          <ProtectedRoute allowedRole="donor">
            <DonorCampaigns />
          </ProtectedRoute>
        }
      />
      <Route
        path="/donor/campaigns/:campaignId"
        element={
          <ProtectedRoute allowedRole="donor">
            <CampaignDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/donor/participations"
        element={
          <ProtectedRoute allowedRole="donor">
            <MyParticipations />
          </ProtectedRoute>
        }
      />

      {/* ✅ NGO CAMPAIGNS */}
      <Route
        path="/ngo/campaigns"
        element={
          <ProtectedRoute allowedRole="ngo">
            <NgoCampaigns />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ngo/campaigns/create"
        element={
          <ProtectedRoute allowedRole="ngo">
            <CreateCampaign />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ngo/campaigns/:campaignId"
        element={
          <ProtectedRoute allowedRole="ngo">
            <CampaignDetail />
          </ProtectedRoute>
        }
      />

      {/* ✅ ADMIN CAMPAIGN APPROVAL */}
      <Route
        path="/admin/campaigns/approval"
        element={
          <ProtectedRoute allowedRole="admin">
            <AdminCampaignApproval />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
