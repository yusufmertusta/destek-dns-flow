import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LandingPage } from "./components/LandingPage";
import { LoginPage } from "./components/LoginPage";
import { UserDashboard } from "./components/UserDashboard";
import { DNSRecordsPage } from "./components/DNSRecordsPage";
import { DashboardLayout } from "./components/DashboardLayout";
import { AdminDashboard } from "./components/AdminDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="destek-ui-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            
            {/* User Dashboard Routes */}
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<UserDashboard />} />
              <Route path="domain/:domainId" element={<DNSRecordsPage />} />
              <Route path="profile" element={<div className="p-8 text-center"><h1 className="text-2xl font-bold">Profile Page</h1><p className="text-muted-foreground">Coming soon...</p></div>} />
              <Route path="support" element={<div className="p-8 text-center"><h1 className="text-2xl font-bold">Support Page</h1><p className="text-muted-foreground">Coming soon...</p></div>} />
            </Route>

            {/* Admin Dashboard Routes */}
            <Route path="/admin" element={<DashboardLayout isAdmin />}>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<div className="p-8 text-center"><h1 className="text-2xl font-bold">User Management</h1><p className="text-muted-foreground">Coming soon...</p></div>} />
              <Route path="domains" element={<div className="p-8 text-center"><h1 className="text-2xl font-bold">All Domains</h1><p className="text-muted-foreground">Coming soon...</p></div>} />
              <Route path="domain/:domainId" element={<DNSRecordsPage />} />
              <Route path="settings" element={<div className="p-8 text-center"><h1 className="text-2xl font-bold">Admin Settings</h1><p className="text-muted-foreground">Coming soon...</p></div>} />
            </Route>

            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
