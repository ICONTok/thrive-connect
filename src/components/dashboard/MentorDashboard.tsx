
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MentorshipRequests } from "@/components/dashboard/MentorshipRequests";
import { EventForm } from "@/components/dashboard/EventForm";
import { Plus, UserCheck } from "lucide-react";
import { useMentorship } from "@/hooks/use-mentorship";
import { useAuth } from "@/lib/auth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Event, Profile } from "@/types/mentorship";

export function MentorDashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const {
    mentorshipRequests,
    updateRequestMutation,
  } = useMentorship(user?.id);

  const [showEventForm, setShowEventForm] = useState(false);

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

  const { data: acceptedMentees } = useQuery({
    queryKey: ['accepted-mentees', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mentorship_requests')
        .select(`
          mentee:profiles!mentorship_requests_mentee_id_fkey(*)
        `)
        .eq('mentor_id', user?.id)
        .eq('status', 'accepted');
      
      if (error) throw error;
      return data?.map(r => r.mentee) as Profile[];
    },
    enabled: !!user?.id,
  });

  const handleRequestUpdate = (requestId: string, status: 'accepted' | 'declined') => {
    updateRequestMutation.mutate({ requestId, status });
  };

  const handleEventCreated = () => {
    setShowEventForm(false);
    queryClient.invalidateQueries({ queryKey: ['mentor-events'] });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>My Mentees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {acceptedMentees?.map((mentee) => (
                <Card key={mentee.id}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">{mentee.full_name}</h4>
                      <p className="text-sm text-gray-500">{mentee.email}</p>
                      {mentee.interests && (
                        <p className="text-sm text-gray-600 mt-1">
                          Interests: {mentee.interests}
                        </p>
                      )}
                    </div>
                    <UserCheck className="text-green-500 h-5 w-5" />
                  </CardContent>
                </Card>
              ))}
              {(!acceptedMentees || acceptedMentees.length === 0) && (
                <p className="text-center text-gray-500">No active mentees yet</p>
              )}
            </div>
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
              <div className="space-y-4">
                {events?.map((event) => (
                  <Card key={event.id}>
                    <CardHeader>
                      <CardTitle>{event.title}</CardTitle>
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
                  <p className="text-gray-500 text-center">No events created yet</p>
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
