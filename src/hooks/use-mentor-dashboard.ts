
// First ensure the correct Profile type is used and properly cast the supabase response
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Profile } from "@/types/mentorship";

export function useMentorDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAccepting, setIsAccepting] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);

  // Query to get all mentorship requests
  const {
    data: mentorshipRequests,
    isLoading: requestsLoading,
  } = useQuery({
    queryKey: ["mentorship-requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mentorship_requests")
        .select(`
          *,
          mentee:profiles!mentorship_requests_mentee_id_fkey(id, full_name, email, bio, user_type)
        `)
        .eq("mentor_id", user?.id || "")
        .eq("status", "pending");

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Query to get all events
  const {
    data: events,
    isLoading: eventsLoading,
  } = useQuery({
    queryKey: ["mentor-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("mentor_id", user?.id || "");

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Query to get all accepted mentees
  const {
    data: acceptedMentees,
    isLoading: menteeLoading,
  } = useQuery({
    queryKey: ["accepted-mentees"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mentorship_requests")
        .select(`
          mentee:profiles!mentorship_requests_mentee_id_fkey(*)
        `)
        .eq("mentor_id", user?.id || "")
        .eq("status", "accepted");

      if (error) throw error;
      
      // Cast and extract the mentee profiles correctly
      const mentees = data.map(item => item.mentee) as Profile[];
      return mentees;
    },
    enabled: !!user?.id,
  });

  // Mutation to update the status of a mentorship request
  const updateRequestMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      if (status === "accepted") {
        setIsAccepting(true);
      } else {
        setIsDeclining(true);
      }

      const { error } = await supabase
        .from("mentorship_requests")
        .update({ status })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["mentorship-requests"] });
      queryClient.invalidateQueries({ queryKey: ["accepted-mentees"] });

      toast({
        title: `Request ${variables.status}`,
        description: `The mentorship request has been ${variables.status}.`,
      });

      setIsAccepting(false);
      setIsDeclining(false);
    },
    onError: (error) => {
      console.error("Error updating request:", error);
      toast({
        title: "Error",
        description: "Failed to update mentorship request.",
        variant: "destructive",
      });

      setIsAccepting(false);
      setIsDeclining(false);
    },
  });

  const handleRequestUpdate = ({ id, status }: { id: string; status: string }) => {
    updateRequestMutation.mutate({ id, status });
  };

  return {
    mentorshipRequests,
    requestsLoading,
    events,
    eventsLoading,
    acceptedMentees,
    menteeLoading,
    isAccepting,
    isDeclining,
    handleRequestUpdate,
  };
}
