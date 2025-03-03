import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMentorship } from "@/hooks/use-mentorship";
import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Profile, Task, Event } from "@/types/mentorship";
import { UserPlus, Calendar, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function MenteeDashboard() {
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-full">
      <div className="md:col-span-2 space-y-6">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Available Mentors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {availableMentors?.map((mentor) => (
                <Card key={mentor.id} className="w-full">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div>
                        <h4 className="font-semibold">{mentor.full_name}</h4>
                        <p className="text-sm text-gray-500">{mentor.email}</p>
                        {mentor.expertise && (
                          <p className="text-sm text-gray-600 mt-1">
                            Expertise: {mentor.expertise}
                          </p>
                        )}
                      </div>
                      <Button 
                        onClick={() => handleRequestMentorship(mentor.id)}
                        disabled={myMentors?.some(m => m.id === mentor.id)}
                      >
                        {myMentors?.some(m => m.id === mentor.id) ? (
                          <><CheckCircle className="h-4 w-4 mr-2" /> Connected</>
                        ) : (
                          <><UserPlus className="h-4 w-4 mr-2" /> Request Mentorship</>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {(!availableMentors || availableMentors.length === 0) && (
                <p className="text-center text-gray-500">No mentors available</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="w-full">
          <CardHeader>
            <CardTitle>My Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {myTasks?.map((task) => (
                <Card key={task.id}>
                  <CardContent className="p-4">
                    <h4 className="font-semibold">{task.title}</h4>
                    <p className="text-sm text-gray-600">{task.description}</p>
                    {task.due_date && (
                      <p className="text-sm text-gray-500 mt-2">
                        Due: {new Date(task.due_date).toLocaleDateString()}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
              {(!myTasks || myTasks.length === 0) && (
                <p className="text-center text-gray-500">No tasks assigned yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6 w-full">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>My Mentors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {myMentors?.map((mentor) => (
                <Card key={mentor.id}>
                  <CardContent className="p-4">
                    <h4 className="font-semibold">{mentor.full_name}</h4>
                    <p className="text-sm text-gray-500">{mentor.email}</p>
                    {mentor.expertise && (
                      <p className="text-sm text-gray-600 mt-1">
                        Expertise: {mentor.expertise}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
              {(!myMentors || myMentors.length === 0) && (
                <p className="text-center text-gray-500">No mentors yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Upcoming Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingEvents?.map((event) => (
                <Card key={event.id}>
                  <CardContent className="p-4">
                    <h4 className="font-semibold">{event.title}</h4>
                    <p className="text-sm text-gray-600">{event.description}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      {new Date(event.start_date).toLocaleString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
              {(!upcomingEvents || upcomingEvents.length === 0) && (
                <p className="text-center text-gray-500">No upcoming events</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
