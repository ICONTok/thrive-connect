
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EventForm } from "@/components/dashboard/EventForm";
import { Plus } from "lucide-react";
import type { Event } from "@/types/mentorship";

interface EventsListProps {
  events: Event[] | undefined;
  onEventCreated: () => void;
}

export function EventsList({ events, onEventCreated }: EventsListProps) {
  const [showEventForm, setShowEventForm] = useState(false);

  const handleEventCreated = () => {
    setShowEventForm(false);
    onEventCreated();
  };

  return (
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
          <div className="space-y-3">
            {events?.map((event) => (
              <Card key={event.id} className="shadow-sm hover:shadow transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{event.title}</CardTitle>
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
              <p className="text-gray-500 text-center py-6">No events created yet</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
