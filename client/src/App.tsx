import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { Router, Route, Switch } from "wouter";
import { frontendQueryClient } from "./lib/frontendQueryClient";
import { OfflineModeIndicator } from "./components/OfflineModeIndicator";
import { PWAInstallPrompt } from "./components/PWAInstallPrompt";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import GISMap from "./pages/GISMap";
import Events from "./pages/Events";
import News from "./pages/News";
import Rewards from "./pages/Rewards";
import Report from "./pages/Report";
import Notifications from "./pages/Notifications";
import AdminDashboard from "./pages/admin/AdminDashboard";
import CreateAnnouncement from "./pages/admin/CreateAnnouncement";
import ManageRewards from "./pages/admin/ManageRewards";
import OngoingEvents from "./pages/admin/OngoingEvents";
import ReviewReports from "./pages/admin/ReviewReports";
import OfflineSettings from "./pages/OfflineSettings";

import NotFound from "./pages/NotFound";

const App = () => (
  <QueryClientProvider client={frontendQueryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <OfflineModeIndicator />
      <PWAInstallPrompt />
      <Router>
        <Switch>
          <Route path="/" component={Index} />
          <Route path="/login" component={Login} />
          <Route path="/signup" component={Signup} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/map" component={GISMap} />
          <Route path="/events" component={Events} />
          <Route path="/news" component={News} />
          <Route path="/rewards" component={Rewards} />
          <Route path="/report" component={Report} />
          <Route path="/notifications" component={Notifications} />
          <Route path="/admin" component={AdminDashboard} />
          <Route path="/admin/dashboard" component={AdminDashboard} />
          <Route path="/admin/create-announcement" component={CreateAnnouncement} />
          <Route path="/admin/manage-rewards" component={ManageRewards} />
          <Route path="/admin/ongoing-events" component={OngoingEvents} />
          <Route path="/admin/reports" component={ReviewReports} />
          <Route path="/offline-settings" component={OfflineSettings} />

          <Route component={NotFound} />
        </Switch>
      </Router>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
