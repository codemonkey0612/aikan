import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import { OverviewPage } from "./pages/OverviewPage";
import { UsersPage } from "./pages/UsersPage";
import { FacilitiesPage } from "./pages/FacilitiesPage";
import { ResidentsPage } from "./pages/ResidentsPage";
import { ResidentDetailPage } from "./pages/ResidentDetailPage";
import { VitalsPage } from "./pages/VitalsPage";
import { VitalsInputPage } from "./pages/VitalsInputPage";
import { ShiftsPage } from "./pages/ShiftsPage";
import { VisitsPage } from "./pages/VisitsPage";
import { SalariesPage } from "./pages/SalariesPage";
import { NotificationsPage } from "./pages/NotificationsPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { useAuth } from "./hooks/useAuth";

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
      <BrowserRouter>
        <Routes>
          <Route element={<RequireAuth><DashboardLayout /></RequireAuth>}>
            <Route index element={<OverviewPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="facilities" element={<FacilitiesPage />} />
            <Route path="residents" element={<ResidentsPage />} />
            <Route path="residents/:id" element={<ResidentDetailPage />} />
            <Route path="vitals" element={<VitalsPage />} />
            <Route path="vitals/new" element={<VitalsInputPage />} />
            <Route path="shifts" element={<ShiftsPage />} />
            <Route path="visits" element={<VisitsPage />} />
            <Route path="salaries" element={<SalariesPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
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
