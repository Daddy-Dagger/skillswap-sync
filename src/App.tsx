import { Routes, Route, useLocation } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";

// Pages
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import OnboardingPage from "./pages/OnboardingPage";
import ProfilePage from "./pages/ProfilePage";
import SwipeMatchPage from "./pages/SwipeMatchPage";
import MatchesPage from "./pages/MatchesPage";
import ContractsPage from "./pages/ContractsPage";
import WorkspacePage from "./pages/WorkspacePage";
import NotificationsPage from "./pages/NotificationsPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";

// Layout
import AppLayout from "./components/AppLayout";

export default function App() {
  const { isLoading } = useAuth();
  const location = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-hero">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />

        {/* Protected routes with layout */}
        <Route element={<AppLayout />}>
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/:userId" element={<ProfilePage />} />
          <Route path="/discover" element={<SwipeMatchPage />} />
          <Route path="/matches" element={<MatchesPage />} />
          <Route path="/contracts" element={<ContractsPage />} />
          <Route path="/workspace/:contractId" element={<WorkspacePage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster position="bottom-right" />
    </>
  );
}
