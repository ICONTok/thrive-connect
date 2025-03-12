
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquare, ThumbsUp, Share, Send } from "lucide-react";
import { format } from "date-fns";

interface BlogInteractionsProps {
  postId: string;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  user: {
    full_name: string;
  };
}

export function BlogInteractions({ postId }: BlogInteractionsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [commentContent, setCommentContent] = useState("");
  const [isCommenting, setIsCommenting] = useState(false);

  // Get likes count
  const { data: likesCount = 0 } = useQuery({
    queryKey: ['blog-likes', postId],
    queryFn: async () => {
      const { count } = await supabase
        .from('blog_interactions')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', postId)
        .eq('type', 'like');
      
      return count || 0;
    },
  });

  // Check if current user has liked the post
  const { data: userLiked = false } = useQuery({
    queryKey: ['blog-user-liked', postId, user?.id],
    queryFn: async () => {
      if (!user?.id) return false;
      
      const { data } = await supabase
        .from('blog_interactions')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .eq('type', 'like')
        .maybeSingle();
      
      return !!data;
    },
    enabled: !!user?.id,
  });

  // Get comments
  const { data: comments = [] } = useQuery({
    queryKey: ['blog-comments', postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_interactions')
        .select(`
          id,
          content,
          created_at,
          user_id,
          user:profiles!blog_interactions_user_id_fkey(full_name)
        `)
        .eq('post_id', postId)
        .eq('type', 'comment')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Comment[];
    },
  });

  // Add like mutation
  const toggleLikeMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("User not authenticated");
      
      if (userLiked) {
        // Unlike
        const { error } = await supabase
          .from('blog_interactions')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id)
          .eq('type', 'like');
          
        if (error) throw error;
      } else {
        // Like
        const { error } = await supabase
          .from('blog_interactions')
          .insert({
            post_id: postId,
            user_id: user.id,
            type: 'like'
          });
          
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-likes', postId] });
      queryClient.invalidateQueries({ queryKey: ['blog-user-liked', postId, user?.id] });
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
      toast({
        title: "Success",
        description: "Comment added successfully",
      });
    },
  });

  // Handle share
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Check out this blog post',
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link copied",
          description: "Post link copied to clipboard",
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-center justify-between border-t border-b py-4">
        <div className="flex space-x-4">
          <Button 
            variant="ghost" 
            size="sm"
            className={userLiked ? "text-primary" : ""}
            onClick={() => toggleLikeMutation.mutate()}
            disabled={!user || toggleLikeMutation.isPending}
          >
            <ThumbsUp className={`h-5 w-5 mr-2 ${userLiked ? "fill-primary" : ""}`} />
            {likesCount} {likesCount === 1 ? 'Like' : 'Likes'}
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setIsCommenting(!isCommenting)}
          >
            <MessageSquare className="h-5 w-5 mr-2" />
            {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleShare}
          >
            <Share className="h-5 w-5 mr-2" />
            Share
          </Button>
        </div>
      </div>
      
      {isCommenting && (
        <div className="space-y-4">
          <div className="flex gap-3">
            <Textarea
              placeholder="Write a comment..."
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              className="flex-1"
              disabled={!user || addCommentMutation.isPending}
            />
            <Button 
              onClick={() => addCommentMutation.mutate(commentContent)}
              disabled={!user || !commentContent.trim() || addCommentMutation.isPending}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          
          {!user && (
            <p className="text-sm text-gray-500 italic">
              You need to be logged in to comment
            </p>
          )}
          
          <div className="space-y-3 mt-4">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-3 p-3 border rounded-md">
                <Avatar>
                  <AvatarFallback>
                    {comment.user.full_name?.split(' ').map((n) => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <h4 className="font-medium">{comment.user.full_name}</h4>
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
        </div>
      )}
    </div>
  );
}
