
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
            <Route
              path="/"
              element={
                <RequireAuth>
                  <Index />
                </RequireAuth>
              }
            />
            <Route
              path="/mentor-signup"
              element={
                <RequireAuth>
                  <MentorSignup />
                </RequireAuth>
              }
            />
            <Route
              path="/mentee-signup"
              element={
                <RequireAuth>
                  <MenteeSignup />
                </RequireAuth>
              }
            />
            <Route
              path="/messages"
              element={
                <RequireAuth>
                  <Messages />
                </RequireAuth>
              }
            />
            <Route
              path="/blog"
              element={
                <RequireAuth>
                  <Blog />
                </RequireAuth>
              }
            />
            <Route
              path="/connections"
              element={
                <RequireAuth>
                  <Connections />
                </RequireAuth>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
