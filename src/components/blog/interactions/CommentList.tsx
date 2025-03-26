
import { format } from "date-fns";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  user_profile?: {
    full_name: string | null;
  };
}

interface CommentListProps {
  comments: Comment[];
}

export function CommentList({ comments }: CommentListProps) {
  return (
    <div className="space-y-3 mt-4">
      {comments.map((comment) => (
        <div key={comment.id} className="flex gap-3 p-3 border rounded-md">
          <Avatar>
            <AvatarFallback>
              {comment.user_profile?.full_name?.split(' ').map((n) => n[0]).join('') || '?'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex justify-between">
              <h4 className="font-medium">{comment.user_profile?.full_name || 'Anonymous'}</h4>
              <p className="text-xs text-gray-500">
                {format(new Date(comment.created_at), "MMM d, yyyy 'at' h:mm a")}
              </p>
            </div>
            <p className="mt-1">{comment.content}</p>
          </div>
        </div>
      ))}
      
      {comments.length === 0 && (
        <p className="text-center text-gray-500 py-4">No comments yet. Be the first to comment!</p>
      )}
    </div>
  );
}
