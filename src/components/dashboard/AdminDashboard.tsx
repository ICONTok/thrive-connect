
import { Button } from "@/components/ui/button";
import { UsersTable } from "@/components/dashboard/UsersTable";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { useMentorship } from "@/hooks/use-mentorship";
import { useAuth } from "@/lib/auth";

export function AdminDashboard() {
  const { user } = useAuth();
  const {
    profiles,
    currentProfile,
    mentorshipRequests,
    updateRequestMutation,
  } = useMentorship(user?.id);

  const handleDeactivateUser = async (userId: string) => {
    // Implementation for deactivating users will go here
  };

  const mentors = profiles?.filter(p => p.role === 'mentor') || [];
  const mentees = profiles?.filter(p => p.role === 'mentee') || [];
  const activeSessions = mentorshipRequests?.filter(r => r.status === 'accepted')?.length || 0;

  return (
    <div className="space-y-6">
      <StatsCards
        menteesCount={mentees.length}
        mentorsCount={mentors.length}
        activeSessionsCount={activeSessions}
      />
      
      <UsersTable
        profiles={profiles || []}
        currentProfile={currentProfile}
        onDeactivateUser={handleDeactivateUser}
      />
    </div>
  );
}
