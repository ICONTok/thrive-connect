
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import MentorSignup from "./pages/MentorSignup";
import MenteeSignup from "./pages/MenteeSignup";
import Auth from "./pages/Auth";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Messages from "./pages/Messages";
import Blog from "./pages/Blog";
import Connections from "./pages/Connections";
import { AuthProvider, RequireAuth } from "./lib/auth";
import { MainLayout } from "./components/layout/MainLayout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/register" element={<Register />} />
            <Route path="/" element={<RequireAuth><MainLayout /></RequireAuth>}>
              <Route index element={<Index />} />
              <Route path="mentor-signup" element={<MentorSignup />} />
              <Route path="mentee-signup" element={<MenteeDashboard />} />
              <Route path="messages/*" element={<Messages />} />
              <Route path="blog/*" element={<Blog />} />
              <Route path="connections/*" element={<Connections />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
