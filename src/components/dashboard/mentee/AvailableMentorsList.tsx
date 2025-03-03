
import { Profile } from "@/types/mentorship";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus, CheckCircle } from "lucide-react";

interface AvailableMentorsListProps {
  availableMentors: Profile[] | undefined;
  myMentors: Profile[] | undefined;
  onRequestMentorship: (mentorId: string) => void;
  isLoading?: boolean;
}

export function AvailableMentorsList({
  availableMentors,
  myMentors,
  onRequestMentorship,
  isLoading,
}: AvailableMentorsListProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Available Mentors</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {isLoading ? (
            <p className="text-center text-gray-500">Loading mentors...</p>
          ) : (
            <>
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
                        onClick={() => onRequestMentorship(mentor.id)}
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
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
