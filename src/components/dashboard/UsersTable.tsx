
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Edit, UserPlus, Ban, Shield } from "lucide-react";
import type { Profile } from "@/types/mentorship";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UsersTableProps {
  profiles: Profile[];
  currentProfile: Profile | null;
  onRequestMentorship?: (mentorId: string) => void;
  onDeactivateUser?: (userId: string) => void;
}

export function UsersTable({ 
  profiles, 
  currentProfile, 
  onRequestMentorship,
  onDeactivateUser 
}: UsersTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role, userType }: { userId: string; role: string; userType: string }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ role: role, user_type: userType })
        .eq('id', userId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      setIsDialogOpen(false);
      toast({
        title: "Success",
        description: "User role updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      });
      console.error("Error updating role:", error);
    },
  });

  const filteredProfiles = profiles?.filter(profile => 
    profile.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profile.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRoleUpdate = (userId: string, role: string) => {
    const userType = role === 'mentor' ? 'mentor' : role === 'admin' ? 'admin' : 'mentee';
    updateRoleMutation.mutate({ userId, role, userType });
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Users</h2>
        <div className="flex space-x-2">
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-xs"
          />
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredProfiles?.map((profile) => (
            <TableRow key={profile.id}>
              <TableCell>{profile.full_name}</TableCell>
              <TableCell>{profile.email}</TableCell>
              <TableCell>
                <span className="capitalize">{profile.role}</span>
              </TableCell>
              <TableCell>
                <span className={profile.is_active ? "text-green-500" : "text-red-500"}>
                  {profile.is_active ? "Active" : "Inactive"}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  {currentProfile?.role === 'admin' && (
                    <>
                      <Dialog open={isDialogOpen && selectedUser?.id === profile.id} onOpenChange={(open) => {
                        setIsDialogOpen(open);
                        if (!open) setSelectedUser(null);
                      }}>
                        <DialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => setSelectedUser(profile)}
                          >
                            <Shield className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Update User Role</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label>User: {selectedUser?.full_name}</Label>
                              <Select
                                onValueChange={(value) => handleRoleUpdate(profile.id, value)}
                                defaultValue={profile.role}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="mentee">Mentee</SelectItem>
                                  <SelectItem value="mentor">Mentor</SelectItem>
                                  {currentProfile?.role === 'admin' && (
                                    <SelectItem value="admin">Admin</SelectItem>
                                  )}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      {profile.role !== 'admin' && (
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="text-red-500"
                          onClick={() => onDeactivateUser?.(profile.id)}
                        >
                          <Ban className="h-4 w-4" />
                        </Button>
                      )}
                    </>
                  )}
                  {currentProfile?.role === 'mentee' && profile.role === 'mentor' && profile.is_active && (
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => onRequestMentorship?.(profile.id)}
                    >
                      <UserPlus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
