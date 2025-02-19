
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Menu, Home, Users, MessageSquare, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";
import { MentorDashboard } from "@/components/dashboard/MentorDashboard";
import { MenteeDashboard } from "@/components/dashboard/MenteeDashboard";
import { useMentorship } from "@/hooks/use-mentorship";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentProfile } = useMentorship(user?.id);

  const renderDashboard = () => {
    if (!currentProfile) {
      console.log("No current profile found");
      return null;
    }

    // Log the full profile for debugging
    console.log("Full profile data:", currentProfile);

    // Ensure we're working with lowercase values
    const userType = currentProfile.user_type?.toLowerCase() as 'admin' | 'mentor' | 'mentee' | null;

    // Add strict type checking
    if (!userType) {
      console.error("User type is not set!");
      return null;
    }

    // Add debug logging
    console.log("Rendering dashboard for user type:", userType);

    // Strict type checking for each case
    if (userType === 'admin') {
      return <AdminDashboard />;
    }
    if (userType === 'mentor') {
      return <MentorDashboard />;
    }
    if (userType === 'mentee') {
      return <MenteeDashboard />;
    }

    console.error("Unknown user type:", userType);
    return null;
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gray-50 flex w-full">
        <AppSidebar />
        <div className="flex-1">
          <nav className="bg-white border-b px-4">
            <div className="flex justify-between h-16 items-center">
              <div className="flex items-center space-x-4">
                <SidebarTrigger>
                  <Menu className="h-6 w-6 text-gray-600" />
                </SidebarTrigger>
                <div className="flex items-center space-x-6">
                  <Button variant="ghost" className="flex items-center space-x-2" onClick={() => navigate('/')}>
                    <Home className="h-5 w-5" />
                    <span>Home</span>
                  </Button>
                  <Button variant="ghost" className="flex items-center space-x-2" onClick={() => navigate('/connections')}>
                    <Users className="h-5 w-5" />
                    <span>Connections</span>
                  </Button>
                  <Button variant="ghost" className="flex items-center space-x-2" onClick={() => navigate('/messages')}>
                    <MessageSquare className="h-5 w-5" />
                    <span>Messages</span>
                  </Button>
                  <Button variant="ghost" className="flex items-center space-x-2" onClick={() => navigate('/blog')}>
                    <BookOpen className="h-5 w-5" />
                    <span>Blog</span>
                  </Button>
                </div>
              </div>
            </div>
          </nav>

          <div className="p-8">
            {renderDashboard()}
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;
