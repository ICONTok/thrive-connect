
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BellDot, Circle, MessageSquare, UserPlus, UserCheck } from "lucide-react";
import { Profile } from "@/types/mentorship";

interface UserConnectionCardProps {
  user: Profile;
  onConnect?: () => void;
  isConnected?: boolean;
  hasUnreadMessages?: boolean;
  isOnline?: boolean;
  hasNewPosts?: boolean;
}

export function UserConnectionCard({
  user,
  onConnect,
  isConnected,
  hasUnreadMessages,
  isOnline,
  hasNewPosts
}: UserConnectionCardProps) {
  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="h-12 w-12">
                <AvatarFallback>
                  {user.full_name?.split(' ').map((n) => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              {isOnline && (
                <Circle className="h-3 w-3 absolute bottom-0 right-0 text-green-500 fill-green-500" />
              )}
            </div>
            <div>
              <h4 className="font-semibold">{user.full_name}</h4>
              <p className="text-sm text-muted-foreground capitalize">{user.user_type}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {hasUnreadMessages && (
              <MessageSquare className="h-5 w-5 text-primary animate-pulse" />
            )}
            {hasNewPosts && (
              <BellDot className="h-5 w-5 text-primary animate-pulse" />
            )}
            {onConnect && (
              <Button 
                onClick={onConnect}
                variant="secondary"
                disabled={isConnected}
              >
                {isConnected ? (
                  <><UserCheck className="h-4 w-4 mr-2" /> Connected</>
                ) : (
                  <><UserPlus className="h-4 w-4 mr-2" /> Connect</>
                )}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
