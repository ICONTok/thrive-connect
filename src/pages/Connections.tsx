
import { useAuth } from "@/lib/auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState, useEffect } from "react";
import { UserConnectionCard } from "@/components/UserConnectionCard";
import { Profile } from "@/types/mentorship";

const Connections = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

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

  const filteredUsers = availableUsers?.filter(u => 
    u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) &&
    !connections?.some(c => 
      (c.user_id1 === u.id || c.user_id2 === u.id) && 
      c.status === 'accepted'
    )
  );

  const acceptedConnections = connections?.filter(c => c.status === 'accepted')
    .map(c => {
      const isUser1 = c.user_id1 === user?.id;
      const otherUser = isUser1 ? c.user2 : c.user1;
      
      // Type casting to ensure compatibility with Profile type
      const typedProfile: Profile = {
        id: otherUser.id,
        full_name: otherUser.full_name,
        email: otherUser.email,
        user_type: (otherUser.user_type as "admin" | "mentor" | "mentee" | null),
        is_active: otherUser.is_active ?? false,
        role: (otherUser.role as "admin" | "mentor" | "mentee"),
        expertise: otherUser.expertise,
        interests: otherUser.interests,
        goals: otherUser.goals,
        years_of_experience: otherUser.years_of_experience
      };
      
      return {
        connection: c,
        otherUser: typedProfile
      };
    });

  return (
    <div className="w-full max-w-full px-4">
      <h1 className="text-2xl font-bold mb-6">Connections</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold">Available Connections</h2>
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search connections..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {filteredUsers?.map((user) => {
              // Type casting to ensure compatibility with Profile type
              const typedProfile: Profile = {
                id: user.id,
                full_name: user.full_name,
                email: user.email,
                user_type: (user.user_type as "admin" | "mentor" | "mentee" | null),
                is_active: user.is_active ?? false,
                role: (user.role as "admin" | "mentor" | "mentee"),
                expertise: user.expertise,
                interests: user.interests,
                goals: user.goals,
                years_of_experience: user.years_of_experience
              };
              
              return (
                <UserConnectionCard
                  key={user.id}
                  user={typedProfile}
                  onConnect={() => handleConnect(user.id)}
                  isConnected={connections?.some(c => 
                    ((c.user_id1 === user.id && c.user_id2 === user?.id) ||
                     (c.user_id2 === user.id && c.user_id1 === user?.id)) &&
                    c.status === 'pending'
                  )}
                  isOnline={Math.random() > 0.5} // This should be replaced with actual online status
                  hasUnreadMessages={Math.random() > 0.7} // This should be replaced with actual message status
                  hasNewPosts={Math.random() > 0.8} // This should be replaced with actual post alerts
                />
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-1">
          <h2 className="font-semibold mb-4">
            {userRole === 'mentor' ? 'My Mentees' : userRole === 'mentee' ? 'My Mentors' : 'My Connections'}
          </h2>
          <div className="space-y-4">
            {acceptedConnections?.map(({ otherUser }) => (
              <UserConnectionCard
                key={otherUser.id}
                user={otherUser}
                isConnected={true}
                isOnline={Math.random() > 0.5} // This should be replaced with actual online status
                hasUnreadMessages={Math.random() > 0.7} // This should be replaced with actual message status
                hasNewPosts={Math.random() > 0.8} // This should be replaced with actual post alerts
              />
            ))}
            {!acceptedConnections?.length && (
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
