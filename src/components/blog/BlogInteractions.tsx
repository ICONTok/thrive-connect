
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquare, ThumbsUp, Share, Send, Award } from "lucide-react";
import { format } from "date-fns";

interface BlogInteractionsProps {
  postId: string;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  user_profile?: {
    full_name: string | null;
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

  // Get recommendations count
  const { data: recommendationsCount = 0 } = useQuery({
    queryKey: ['blog-recommendations', postId],
    queryFn: async () => {
      const { count } = await supabase
        .from('blog_interactions')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', postId)
        .eq('type', 'recommend');
      
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

  // Check if current user has recommended the post
  const { data: userRecommended = false } = useQuery({
    queryKey: ['blog-user-recommended', postId, user?.id],
    queryFn: async () => {
      if (!user?.id) return false;
      
      const { data } = await supabase
        .from('blog_interactions')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .eq('type', 'recommend')
        .maybeSingle();
      
      return !!data;
    },
    enabled: !!user?.id,
  });

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
      
      return commentsWithProfiles as Comment[];
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
      queryClient.invalidateQueries({ queryKey: ['blog_post_metrics'] });
    },
  });

  // Toggle recommendation mutation
  const toggleRecommendMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("User not authenticated");
      
      if (userRecommended) {
        // Un-recommend
        const { error } = await supabase
          .from('blog_interactions')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id)
          .eq('type', 'recommend');
          
        if (error) throw error;
      } else {
        // Recommend
        const { error } = await supabase
          .from('blog_interactions')
          .insert({
            post_id: postId,
            user_id: user.id,
            type: 'recommend'
          });
          
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-recommendations', postId] });
      queryClient.invalidateQueries({ queryKey: ['blog-user-recommended', postId, user?.id] });
      queryClient.invalidateQueries({ queryKey: ['blog_post_metrics'] });
      
      if (!userRecommended) {
        toast({
          title: "Post recommended",
          description: "Thanks for recommending this post!",
        });
      }
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
      queryClient.invalidateQueries({ queryKey: ['blog_post_metrics'] });
      toast({
        title: "Success",
        description: "Comment added successfully",
      });
    },
  });

  // Increment view count (called only once per session)
  const incrementViewMutation = useMutation({
    mutationFn: async () => {
      if (!sessionStorage.getItem(`viewed-${postId}`)) {
        const { error } = await supabase
          .from('blog_interactions')
          .insert({
            post_id: postId,
            user_id: user?.id || null,
            type: 'view',
          });
          
        if (error) throw error;
        
        // Mark as viewed in this session
        sessionStorage.setItem(`viewed-${postId}`, 'true');
      }
    }
  });

  // Increment view count on component mount (only once per session)
  useEffect(() => {
    incrementViewMutation.mutate();
  }, []);

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
            {commentsData.length} {commentsData.length === 1 ? 'Comment' : 'Comments'}
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleShare}
          >
            <Share className="h-5 w-5 mr-2" />
            Share
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm"
            className={userRecommended ? "text-amber-500" : ""}
            onClick={() => toggleRecommendMutation.mutate()}
            disabled={!user || toggleRecommendMutation.isPending}
          >
            <Award className={`h-5 w-5 mr-2 ${userRecommended ? "fill-amber-500" : ""}`} />
            {recommendationsCount} {recommendationsCount === 1 ? 'Recommendation' : 'Recommendations'}
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
            {commentsData.map((comment) => (
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
            
            {commentsData.length === 0 && (
              <p className="text-center text-gray-500 py-4">No comments yet. Be the first to comment!</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
