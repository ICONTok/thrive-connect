
import { useState, useEffect } from "react";
import { useNavigate, useLocation, Routes, Route } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Edit, Trash, Search, Filter, Award, Eye, ThumbsUp, MessageSquare, Gauge } from "lucide-react";
import { BlogPost } from "@/types/mentorship";
import BlogPostDetail from "@/components/blog/BlogPost";
import BlogPostForm from "@/components/blog/BlogPostForm";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { placeholderBlogPosts } from "@/lib/placeholderData";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const BlogList = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [usePlaceholderData, setUsePlaceholderData] = useState(false);
  const [sortBy, setSortBy] = useState<string>("newest");

  const { data: fetchedPosts, isLoading } = useQuery({
    queryKey: ['blog_posts'],
    queryFn: async () => {
      try {
        console.log("Fetching blog posts...");
        const { data, error } = await supabase
          .from('blog_posts')
          .select(`
            *,
            author:profiles!blog_posts_author_id_fkey(full_name)
          `)
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error("Error fetching posts:", error);
          setUsePlaceholderData(true);
          return [];
        }
        
        console.log("Fetched posts:", data);
        
        if (!data || data.length === 0) {
          console.log("No posts found, using placeholder data");
          setUsePlaceholderData(true);
          return [];
        }
        
        return data as BlogPost[];
      } catch (err) {
        console.error("Exception while fetching posts:", err);
        setUsePlaceholderData(true);
        return [];
      }
    },
  });

  // Initialize postMetrics with a default empty object to avoid TypeScript errors
  const { data: postMetrics = {} } = useQuery({
    queryKey: ['blog_post_metrics'],
    queryFn: async () => {
      if (usePlaceholderData) return {};
      
      try {
        const { data, error } = await supabase
          .from('blog_interactions')
          .select('*');
          
        if (error) {
          console.error("Error fetching post metrics:", error);
          return {};
        }
        
        const metrics: Record<string, { views: number; likes: number; comments: number; recommendations: number }> = {};
        
        data?.forEach(interaction => {
          if (!interaction.post_id) return;
          
          if (!metrics[interaction.post_id]) {
            metrics[interaction.post_id] = { views: 0, likes: 0, comments: 0, recommendations: 0 };
          }
          
          switch (interaction.type) {
            case 'view':
              metrics[interaction.post_id].views++;
              break;
            case 'like':
              metrics[interaction.post_id].likes++;
              break;
            case 'comment':
              metrics[interaction.post_id].comments++;
              break;
            case 'recommend':
              metrics[interaction.post_id].recommendations++;
              break;
          }
        });
        
        return metrics;
      } catch (err) {
        console.error("Exception while fetching post metrics:", err);
        return {};
      }
    },
    enabled: !usePlaceholderData,
  });
  
  const posts = usePlaceholderData || !fetchedPosts || fetchedPosts.length === 0 
    ? placeholderBlogPosts 
    : fetchedPosts;

  // Add a debug log for user information to check authorization
  useEffect(() => {
    console.log("Current user:", user);
  }, [user]);

  useEffect(() => {
    if (posts) {
      const categories = new Set<string>();
      posts.forEach(post => {
        if (post.categories) {
          post.categories.split(',').forEach(category => {
            categories.add(category.trim());
          });
        }
      });
      setAllCategories(Array.from(categories));
    }
  }, [posts]);

  const createPostMutation = useMutation({
    mutationFn: async (data: { title: string; content: string; categories?: string }) => {
      if (usePlaceholderData) {
        toast({
          title: "Success",
          description: "Post created successfully (demo mode)",
        });
        return;
      }
      
      console.log("Creating post with data:", data);
      const newPost = {
        title: data.title,
        content: data.content,
        categories: data.categories,
        author_id: user?.id,
        status: 'published'
      };
      
      const { data: createdPost, error } = await supabase
        .from('blog_posts')
        .insert(newPost)
        .select('*');
        
      if (error) {
        console.error("Error creating post:", error);
        throw error;
      }
      
      console.log("Post created successfully:", createdPost);
      return createdPost;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog_posts'] });
      setIsCreateDialogOpen(false);
      toast({
        title: "Success",
        description: "Post created successfully",
      });
    },
    onError: (error) => {
      console.error("Mutation error:", error);
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive",
      });
    },
  });

  const updatePostMutation = useMutation({
    mutationFn: async (data: { id: string; title: string; content: string; categories?: string }) => {
      if (usePlaceholderData) {
        toast({
          title: "Success",
          description: "Post updated successfully (demo mode)",
        });
        return;
      }
      
      const { error } = await supabase
        .from('blog_posts')
        .update({
          title: data.title,
          content: data.content,
          categories: data.categories,
          updated_at: new Date().toISOString(),
        })
        .eq('id', data.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog_posts'] });
      setEditingPost(null);
      toast({
        title: "Success",
        description: "Post updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update post",
        variant: "destructive",
      });
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      if (usePlaceholderData) {
        toast({
          title: "Success",
          description: "Post deleted successfully (demo mode)",
        });
        return;
      }
      
      // First delete related interactions
      await supabase
        .from('blog_interactions')
        .delete()
        .eq('post_id', postId);
        
      // Then delete the post
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', postId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog_posts'] });
      toast({
        title: "Success",
        description: "Post deleted successfully",
      });
    },
    onError: (error) => {
      console.error("Error deleting post:", error);
      toast({
        title: "Error",
        description: "Failed to delete post",
        variant: "destructive",
      });
    },
  });

  const handleEditClick = (post: BlogPost) => {
    setEditingPost(post);
  };

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const getSortedPosts = (posts: BlogPost[]) => {
    if (!posts) return [];
    
    return [...posts].sort((a, b) => {
      const metricsA = postMetrics[a.id] || { views: 0, likes: 0, comments: 0, recommendations: 0 };
      const metricsB = postMetrics[b.id] || { views: 0, likes: 0, comments: 0, recommendations: 0 };
      
      switch (sortBy) {
        case "newest":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case "oldest":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case "most-viewed":
          return metricsB.views - metricsA.views;
        case "most-liked":
          return metricsB.likes - metricsA.likes;
        case "most-commented":
          return metricsB.comments - metricsA.comments;
        case "most-recommended":
          return metricsB.recommendations - metricsA.recommendations;
        case "most-interactive":
          const interactivityA = metricsA.likes + metricsA.comments + metricsA.recommendations;
          const interactivityB = metricsB.likes + metricsB.comments + metricsB.recommendations;
          return interactivityB - interactivityA;
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });
  };

  const filteredPosts = getSortedPosts(
    posts?.filter(post => {
      const matchesSearch = 
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        post.content.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategories.length === 0 || 
        (post.categories && selectedCategories.some(category => 
          post.categories?.toLowerCase().includes(category.toLowerCase())
        ));
      
      return matchesSearch && matchesCategory;
    }) || []
  );
  
  // Debug log to check posts and user
  console.log("Current posts:", posts);
  console.log("User ID:", user?.id);

  return (
    <div className="w-full max-w-full px-0">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Blog Posts</h1>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Post
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search posts..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Select 
          value={sortBy} 
          onValueChange={setSortBy}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">
              <div className="flex items-center">
                Newest First
              </div>
            </SelectItem>
            <SelectItem value="oldest">
              <div className="flex items-center">
                Oldest First
              </div>
            </SelectItem>
            <SelectItem value="most-viewed">
              <div className="flex items-center">
                <Eye className="h-4 w-4 mr-2" />
                Most Viewed
              </div>
            </SelectItem>
            <SelectItem value="most-liked">
              <div className="flex items-center">
                <ThumbsUp className="h-4 w-4 mr-2" />
                Most Liked
              </div>
            </SelectItem>
            <SelectItem value="most-commented">
              <div className="flex items-center">
                <MessageSquare className="h-4 w-4 mr-2" />
                Most Commented
              </div>
            </SelectItem>
            <SelectItem value="most-recommended">
              <div className="flex items-center">
                <Award className="h-4 w-4 mr-2" />
                Most Recommended
              </div>
            </SelectItem>
            <SelectItem value="most-interactive">
              <div className="flex items-center">
                <Gauge className="h-4 w-4 mr-2" />
                Most Interactive
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
              {selectedCategories.length > 0 && (
                <span className="ml-2 bg-primary text-white px-2 py-0.5 rounded-full text-xs">
                  {selectedCategories.length}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-4">
              <h3 className="font-medium">Filter by Category</h3>
              <div className="grid grid-cols-1 gap-2">
                {allCategories.map(category => (
                  <div key={category} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`category-${category}`}
                      checked={selectedCategories.includes(category)}
                      onCheckedChange={() => handleCategoryToggle(category)}
                    />
                    <Label htmlFor={`category-${category}`}>{category}</Label>
                  </div>
                ))}
                {allCategories.length === 0 && (
                  <p className="text-sm text-gray-500">No categories found</p>
                )}
              </div>
              {selectedCategories.length > 0 && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedCategories([])}
                  className="w-full"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-pulse">Loading posts...</div>
        </div>
      ) : filteredPosts?.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">No posts found</h2>
          <p className="text-gray-500">
            {searchQuery || selectedCategories.length > 0 
              ? 'Try adjusting your search or filters' 
              : 'Be the first to create a post!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts?.map((post) => {
            const metrics = postMetrics[post.id] || { views: 0, likes: 0, comments: 0, recommendations: 0 };
            
            return (
              <Card key={post.id} className="h-full flex flex-col overflow-hidden">
                {post.image_url && (
                  <div className="aspect-video overflow-hidden">
                    <img 
                      src={post.image_url} 
                      alt={post.title} 
                      className="w-full h-full object-cover transition-transform hover:scale-105"
                    />
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                  {post.categories && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {post.categories.split(',').map((category, index) => (
                        <span key={index} className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
                          {category.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-sm text-gray-500 mb-2">
                    By {post.author?.full_name || 'Anonymous'}
                  </p>
                  <div className="prose max-w-none line-clamp-3">
                    <div dangerouslySetInnerHTML={{ 
                      __html: post.content.replace(/<[^>]*>/g, ' ').substring(0, 150) + '...' 
                    }} />
                  </div>
                  
                  <div className="flex space-x-3 mt-4 text-xs text-gray-500">
                    <div className="flex items-center">
                      <Eye className="h-3 w-3 mr-1" /> 
                      {metrics.views}
                    </div>
                    <div className="flex items-center">
                      <ThumbsUp className="h-3 w-3 mr-1" /> 
                      {metrics.likes}
                    </div>
                    <div className="flex items-center">
                      <MessageSquare className="h-3 w-3 mr-1" /> 
                      {metrics.comments}
                    </div>
                    <div className="flex items-center">
                      <Award className="h-3 w-3 mr-1" /> 
                      {metrics.recommendations}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="justify-between border-t pt-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate(`/blog/${post.id}`)}
                  >
                    Read More
                  </Button>
                  
                  {/* Always show edit/delete buttons for placeholder data or if the user is the author */}
                  {(usePlaceholderData || post.author_id === user?.id) && (
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleEditClick(post)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => {
                          if (confirm("Are you sure you want to delete this post?")) {
                            deletePostMutation.mutate(post.id);
                          }
                        }}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog 
        open={isCreateDialogOpen || !!editingPost} 
        onOpenChange={(open) => {
          if (!open) {
            setEditingPost(null);
            setIsCreateDialogOpen(false);
          }
        }}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPost ? "Edit Post" : "Create New Post"}
            </DialogTitle>
          </DialogHeader>
          <BlogPostForm
            initialData={editingPost || undefined}
            onSubmit={(data) => {
              if (editingPost) {
                updatePostMutation.mutate({ ...data, id: editingPost.id });
              } else {
                createPostMutation.mutate(data);
              }
            }}
            onCancel={() => {
              setEditingPost(null);
              setIsCreateDialogOpen(false);
            }}
            isSubmitting={createPostMutation.isPending || updatePostMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

const BlogPage = () => {
  return (
    <Routes>
      <Route path="/" element={<BlogList />} />
      <Route path="/:id" element={<BlogPostDetail />} />
    </Routes>
  );
};

export default BlogPage;
