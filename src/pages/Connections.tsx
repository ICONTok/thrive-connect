
import { useAuth } from "@/lib/auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { UserPlus, Check, X } from "lucide-react";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

const Connections = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: connections } = useQuery({
    queryKey: ['connections'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('connections')
        .select(`
          *,
          user1:user_id1(full_name, email, user_type),
          user2:user_id2(full_name, email, user_type)
        `)
        .or(`user_id1.eq.${user?.id},user_id2.eq.${user?.id}`);
      if (error) throw error;
      return data;
    },
  });

  const updateConnectionMutation = useMutation({
    mutationFn: async ({ connectionId, status }: { connectionId: string; status: string }) => {
      const { error } = await supabase
        .from('connections')
        .update({ status })
        .eq('id', connectionId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connections'] });
      toast({
        title: "Success",
        description: "Connection updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update connection",
        variant: "destructive",
      });
    },
  });

  const renderConnection = (connection: any) => {
    const isUser1 = connection.user_id1 === user?.id;
    const otherUser = isUser1 ? connection.user2 : connection.user1;

    return (
      <Card key={connection.id} className="mb-4">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">{otherUser.full_name}</h3>
              <p className="text-sm text-gray-500">{otherUser.email}</p>
              <p className="text-sm text-blue-500">{otherUser.user_type}</p>
            </div>
            {connection.status === 'pending' && !isUser1 && (
              <div className="flex gap-2">
                <Button 
                  variant="ghost"
                  size="sm"
                  onClick={() => updateConnectionMutation.mutate({ 
                    connectionId: connection.id, 
                    status: 'accepted' 
                  })}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Accept
                </Button>
                <Button 
                  variant="ghost"
                  size="sm"
                  onClick={() => updateConnectionMutation.mutate({ 
                    connectionId: connection.id, 
                    status: 'declined' 
                  })}
                >
                  <X className="h-4 w-4 mr-2" />
                  Decline
                </Button>
              </div>
            )}
            {connection.status === 'pending' && isUser1 && (
              <span className="text-yellow-500">Pending</span>
            )}
            {connection.status === 'accepted' && (
              <span className="text-green-500">Connected</span>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gray-50 flex">
        <AppSidebar />
        <div className="flex-1 p-8">
          <h1 className="text-2xl font-bold mb-6">Connections</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Connection Requests */}
            <div>
              <h2 className="font-semibold mb-4">Connection Requests</h2>
              {connections?.filter(c => c.status === 'pending').map(renderConnection)}
            </div>

            {/* Active Connections */}
            <div className="lg:col-span-2">
              <h2 className="font-semibold mb-4">Active Connections</h2>
              {connections?.filter(c => c.status === 'accepted').map(renderConnection)}
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Connections;
