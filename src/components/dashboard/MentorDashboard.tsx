
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MentorshipRequests } from "@/components/dashboard/MentorshipRequests";
import { useMentorship } from "@/hooks/use-mentorship";
import { useAuth } from "@/lib/auth";

export function MentorDashboard() {
  const { user } = useAuth();
  const {
    mentorshipRequests,
    updateRequestMutation,
  } = useMentorship(user?.id);

  const handleRequestUpdate = (requestId: string, status: 'accepted' | 'declined') => {
    updateRequestMutation.mutate({ requestId, status });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>My Mentees</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Mentees list will go here */}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Events</CardTitle>
          </CardHeader>
          <CardContent>
            <Button>Create Event</Button>
            {/* Events list will go here */}
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
