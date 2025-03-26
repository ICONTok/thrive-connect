
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ActionsBar } from "./ActionsBar";
import { CommentsSection } from "./CommentsSection";

interface BlogInteractionsProps {
  postId: string;
}

export function BlogInteractions({ postId }: BlogInteractionsProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isCommenting, setIsCommenting] = useState(false);

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

  return (
    <div className="mt-6 space-y-4">
      <ActionsBar 
        postId={postId} 
        isCommenting={isCommenting}
        setIsCommenting={setIsCommenting}
      />
      
      {isCommenting && (
        <CommentsSection postId={postId} />
      )}
    </div>
  );
}
