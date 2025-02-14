
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
import { Edit, Trash, UserPlus } from "lucide-react";
import type { Profile } from "@/types/mentorship";

interface UsersTableProps {
  profiles: Profile[];
  currentProfile: Profile | null;
  onRequestMentorship: (mentorId: string) => void;
}

export function UsersTable({ profiles, currentProfile, onRequestMentorship }: UsersTableProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Users</h2>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            className="text-sm"
          >
            All
          </Button>
          <Button
            variant="outline"
            className="text-sm"
          >
            Mentors
          </Button>
          <Button
            variant="outline"
            className="text-sm"
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
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => onRequestMentorship(profile.id)}
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
