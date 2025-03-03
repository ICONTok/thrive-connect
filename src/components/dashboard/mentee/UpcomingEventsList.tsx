
import { Event } from "@/types/mentorship";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";

interface UpcomingEventsListProps {
  events: Event[] | undefined;
  isLoading?: boolean;
}

export function UpcomingEventsList({ events, isLoading }: UpcomingEventsListProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calendar className="h-5 w-5 mr-2" />
          Upcoming Events
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isLoading ? (
            <p className="text-center text-gray-500">Loading events...</p>
          ) : (
            <>
              {events?.map((event) => (
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
              {(!events || events.length === 0) && (
                <p className="text-center text-gray-500">No upcoming events</p>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
