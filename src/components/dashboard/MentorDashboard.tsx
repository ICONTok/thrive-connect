
import { useMentorDashboard } from "@/hooks/use-mentor-dashboard";
import { MenteesList } from "@/components/dashboard/MenteesList";
import { EventsList } from "@/components/dashboard/EventsList";
import { MentorshipRequests } from "@/components/dashboard/MentorshipRequests";
import { useQueryClient } from "@tanstack/react-query";

export function MentorDashboard() {
  const queryClient = useQueryClient();
  const {
    events,
    acceptedMentees,
    menteeLoading,
    mentorshipRequests,
    handleRequestUpdate,
  } = useMentorDashboard();

  const handleEventCreated = () => {
    queryClient.invalidateQueries({ queryKey: ['mentor-events'] });
  };

  const onUpdateRequest = (requestId: string, status: 'accepted' | 'declined') => {
    handleRequestUpdate({ id: requestId, status });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-full">
      <div className="md:col-span-2 space-y-4 w-full">
        <MenteesList 
          mentees={acceptedMentees} 
          isLoading={menteeLoading} 
        />
        <EventsList 
          events={events} 
          onEventCreated={handleEventCreated} 
        />
      </div>

      <div className="w-full">
        <MentorshipRequests
          requests={mentorshipRequests}
          onUpdateRequest={onUpdateRequest}
        />
      </div>
    </div>
  );
}
