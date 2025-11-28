import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import Index from "./pages/Index";
import PatientPage from "./pages/PatientPage";
import DoctorPage from "./pages/DoctorPage";
import PharmacyPage from "./pages/PharmacyPage";
import BedPage from "./pages/BedPage";
import AmbulancePage from "./pages/AmbulancePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Navigation />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/patient" element={<PatientPage />} />
          <Route path="/doctor" element={<DoctorPage />} />
          <Route path="/pharmacy" element={<PharmacyPage />} />
          <Route path="/beds" element={<BedPage />} />
          <Route path="/ambulance" element={<AmbulancePage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
