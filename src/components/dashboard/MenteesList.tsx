
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCheck } from "lucide-react";
import type { Profile } from "@/types/mentorship";

interface MenteesListProps {
  mentees: Profile[] | undefined;
  isLoading: boolean;
}

export function MenteesList({ mentees, isLoading }: MenteesListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>My Mentees</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-center py-4">Loading mentees...</p>
        ) : (
          <div className="space-y-3">
            {mentees && mentees.length > 0 ? (
              mentees.map((mentee) => (
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
  );
}
