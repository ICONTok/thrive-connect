
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Menu, Home, Users, MessageSquare, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { UsersTable } from "@/components/dashboard/UsersTable";
import { MentorshipRequests } from "@/components/dashboard/MentorshipRequests";
import { useMentorship } from "@/hooks/use-mentorship";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const {
    profiles,
    currentProfile,
    mentorshipRequests,
    updateRequestMutation,
    createRequestMutation,
  } = useMentorship(user?.id);

  const mentees = profiles?.filter(p => p.user_type === 'mentee') || [];
  const activeSessions = mentorshipRequests?.filter(r => r.status === 'accepted')?.length || 0;
  const pendingRequests = mentorshipRequests?.length || 0;

  const handleRequestMentorship = (mentorId: string) => {
    createRequestMutation.mutate(mentorId);
  };

  const handleRequestUpdate = (requestId: string, status: 'accepted' | 'declined') => {
    updateRequestMutation.mutate({ requestId, status });
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gray-50 flex w-full">
        <AppSidebar />
        <div className="flex-1">
          {/* Top Navigation */}
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
                <div className="relative ml-4">
                  <Input
                    placeholder="Search..."
                    className="pl-10 w-[300px] bg-gray-50"
                  />
                </div>
              </div>
            </div>
          </nav>

          <div className="flex">
            {/* Main Content */}
            <div className="flex-1 p-8">
              <StatsCards
                menteesCount={mentees.length}
                activeSessionsCount={activeSessions}
                pendingRequestsCount={pendingRequests}
              />

              <UsersTable
                profiles={profiles || []}
                currentProfile={currentProfile}
                onRequestMentorship={handleRequestMentorship}
              />
            </div>

            {/* Right Sidebar - Mentorship Requests */}
            {(currentProfile?.user_type === 'mentor' || currentProfile?.user_type === 'admin') && (
              <MentorshipRequests
                requests={mentorshipRequests}
                onUpdateRequest={handleRequestUpdate}
              />
            )}
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;
