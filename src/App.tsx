import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Index from "./pages/Index";
import CreateMonitor from "./pages/CreateMonitor";
import Dashboard from "./pages/Dashboard";
import DatadogMonitors from "./pages/DatadogMonitors";
import ZabbixMonitors from "./pages/ZabbixMonitors";
import DynatraceMonitors from "./pages/DynatraceMonitors";
import MonitorsRedirect from "./pages/MonitorsRedirect";
import NotFound from "./pages/NotFound";
import DatadogIntegration from "./pages/DatadogIntegration";
import GenericMonitorSuggestions from "./pages/GenericMonitorSuggestions";
import ExtractRequests from "./pages/ExtractRequests";
import Auth from "./pages/Auth";
import { AuthGuard } from "./components/auth/AuthGuard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/criar-monitor" element={<AuthGuard><CreateMonitor /></AuthGuard>} />
            <Route path="/dashboard" element={<AuthGuard><Dashboard /></AuthGuard>} />
            <Route path="/monitores" element={<AuthGuard><MonitorsRedirect /></AuthGuard>} />
            <Route path="/monitores/datadog" element={<AuthGuard><DatadogMonitors /></AuthGuard>} />
            <Route path="/monitores/zabbix" element={<AuthGuard><ZabbixMonitors /></AuthGuard>} />
            <Route path="/monitores/dynatrace" element={<AuthGuard><DynatraceMonitors /></AuthGuard>} />
            <Route path="/integracoes/datadog" element={<AuthGuard><DatadogIntegration /></AuthGuard>} />
            <Route path="/boas-praticas" element={<GenericMonitorSuggestions />} />
            <Route path="/extrair-solicitacoes" element={<ExtractRequests />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
