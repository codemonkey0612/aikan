import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import { OverviewPage } from "./pages/OverviewPage";
import { UsersPage } from "./pages/UsersPage";
import { FacilitiesPage } from "./pages/FacilitiesPage";
import { ResidentsPage } from "./pages/ResidentsPage";
import { ResidentDetailPage } from "./pages/ResidentDetailPage";
import { VitalsPage } from "./pages/VitalsPage";
import { ShiftsPage } from "./pages/ShiftsPage";
import { VisitsPage } from "./pages/VisitsPage";
import { SalariesPage } from "./pages/SalariesPage";
import { NotificationsPage } from "./pages/NotificationsPage";

const client = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={client}>
      <BrowserRouter>
        <Routes>
          <Route element={<DashboardLayout />}>
            <Route index element={<OverviewPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="facilities" element={<FacilitiesPage />} />
            <Route path="residents" element={<ResidentsPage />} />
            <Route path="residents/:id" element={<ResidentDetailPage />} />
            <Route path="vitals" element={<VitalsPage />} />
            <Route path="shifts" element={<ShiftsPage />} />
            <Route path="visits" element={<VisitsPage />} />
            <Route path="salaries" element={<SalariesPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
