import { useAuth } from "@/lib/auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { UserPlus, Check, X, UserCheck, Clock } from "lucide-react";
import { useEffect, useState } from "react";

const Connections = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user?.id) {
        const { data } = await supabase
          .from('profiles')
          .select('user_type')
          .eq('id', user.id)
          .single();
        
        if (data) {
          setUserRole(data.user_type);
        }
      }
    };

    fetchUserProfile();
  }, [user?.id]);

  const { data: connections } = useQuery({
    queryKey: ['connections', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('connections')
        .select(`
          *,
          user1:profiles!connections_user_id1_fkey(*),
          user2:profiles!connections_user_id2_fkey(*)
        `)
        .or(`user_id1.eq.${user?.id},user_id2.eq.${user?.id}`);
      if (error) throw error;
      
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: acceptedConnections } = useQuery({
    queryKey: ['accepted-connections', user?.id, userRole],
    queryFn: async () => {
      if (userRole === 'mentor') {
        const { data, error } = await supabase
          .from('connections')
          .select(`
            *,
            user2:profiles!connections_user_id2_fkey(*)
          `)
          .eq('user_id1', user?.id)
          .eq('status', 'accepted')
          .eq('user2.user_type', 'mentee');
        
        if (error) throw error;
        return data;
      } 
      else if (userRole === 'mentee') {
        const { data, error } = await supabase
          .from('connections')
          .select(`
            *,
            user1:profiles!connections_user_id1_fkey(*)
          `)
          .eq('user_id2', user?.id)
          .eq('status', 'accepted')
          .eq('user1.user_type', 'mentor');
        
        if (error) throw error;
        return data;
      }
      
      return [];
    },
    enabled: !!user?.id && !!userRole,
  });

  const { data: availableUsers } = useQuery({
    queryKey: ['available-users', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', user?.id)
        .eq('is_active', true);
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const createConnectionMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('connections')
        .insert({
          user_id1: user?.id,
          user_id2: userId,
          status: 'pending'
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connections'] });
      toast({
        title: "Success",
        description: "Connection request sent",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send connection request",
        variant: "destructive",
      });
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

  const handleConnect = async (userId: string) => {
    try {
      const existingConnection = connections?.find(
        c => (c.user_id1 === userId && c.user_id2 === user?.id) ||
             (c.user_id2 === userId && c.user_id1 === user?.id)
      );

      if (existingConnection) {
        toast({
          title: "Connection exists",
          description: "You already have a connection with this user",
          variant: "destructive",
        });
        return;
      }

      createConnectionMutation.mutate(userId);
    } catch (error) {
      console.error('Error creating connection:', error);
    }
  };

  const renderConnectionStatus = (connection: any) => {
    const isUser1 = connection.user_id1 === user?.id;
    
    switch (connection.status) {
      case 'pending':
        return isUser1 ? (
          <Clock className="h-5 w-5 text-yellow-500" />
        ) : (
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
        );
      case 'accepted':
        return <UserCheck className="h-5 w-5 text-green-500" />;
      default:
        return null;
    }
  };

  const getConnectedUsers = () => {
    if (!acceptedConnections) return [];
    
    if (userRole === 'mentor') {
      return acceptedConnections.map(conn => ({
        ...conn,
        otherUser: conn.user2
      }));
    } else if (userRole === 'mentee') {
      return acceptedConnections.map(conn => ({
        ...conn,
        otherUser: conn.user1
      }));
    }
    
    return [];
  };

  const connectedUsers = getConnectedUsers();

  return (
    <div className="w-full max-w-full px-0">
      <h1 className="text-2xl font-bold mb-6">Connections</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <h2 className="font-semibold mb-4">Available Users</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableUsers?.filter(u => 
              !connections?.some(c => 
                (c.user_id1 === u.id || c.user_id2 === u.id) && 
                c.status === 'accepted'
              )
            ).map((user) => (
              <Card key={user.id} className="w-full">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{user.full_name}</h3>
                      <p className="text-sm text-gray-500">{user.email}</p>
                      <p className="text-sm text-blue-500 capitalize">{user.user_type}</p>
                    </div>
                    <Button
                      onClick={() => handleConnect(user.id)}
                      disabled={connections?.some(c => 
                        ((c.user_id1 === user.id && c.user_id2 === user?.id) ||
                         (c.user_id2 === user.id && c.user_id1 === user?.id)) &&
                        c.status === 'pending'
                      )}
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Connect
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="lg:col-span-1">
          <h2 className="font-semibold mb-4">
            {userRole === 'mentor' ? 'My Mentees' : userRole === 'mentee' ? 'My Mentors' : 'My Connections'}
          </h2>
          <div className="space-y-4">
            {connectedUsers.map((connection) => (
              <Card key={connection.id} className="w-full">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{connection.otherUser.full_name}</h3>
                      <p className="text-sm text-gray-500">{connection.otherUser.email}</p>
                      <p className="text-sm text-blue-500 capitalize">{connection.otherUser.user_type}</p>
                    </div>
                    <UserCheck className="h-5 w-5 text-green-500" />
                  </div>
                </CardContent>
              </Card>
            ))}
            {connectedUsers.length === 0 && (
              <p className="text-gray-500 text-center py-4">
                No active {userRole === 'mentor' ? 'mentees' : 'mentors'} yet
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Connections;
