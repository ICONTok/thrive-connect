
import { useMentorDashboard } from "@/hooks/use-mentor-dashboard";
import { MenteesList } from "@/components/dashboard/MenteesList";
import { EventsList } from "@/components/dashboard/EventsList";
import { MentorshipRequests } from "@/components/dashboard/MentorshipRequests";
import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function MentorDashboard() {
  const { user } = useAuth();
  const {
    events,
    mentorshipRequests,
    handleRequestUpdate,
  } = useMentorDashboard();

  // Fetch accepted mentees from connections
  const { data: acceptedMentees, isLoading: menteeLoading } = useQuery({
    queryKey: ['accepted-mentees', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('connections')
        .select(`
          user2:profiles!connections_user_id2_fkey(*)
        `)
        .eq('user_id1', user?.id)
        .eq('status', 'accepted')
        .eq('user2.user_type', 'mentee');

      if (error) throw error;
      return data?.map(connection => connection.user2) ?? [];
    },
    enabled: !!user?.id,
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-full">
      <div className="md:col-span-2 space-y-4 w-full">
        <MenteesList 
          mentees={acceptedMentees} 
          isLoading={menteeLoading} 
        />
        <EventsList events={events} />
      </div>

      <div className="w-full">
        <MentorshipRequests
          requests={mentorshipRequests}
          onUpdateRequest={handleRequestUpdate}
        />
      </div>
    </div>
  );
}
