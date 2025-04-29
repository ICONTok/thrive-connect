
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BlogPost } from "@/types/mentorship";
import { Textarea } from "@/components/ui/textarea";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useToast } from "@/hooks/use-toast";

interface BlogPostFormProps {
  initialData?: Partial<BlogPost>;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

const BlogPostForm = ({ initialData, onSubmit, onCancel, isSubmitting }: BlogPostFormProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    content: initialData?.content || "",
    categories: initialData?.categories || "",
  });
  
  // Use a simple editor state to track if we should fall back to basic textarea
  const [useBasicEditor, setUseBasicEditor] = useState(false);
  const [editorLoaded, setEditorLoaded] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  useEffect(() => {
    // Set editor as loaded after component mounts
    setEditorLoaded(true);
    
    // Log initial form data for debugging
    console.log("BlogPostForm initialized with data:", initialData);
  }, [initialData]);

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'color': [] }, { 'background': [] }],
      ['link', 'image'],
      ['clean']
    ],
  };

  const quillFormats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'color', 'background',
    'link', 'image'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitAttempted(true);
    
    // Validate form data
    if (!formData.title.trim()) {
      toast({
        title: "Error",
        description: "Post title is required",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.content.trim()) {
      toast({
        title: "Error",
        description: "Post content is required",
        variant: "destructive",
      });
      return;
    }
    
    // Log the form data before submission
    console.log("Submitting form data:", formData);
    
    try {
      // Create a formatted submission object
      const submissionData = {
        title: formData.title.trim(),
        content: formData.content,
        categories: formData.categories.trim(),
      };
      
      // Submit the form data
      onSubmit(submissionData);
    } catch (error) {
      console.error("Error in form submission:", error);
      toast({
        title: "Error",
        description: "There was a problem submitting your post. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Helper to update form data with proper validation
  const updateFormField = (field: string, value: string) => {
    console.log(`Updating ${field} field with value:`, value);
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Post Title</Label>
        <Input
          id="title"
          placeholder="Post title"
          value={formData.title}
          onChange={(e) => updateFormField('title', e.target.value)}
          required
          className={submitAttempted && !formData.title.trim() ? "border-red-500" : ""}
        />
        {submitAttempted && !formData.title.trim() && (
          <p className="text-sm text-red-500 mt-1">Title is required</p>
        )}
      </div>
      
      <div>
        <Label htmlFor="categories">Categories (comma separated)</Label>
        <Input
          id="categories"
          placeholder="e.g. Leadership, Career, Mentoring"
          value={formData.categories}
          onChange={(e) => updateFormField('categories', e.target.value)}
        />
      </div>
      
      <div>
        <Label htmlFor="content">Content</Label>
        {!useBasicEditor && editorLoaded ? (
          <div className="relative border rounded-md">
            <ReactQuill
              theme="snow"
              value={formData.content}
              onChange={(content) => updateFormField('content', content)}
              modules={quillModules}
              formats={quillFormats}
              placeholder="Write your post content here..."
              style={{ height: '300px', marginBottom: '40px' }}
            />
            <Button 
              type="button" 
              size="sm" 
              variant="outline" 
              className="absolute top-2 right-2"
              onClick={() => setUseBasicEditor(true)}
            >
              Switch to Basic Editor
            </Button>
          </div>
        ) : (
          <div className="relative">
            <Textarea
              id="content"
              placeholder="Write your post content here..."
              value={formData.content}
              onChange={(e) => updateFormField('content', e.target.value)}
              className={`min-h-[300px] ${submitAttempted && !formData.content.trim() ? "border-red-500" : ""}`}
              required
            />
            {submitAttempted && !formData.content.trim() && (
              <p className="text-sm text-red-500 mt-1">Content is required</p>
            )}
            {editorLoaded && (
              <Button 
                type="button" 
                size="sm" 
                variant="outline" 
                className="absolute top-2 right-2"
                onClick={() => setUseBasicEditor(false)}
              >
                Switch to Rich Editor
              </Button>
            )}
          </div>
        )}
      </div>
      
      <div className="flex justify-end gap-2 pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="min-w-[100px]"
        >
          {isSubmitting ? "Saving..." : (initialData ? "Update" : "Create")}
        </Button>
      </div>
    </form>
  );
};

export default BlogPostForm;
