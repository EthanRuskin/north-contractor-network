import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { SecurityHeaders } from "@/components/security/SecurityHeaders";
import AccountSettings from "./pages/AccountSettings";
import Industries from "./pages/Industries";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import SearchContractors from "./pages/SearchContractors";
import ContractorProfile from "./pages/ContractorProfile";
import ServiceCategory from "./pages/ServiceCategory";
import HowItWorks from "./pages/HowItWorks";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <SecurityHeaders />
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/account-settings" element={<AccountSettings />} />
            <Route path="/search" element={<SearchContractors />} />
            <Route path="/contractor/:id" element={<ContractorProfile />} />
            <Route path="/service/:serviceId" element={<ServiceCategory />} />
            <Route path="/industries" element={<Industries />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
