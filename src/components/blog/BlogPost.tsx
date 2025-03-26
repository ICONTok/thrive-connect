import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BlogPost } from "@/types/mentorship";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { placeholderBlogPosts } from "@/lib/placeholderData";
import { BlogInteractions } from "./interactions";

const BlogPostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const { data: fetchedPost, isLoading } = useQuery({
    queryKey: ['blog_post', id],
    queryFn: async () => {
      try {
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
      } catch (error) {
        console.error("Error fetching post:", error);
        // Look for post in placeholder data
        return null;
      }
    },
  });
  
  // Try to find the post in placeholder data if not found in database
  const placeholderPost = placeholderBlogPosts.find(post => post.id === id);
  const post = fetchedPost || placeholderPost;
  
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
        {post.image_url && (
          <div className="w-full aspect-video overflow-hidden">
            <img 
              src={post.image_url} 
              alt={post.title} 
              className="w-full h-full object-cover"
            />
          </div>
        )}
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
            <div className="flex gap-2 mt-2 flex-wrap">
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
          
          <BlogInteractions postId={post.id} />
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
