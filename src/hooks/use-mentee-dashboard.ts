
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMentorship } from "@/hooks/use-mentorship";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import type { Profile, Task, Event } from "@/types/mentorship";

export function useMenteeDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const {
    currentProfile,
    createRequestMutation,
  } = useMentorship(user?.id);

  const { data: availableMentors } = useQuery({
    queryKey: ['available-mentors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_type', 'mentor')
        .eq('is_active', true);
      
      if (error) throw error;
      return data as Profile[];
    },
    enabled: !!user?.id,
  });

  const { data: myMentors } = useQuery({
    queryKey: ['my-mentors', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mentorship_requests')
        .select(`
          mentor:profiles!mentorship_requests_mentor_id_fkey(
            id,
            full_name,
            email,
            expertise,
            user_type
          )
        `)
        .eq('mentee_id', user?.id)
        .eq('status', 'accepted');
      
      if (error) throw error;
      const mentors = data.map(item => item.mentor) as Profile[];
      console.log("My mentors:", mentors);
      return mentors;
    },
    enabled: !!user?.id,
  });

  const { data: myTasks } = useQuery({
    queryKey: ['mentee-tasks', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('assigned_to', user?.id)
        .order('due_date', { ascending: true });
      
      if (error) throw error;
      return data as Task[];
    },
    enabled: !!user?.id,
  });

  const { data: upcomingEvents } = useQuery({
    queryKey: ['mentee-events', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .gte('start_date', new Date().toISOString())
        .order('start_date', { ascending: true });
      
      if (error) throw error;
      return data as Event[];
    },
    enabled: !!user?.id,
  });

  const handleRequestMentorship = async (mentorId: string) => {
    try {
      const existingRequest = await supabase
        .from('mentorship_requests')
        .select('*')
        .eq('mentor_id', mentorId)
        .eq('mentee_id', user?.id)
        .single();

      if (existingRequest.data) {
        toast({
          title: "Request already exists",
          description: "You have already sent a request to this mentor",
          variant: "destructive",
        });
        return;
      }

      createRequestMutation.mutate(mentorId);
    } catch (error) {
      console.error('Error checking existing request:', error);
    }
  };

  return {
    availableMentors,
    myMentors,
    myTasks,
    upcomingEvents,
    handleRequestMentorship,
  };
}
