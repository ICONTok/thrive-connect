
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BlogPost } from "@/types/mentorship";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { format } from "date-fns";

const BlogPostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const { data: post, isLoading } = useQuery({
    queryKey: ['blog_post', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select(`
          *,
          author:profiles!blog_posts_author_id_fkey(full_name)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as BlogPost;
    },
  });
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-pulse">Loading post...</div>
      </div>
    );
  }
  
  if (!post) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Post not found</h2>
        <Button variant="outline" onClick={() => navigate("/blog")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Blog
        </Button>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto">
      <Button 
        variant="ghost" 
        className="mb-4" 
        onClick={() => navigate("/blog")}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Blog
      </Button>
      
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-3xl">{post.title}</CardTitle>
          <div className="flex justify-between text-sm text-gray-500">
            <span>By {post.author.full_name}</span>
            {post.created_at && (
              <span>
                {format(new Date(post.created_at), "MMMM d, yyyy")}
              </span>
            )}
          </div>
          {post.categories && (
            <div className="flex gap-2 mt-2">
              {post.categories.split(',').map((category, index) => (
                <span key={index} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                  {category.trim()}
                </span>
              ))}
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none">
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
          </div>
        </CardContent>
        <CardFooter className="border-t pt-4 mt-4">
          <div className="text-sm text-gray-500">
            Last updated: {post.updated_at && format(new Date(post.updated_at), "MMMM d, yyyy")}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default BlogPostDetail;
