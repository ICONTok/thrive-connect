
import { useState, useEffect } from "react";
import { useNavigate, useLocation, Routes, Route } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash, Search, Filter } from "lucide-react";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { BlogPost } from "@/types/mentorship";
import BlogPostDetail from "@/components/blog/BlogPost";
import BlogPostForm from "@/components/blog/BlogPostForm";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

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

  const { data: posts, isLoading } = useQuery({
    queryKey: ['blog_posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select(`
          *,
          author:profiles!blog_posts_author_id_fkey(full_name)
        `)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as BlogPost[];
    },
  });

  useEffect(() => {
    if (posts) {
      // Extract all unique categories from posts
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
      const { error } = await supabase
        .from('blog_posts')
        .insert({
          title: data.title,
          content: data.content,
          categories: data.categories,
          author_id: user?.id,
          status: 'published'
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog_posts'] });
      setIsCreateDialogOpen(false);
      toast({
        title: "Success",
        description: "Post created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive",
      });
    },
  });

  const updatePostMutation = useMutation({
    mutationFn: async (data: { id: string; title: string; content: string; categories?: string }) => {
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
    onError: () => {
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

  const filteredPosts = posts?.filter(post => {
    // Apply search filter
    const matchesSearch = 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      post.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Apply category filter if any categories are selected
    const matchesCategory = selectedCategories.length === 0 || 
      (post.categories && selectedCategories.some(category => 
        post.categories?.toLowerCase().includes(category.toLowerCase())
      ));
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex-1 p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Blog Posts</h1>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Post
        </Button>
      </div>

      <div className="flex items-center mb-6 space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search posts..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
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
          {filteredPosts?.map((post) => (
            <Card key={post.id} className="h-full flex flex-col">
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
                  By {post.author.full_name}
                </p>
                <div className="prose max-w-none line-clamp-3">
                  <div dangerouslySetInnerHTML={{ 
                    __html: post.content.replace(/<[^>]*>/g, ' ').substring(0, 150) + '...' 
                  }} />
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
                {post.author_id === user?.id && (
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
                      onClick={() => deletePostMutation.mutate(post.id)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardFooter>
            </Card>
          ))}
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
    <SidebarProvider>
      <div className="min-h-screen bg-gray-50 flex">
        <AppSidebar />
        <Routes>
          <Route path="/" element={<BlogList />} />
          <Route path="/:id" element={<BlogPostDetail />} />
        </Routes>
      </div>
    </SidebarProvider>
  );
};

export default BlogPage;
