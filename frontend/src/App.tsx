import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import { OverviewPage } from "./pages/OverviewPage";
import { UsersPage } from "./pages/UsersPage";
import { FacilitiesPage } from "./pages/FacilitiesPage";
import { FacilityDetailPage } from "./pages/FacilityDetailPage";
import { CorporationsPage } from "./pages/CorporationsPage";
import { CorporationDetailPage } from "./pages/CorporationDetailPage";
import { ResidentsPage } from "./pages/ResidentsPage";
import { ResidentDetailPage } from "./pages/ResidentDetailPage";
import { VitalsPage } from "./pages/VitalsPage";
import { VitalsInputPage } from "./pages/VitalsInputPage";
import { ShiftsPage } from "./pages/ShiftsPage";
import { ShiftDetailPage } from "./pages/ShiftDetailPage";
import { ShiftRoutePage } from "./pages/ShiftRoutePage";
import { SalariesPage } from "./pages/SalariesPage";
import { NotificationsPage } from "./pages/NotificationsPage";
import { CarePlanPage } from "./pages/CarePlanPage";
import { ProfilePage } from "./pages/ProfilePage";
import { NurseAvailabilityPage } from "./pages/NurseAvailabilityPage";
import { FacilityShiftRequestPage } from "./pages/FacilityShiftRequestPage";
import { ShiftPlanningPage } from "./pages/ShiftPlanningPage";
import { ViewNurseAvailabilityPage } from "./pages/ViewNurseAvailabilityPage";
import { ViewFacilityShiftRequestsPage } from "./pages/ViewFacilityShiftRequestsPage";
import { NurseAvailabilityDetailPage } from "./pages/NurseAvailabilityDetailPage";
import { FacilityShiftRequestDetailPage } from "./pages/FacilityShiftRequestDetailPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { useAuth } from "./hooks/useAuth";
import { RequireRole } from "./components/auth/RequireRole";

const client = new QueryClient();

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">認証状態を確認しています...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <QueryClientProvider client={client}>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#fff",
            color: "#1e293b",
            padding: "16px",
            borderRadius: "12px",
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
            border: "1px solid #e2e8f0",
            fontSize: "14px",
            fontWeight: "500",
            maxWidth: "400px",
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: "#10b981",
              secondary: "#fff",
            },
            style: {
              background: "#f0fdf4",
              color: "#166534",
              border: "1px solid #bbf7d0",
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fff",
            },
            style: {
              background: "#fef2f2",
              color: "#991b1b",
              border: "1px solid #fecaca",
            },
          },
        }}
      />
      <BrowserRouter>
        <Routes>
          <Route element={<RequireAuth><DashboardLayout /></RequireAuth>}>
            {/* Dashboard - All roles can access (content will be role-specific) */}
            <Route index element={<OverviewPage />} />
            {/* Admin-only pages */}
            <Route
              path="users"
              element={
                <RequireRole allowedRoles={["admin"]}>
                  <UsersPage />
                </RequireRole>
              }
            />
            <Route
              path="facilities"
              element={
                <RequireRole allowedRoles={["admin"]}>
                  <FacilitiesPage />
                </RequireRole>
              }
            />
            <Route
              path="facilities/:id"
              element={
                <RequireRole allowedRoles={["admin", "nurse", "facility_manager"]}>
                  <FacilityDetailPage />
                </RequireRole>
              }
            />
            <Route
              path="corporations"
              element={
                <RequireRole allowedRoles={["admin"]}>
                  <CorporationsPage />
                </RequireRole>
              }
            />
            <Route
              path="corporations/:id"
              element={
                <RequireRole allowedRoles={["admin"]}>
                  <CorporationDetailPage />
                </RequireRole>
              }
            />
            <Route
              path="residents"
              element={
                <RequireRole allowedRoles={["admin"]}>
                  <ResidentsPage />
                </RequireRole>
              }
            />
            <Route
              path="residents/:id"
              element={
                <RequireRole allowedRoles={["admin"]}>
                  <ResidentDetailPage />
                </RequireRole>
              }
            />
            <Route
              path="residents/:id/care-plan"
              element={
                <RequireRole allowedRoles={["admin"]}>
                  <CarePlanPage />
                </RequireRole>
              }
            />
            <Route
              path="vitals"
              element={
                <RequireRole allowedRoles={["admin"]}>
                  <VitalsPage />
                </RequireRole>
              }
            />
            <Route
              path="vitals/new"
              element={
                <RequireRole allowedRoles={["admin"]}>
                  <VitalsInputPage />
                </RequireRole>
              }
            />
            <Route
              path="salaries"
              element={
                <RequireRole allowedRoles={["admin"]}>
                  <SalariesPage />
                </RequireRole>
              }
            />
            {/* Shifts - Admin, Nurse, and Facility Manager */}
            <Route
              path="shifts"
              element={
                <RequireRole allowedRoles={["admin", "nurse", "facility_manager"]}>
                  <ShiftsPage />
                </RequireRole>
              }
            />
            <Route
              path="shifts/:id"
              element={
                <RequireRole allowedRoles={["admin", "nurse", "facility_manager"]}>
                  <ShiftDetailPage />
                </RequireRole>
              }
            />
            <Route
              path="shifts/daily/:date/:nurseId"
              element={
                <RequireRole allowedRoles={["admin", "nurse", "facility_manager"]}>
                  <ShiftRoutePage />
                </RequireRole>
              }
            />
            {/* Nurse-only pages */}
            <Route
              path="nurse-availability"
              element={
                <RequireRole allowedRoles={["nurse"]}>
                  <NurseAvailabilityPage />
                </RequireRole>
              }
            />
            {/* Facility Manager and Admin pages */}
            <Route
              path="facility-shift-requests"
              element={
                <RequireRole allowedRoles={["admin", "facility_manager"]}>
                  <FacilityShiftRequestPage />
                </RequireRole>
              }
            />
            {/* Admin-only: Shift Planning */}
            <Route
              path="shift-planning"
              element={
                <RequireRole allowedRoles={["admin"]}>
                  <ShiftPlanningPage />
                </RequireRole>
              }
            />
            {/* Admin-only: View Nurse Availability */}
            <Route
              path="view-nurse-availability"
              element={
                <RequireRole allowedRoles={["admin"]}>
                  <ViewNurseAvailabilityPage />
                </RequireRole>
              }
            />
            <Route
              path="view-nurse-availability/:nurseId/:yearMonth"
              element={
                <RequireRole allowedRoles={["admin"]}>
                  <NurseAvailabilityDetailPage />
                </RequireRole>
              }
            />
            {/* Admin-only: View Facility Shift Requests */}
            <Route
              path="view-facility-shift-requests"
              element={
                <RequireRole allowedRoles={["admin"]}>
                  <ViewFacilityShiftRequestsPage />
                </RequireRole>
              }
            />
            <Route
              path="view-facility-shift-requests/:facilityId/:yearMonth"
              element={
                <RequireRole allowedRoles={["admin"]}>
                  <FacilityShiftRequestDetailPage />
                </RequireRole>
              }
            />
            {/* All roles can access */}
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
