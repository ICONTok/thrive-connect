
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MentorshipRequests } from "@/components/dashboard/MentorshipRequests";
import { EventForm } from "@/components/dashboard/EventForm";
import { Plus, UserCheck } from "lucide-react";
import { useMentorship } from "@/hooks/use-mentorship";
import { useAuth } from "@/lib/auth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Event, Profile, MentorshipRequest } from "@/types/mentorship";

export function MentorDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const {
    mentorshipRequests,
    updateRequestMutation,
  } = useMentorship(user?.id);

  const [showEventForm, setShowEventForm] = useState(false);

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

  // Updated query to properly fetch accepted mentees
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
      const mentees = data.map(item => item.mentee);
      console.log("Processed mentees:", mentees);
      
      return mentees as Profile[];
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

  const handleEventCreated = () => {
    setShowEventForm(false);
    queryClient.invalidateQueries({ queryKey: ['mentor-events'] });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
      <div className="md:col-span-2 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>My Mentees</CardTitle>
          </CardHeader>
          <CardContent>
            {menteeLoading ? (
              <p className="text-center py-4">Loading mentees...</p>
            ) : (
              <div className="space-y-3">
                {acceptedMentees && acceptedMentees.length > 0 ? (
                  acceptedMentees.map((mentee) => (
                    <Card key={mentee.id} className="shadow-sm hover:shadow transition-shadow">
                      <CardContent className="p-4 flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold">{mentee.full_name}</h4>
                          <p className="text-sm text-gray-500">{mentee.email}</p>
                          {mentee.interests && (
                            <p className="text-sm text-gray-600 mt-1">
                              Interests: {mentee.interests}
                            </p>
                          )}
                          {mentee.goals && (
                            <p className="text-sm text-gray-600">
                              Goals: {mentee.goals}
                            </p>
                          )}
                        </div>
                        <UserCheck className="text-green-500 h-5 w-5" />
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-6">No active mentees yet</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Events</CardTitle>
            <Button
              onClick={() => setShowEventForm(!showEventForm)}
              className="flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Create Event</span>
            </Button>
          </CardHeader>
          <CardContent>
            {showEventForm ? (
              <EventForm onSuccess={handleEventCreated} />
            ) : (
              <div className="space-y-3">
                {events?.map((event) => (
                  <Card key={event.id} className="shadow-sm hover:shadow transition-shadow">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{event.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>{event.description}</p>
                      <div className="mt-2 text-sm text-gray-500">
                        <p>Starts: {new Date(event.start_date).toLocaleString()}</p>
                        <p>Ends: {new Date(event.end_date).toLocaleString()}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {events?.length === 0 && (
                  <p className="text-gray-500 text-center py-6">No events created yet</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div>
        <MentorshipRequests
          requests={mentorshipRequests}
          onUpdateRequest={handleRequestUpdate}
        />
      </div>
    </div>
  );
}
