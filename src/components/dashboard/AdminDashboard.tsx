
import { Button } from "@/components/ui/button";
import { UsersTable } from "@/components/dashboard/UsersTable";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { useMentorship } from "@/hooks/use-mentorship";
import { useAuth } from "@/lib/auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function AdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const {
    profiles,
    currentProfile,
    mentorshipRequests,
    updateRequestMutation,
  } = useMentorship(user?.id);

  const deactivateUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: false })
        .eq('id', userId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      toast({
        title: "Success",
        description: "User deactivated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to deactivate user",
        variant: "destructive",
      });
      console.error("Error deactivating user:", error);
    },
  });

  const handleDeactivateUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to deactivate this user?')) {
      deactivateUserMutation.mutate(userId);
    }
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
