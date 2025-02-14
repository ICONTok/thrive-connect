
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import type { MentorshipRequest } from "@/types/mentorship";

interface MentorshipRequestsProps {
  requests: MentorshipRequest[] | undefined;
  onUpdateRequest: (requestId: string, status: 'accepted' | 'declined') => void;
}

export function MentorshipRequests({ requests, onUpdateRequest }: MentorshipRequestsProps) {
  return (
    <div className="w-80 border-l bg-white p-6">
      <h2 className="text-lg font-semibold mb-4">Mentorship Requests</h2>
      <div className="space-y-4">
        {requests?.map((request) => (
          <div key={request.id} className="border rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-medium">{request.mentee.full_name}</h3>
                <p className="text-sm text-gray-500">{request.mentee.email}</p>
              </div>
              <div className="flex space-x-2">
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="text-green-500"
                  onClick={() => onUpdateRequest(request.id, 'accepted')}
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="text-red-500"
                  onClick={() => onUpdateRequest(request.id, 'declined')}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
        {(!requests || requests.length === 0) && (
          <p className="text-gray-500 text-sm">No pending mentorship requests</p>
        )}
      </div>
    </div>
  );
}
