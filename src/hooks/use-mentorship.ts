
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Profile, MentorshipRequest } from "@/types/mentorship";

export function useMentorship(userId: string | undefined) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: profiles } = useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*');
      if (error) throw error;
      return data as Profile[];
    },
  });

  const { data: currentProfile } = useQuery({
    queryKey: ['currentProfile'],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (error) throw error;
      return data as Profile;
    },
  });

  const { data: mentorshipRequests } = useQuery({
    queryKey: ['mentorshipRequests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mentorship_requests')
        .select(`
          *,
          mentee:profiles!mentorship_requests_mentee_id_fkey(id, full_name, email, user_type),
          mentor:profiles!mentorship_requests_mentor_id_fkey(id, full_name, email, user_type)
        `)
        .eq('mentor_id', userId)
        .eq('status', 'pending');
      if (error) throw error;
      return data as MentorshipRequest[];
    },
    enabled: currentProfile?.user_type === 'mentor' || currentProfile?.user_type === 'admin',
  });

  const updateRequestMutation = useMutation({
    mutationFn: async ({ requestId, status }: { requestId: string, status: 'accepted' | 'declined' }) => {
      const { error } = await supabase
        .from('mentorship_requests')
        .update({ status })
        .eq('id', requestId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mentorshipRequests'] });
      toast({
        title: "Success",
        description: "Mentorship request updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update mentorship request",
        variant: "destructive",
      });
    },
  });

  const createRequestMutation = useMutation({
    mutationFn: async (mentorId: string) => {
      const { error } = await supabase
        .from('mentorship_requests')
        .insert({
          mentor_id: mentorId,
          mentee_id: userId,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Mentorship request sent successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to send mentorship request",
        variant: "destructive",
      });
    },
  });

  return {
    profiles,
    currentProfile,
    mentorshipRequests,
    updateRequestMutation,
    createRequestMutation,
  };
}
