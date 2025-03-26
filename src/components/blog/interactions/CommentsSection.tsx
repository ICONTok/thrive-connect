
import { useState } from "react";
import { format } from "date-fns";
import { Send } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { CommentList } from "./CommentList";
import { CommentInput } from "./CommentInput";

interface CommentsSectionProps {
  postId: string;
}

export function CommentsSection({ postId }: CommentsSectionProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [commentContent, setCommentContent] = useState("");

  // Get comments
  const { data: commentsData = [] } = useQuery({
    queryKey: ['blog-comments', postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_interactions')
        .select(`
          id,
          content,
          created_at,
          user_id
        `)
        .eq('post_id', postId)
        .eq('type', 'comment')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Fetch user profiles separately for each comment
      const commentsWithProfiles = await Promise.all(
        data.map(async (comment) => {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', comment.user_id)
            .single();
            
          return {
            ...comment,
            user_profile: profileData || { full_name: 'Anonymous' }
          };
        })
      );
      
      return commentsWithProfiles;
    },
  });

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!user?.id) throw new Error("User not authenticated");
      
      const { error } = await supabase
        .from('blog_interactions')
        .insert({
          post_id: postId,
          user_id: user.id,
          type: 'comment',
          content: content.trim()
        });
        
      if (error) throw error;
    },
    onSuccess: () => {
      setCommentContent("");
      queryClient.invalidateQueries({ queryKey: ['blog-comments', postId] });
      queryClient.invalidateQueries({ queryKey: ['blog-comments-count', postId] });
      queryClient.invalidateQueries({ queryKey: ['blog_post_metrics'] });
      toast({
        title: "Success",
        description: "Comment added successfully",
      });
    },
  });

  return (
    <div className="space-y-4">
      <CommentInput
        commentContent={commentContent}
        setCommentContent={setCommentContent}
        onSubmit={() => addCommentMutation.mutate(commentContent)}
        isSubmitting={addCommentMutation.isPending}
        isLoggedIn={!!user}
      />
      <CommentList comments={commentsData} />
    </div>
  );
}
