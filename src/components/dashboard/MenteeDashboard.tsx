
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMentorship } from "@/hooks/use-mentorship";
import { useAuth } from "@/lib/auth";

export function MenteeDashboard() {
  const { user } = useAuth();
  const {
    profiles,
    currentProfile,
    createRequestMutation,
  } = useMentorship(user?.id);

  const handleRequestMentorship = (mentorId: string) => {
    createRequestMutation.mutate(mentorId);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>My Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Tasks list will go here */}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Events list will go here */}
          </CardContent>
        </Card>
      </div>

      <div>
        <Card>
          <CardHeader>
            <CardTitle>My Connections</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Connections list will go here */}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
