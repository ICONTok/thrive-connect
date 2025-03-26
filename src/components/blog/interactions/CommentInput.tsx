
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface CommentInputProps {
  commentContent: string;
  setCommentContent: (content: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  isLoggedIn: boolean;
}

export function CommentInput({
  commentContent,
  setCommentContent,
  onSubmit,
  isSubmitting,
  isLoggedIn
}: CommentInputProps) {
  return (
    <>
      <div className="flex gap-3">
        <Textarea
          placeholder="Write a comment..."
          value={commentContent}
          onChange={(e) => setCommentContent(e.target.value)}
          className="flex-1"
          disabled={!isLoggedIn || isSubmitting}
        />
        <Button 
          onClick={onSubmit}
          disabled={!isLoggedIn || !commentContent.trim() || isSubmitting}
          size="icon"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
      
      {!isLoggedIn && (
        <p className="text-sm text-gray-500 italic">
          You need to be logged in to comment
        </p>
      )}
    </>
  );
}
