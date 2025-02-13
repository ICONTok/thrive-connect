
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  Users, 
  Calendar, 
  Bell, 
  MessageSquare, 
  Edit, 
  Trash, 
  Search, 
  Menu,
  Check,
  X,
  Home,
  BookOpen,
  UserPlus
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: profiles } = useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*');
      if (error) throw error;
      return data;
    },
  });

  const { data: currentProfile } = useQuery({
    queryKey: ['currentProfile'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const mentees = profiles?.filter(p => p.user_type === 'mentee') || [];
  const activeSessions = 12; // Placeholder for now
  const pendingRequests = 5; // Placeholder for now
  const tasks = 8; // Placeholder for now

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gray-50 flex w-full">
        <AppSidebar />
        <div className="flex-1">
          {/* Top Navigation */}
          <nav className="bg-white border-b px-4">
            <div className="flex justify-between h-16 items-center">
              <div className="flex items-center space-x-4">
                <SidebarTrigger>
                  <Menu className="h-6 w-6 text-gray-600" />
                </SidebarTrigger>
                <div className="flex items-center space-x-6">
                  <Button variant="ghost" className="flex items-center space-x-2" onClick={() => navigate('/')}>
                    <Home className="h-5 w-5" />
                    <span>Home</span>
                  </Button>
                  <Button variant="ghost" className="flex items-center space-x-2" onClick={() => navigate('/connections')}>
                    <Users className="h-5 w-5" />
                    <span>Connections</span>
                  </Button>
                  <Button variant="ghost" className="flex items-center space-x-2" onClick={() => navigate('/messages')}>
                    <MessageSquare className="h-5 w-5" />
                    <span>Messages</span>
                  </Button>
                  <Button variant="ghost" className="flex items-center space-x-2" onClick={() => navigate('/blog')}>
                    <BookOpen className="h-5 w-5" />
                    <span>Blog</span>
                  </Button>
                </div>
                <div className="relative ml-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search..."
                    className="pl-10 w-[300px] bg-gray-50"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Bell className="h-5 w-5 text-gray-600" />
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gray-200 rounded-full" />
                  <span className="text-sm text-gray-600">{user?.email}</span>
                </div>
              </div>
            </div>
          </nav>

          <div className="flex">
            {/* Main Content */}
            <div className="flex-1 p-8">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Total Mentees</CardTitle>
                    <Users className="h-4 w-4 text-blue-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{mentees.length}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
                    <Calendar className="h-4 w-4 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{activeSessions}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
                    <Bell className="h-4 w-4 text-yellow-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{pendingRequests}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Tasks</CardTitle>
                    <MessageSquare className="h-4 w-4 text-purple-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{tasks}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Users Section */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">Users</h2>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      className={`text-sm`}
                      onClick={() => {}}
                    >
                      All
                    </Button>
                    <Button
                      variant="outline"
                      className={`text-sm`}
                      onClick={() => {}}
                    >
                      Mentors
                    </Button>
                    <Button
                      variant="outline"
                      className={`text-sm`}
                      onClick={() => {}}
                    >
                      Mentees
                    </Button>
                  </div>
                </div>

                <div className="mb-4">
                  <Input
                    placeholder="Search mentors or mentees..."
                    className="max-w-md"
                  />
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {profiles?.map((profile) => (
                      <TableRow key={profile.id}>
                        <TableCell>{profile.full_name}</TableCell>
                        <TableCell>
                          <span className="text-blue-500">{profile.user_type}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-green-500">Active</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {currentProfile?.user_type === 'admin' && (
                              <>
                                <Button variant="ghost" size="icon">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon">
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            {currentProfile?.user_type === 'mentee' && profile.user_type === 'mentor' && (
                              <Button variant="ghost" size="icon">
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
            </div>

            {/* Right Sidebar - Mentorship Requests */}
            {(currentProfile?.user_type === 'mentor' || currentProfile?.user_type === 'admin') && (
              <div className="w-80 border-l bg-white p-6">
                <h2 className="text-lg font-semibold mb-4">Mentorship Requests</h2>
                <div className="space-y-4">
                  {/* Sample requests - replace with real data */}
                  <div className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium">John Doe</h3>
                        <p className="text-sm text-gray-500">Web Development</p>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="icon" variant="ghost" className="text-green-500">
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="text-red-500">
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  {/* Add more request items here */}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;
