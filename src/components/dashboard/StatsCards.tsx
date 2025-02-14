
import { Users, Calendar, Bell, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatsCardsProps {
  menteesCount: number;
  activeSessionsCount: number;
  pendingRequestsCount: number;
}

export function StatsCards({ menteesCount, activeSessionsCount, pendingRequestsCount }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Mentees</CardTitle>
          <Users className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{menteesCount}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
          <Calendar className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeSessionsCount}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
          <Bell className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{pendingRequestsCount}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Messages</CardTitle>
          <MessageSquare className="h-4 w-4 text-purple-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">0</div>
        </CardContent>
      </Card>
    </div>
  );
}
