
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCheck } from "lucide-react";
import type { Profile } from "@/types/mentorship";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface MenteesListProps {
  mentees: Profile[] | undefined;
  isLoading: boolean;
}

export function MenteesList({ mentees, isLoading }: MenteesListProps) {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>My Mentees</CardTitle>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate('/connections')}
        >
          View All
        </Button>
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
                    <div className="flex items-center">
                      <UserCheck className="text-green-500 h-5 w-5" />
                    </div>
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
