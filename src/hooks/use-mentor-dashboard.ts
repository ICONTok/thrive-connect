
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMentorship } from "@/hooks/use-mentorship";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import type { Event, Profile } from "@/types/mentorship";

export function useMentorDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { mentorshipRequests, updateRequestMutation } = useMentorship(user?.id);

  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('mentor-dashboard')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'mentorship_requests',
          filter: `mentor_id=eq.${user.id}`,
        },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['mentorshipRequests'] });
          toast({
            title: "New Mentorship Request",
            description: "You have received a new mentorship request",
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient, toast]);

  const { data: events } = useQuery({
    queryKey: ['mentor-events', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('created_by', user?.id)
        .order('start_date', { ascending: true });
      
      if (error) throw error;
      return data as Event[];
    },
    enabled: !!user?.id,
  });

  const { data: acceptedMentees, isLoading: menteeLoading } = useQuery({
    queryKey: ['accepted-mentees', user?.id],
    queryFn: async () => {
      console.log("Fetching accepted mentees for mentor:", user?.id);
      
      const { data, error } = await supabase
        .from('mentorship_requests')
        .select(`
          id,
          mentee:mentee_id(
            id,
            full_name,
            email,
            interests,
            goals,
            user_type
          )
        `)
        .eq('mentor_id', user?.id)
        .eq('status', 'accepted');
      
      if (error) {
        console.error("Error fetching mentees:", error);
        throw error;
      }
      
      console.log("Raw mentees data:", data);
      
      // Extract the mentee profiles from the response
      const mentees = data.map(item => item.mentee) as Profile[];
      console.log("Processed mentees:", mentees);
      
      return mentees;
    },
    enabled: !!user?.id,
  });

  const handleRequestUpdate = async (requestId: string, status: 'accepted' | 'declined') => {
    updateRequestMutation.mutate(
      { requestId, status },
      {
        onSuccess: async () => {
          if (status === 'accepted') {
            const request = mentorshipRequests?.find(r => r.id === requestId);
            if (request) {
              await supabase.from('messages').insert({
                sender_id: user?.id,
                receiver_id: request.mentee_id,
                content: `Your mentorship request has been accepted! Welcome to the program.`
              });
            }
            // Invalidate the accepted mentees query to refresh the list
            queryClient.invalidateQueries({ queryKey: ['accepted-mentees'] });
          }
          
          toast({
            title: "Request Updated",
            description: `Mentorship request ${status}`,
          });
        }
      }
    );
  };

  return {
    events,
    acceptedMentees,
    menteeLoading,
    mentorshipRequests,
    handleRequestUpdate,
  };
}
