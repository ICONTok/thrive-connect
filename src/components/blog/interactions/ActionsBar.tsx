
import { ThumbsUp, MessageSquare, Share, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ActionsBarProps {
  postId: string;
  isCommenting: boolean;
  setIsCommenting: (value: boolean) => void;
}

export function ActionsBar({ postId, isCommenting, setIsCommenting }: ActionsBarProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
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
  
  // Get comments count
  const { data: commentsCount = 0 } = useQuery({
    queryKey: ['blog-comments-count', postId],
    queryFn: async () => {
      const { count } = await supabase
        .from('blog_interactions')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', postId)
        .eq('type', 'comment');
      
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
          {commentsCount} {commentsCount === 1 ? 'Comment' : 'Comments'}
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
  );
}
