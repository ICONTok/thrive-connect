
import { Profile } from "@/types/mentorship";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MyMentorsListProps {
  mentors: Profile[] | undefined;
  isLoading?: boolean;
}

export function MyMentorsList({ mentors, isLoading }: MyMentorsListProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>My Mentors</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isLoading ? (
            <p className="text-center text-gray-500">Loading mentors...</p>
          ) : (
            <>
              {mentors?.map((mentor) => (
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
              {(!mentors || mentors.length === 0) && (
                <p className="text-center text-gray-500">No mentors yet</p>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
