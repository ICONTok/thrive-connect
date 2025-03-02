
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BlogPost } from "@/types/mentorship";
import { Editor } from "@tinymce/tinymce-react";

interface BlogPostFormProps {
  initialData?: Partial<BlogPost>;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

const BlogPostForm = ({ initialData, onSubmit, onCancel, isSubmitting }: BlogPostFormProps) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    content: initialData?.content || "",
    categories: initialData?.categories || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Post Title</Label>
        <Input
          id="title"
          placeholder="Post title"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          required
        />
      </div>
      
      <div>
        <Label htmlFor="categories">Categories (comma separated)</Label>
        <Input
          id="categories"
          placeholder="e.g. Leadership, Career, Mentoring"
          value={formData.categories}
          onChange={(e) => setFormData(prev => ({ ...prev, categories: e.target.value }))}
        />
      </div>
      
      <div>
        <Label htmlFor="content">Content</Label>
        <Editor
          apiKey="no-api-key-needed"
          initialValue={formData.content}
          init={{
            height: 400,
            menubar: true,
            plugins: [
              'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
              'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
              'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
            ],
            toolbar: 'undo redo | blocks | ' +
              'bold italic forecolor | alignleft aligncenter ' +
              'alignright alignjustify | bullist numlist outdent indent | ' +
              'image media link | removeformat | help',
            content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
            // Allow local images in demo mode without API key
            images_upload_handler: function (blobInfo, progress) {
              return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(blobInfo.blob());
                reader.onloadend = function() {
                  resolve(reader.result as string);
                };
                reader.onerror = function() {
                  reject('Error reading file');
                };
              });
            },
            // Disable API key warning
            setup: function (editor) {
              editor.on('init', function () {
                const warningElement = document.querySelector('.tox-notifications');
                if (warningElement) {
                  warningElement.remove();
                }
              });
            }
          }}
          onEditorChange={(content) => {
            setFormData(prev => ({ ...prev, content }));
          }}
        />
      </div>
      
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {initialData ? "Update" : "Create"}
        </Button>
      </div>
    </form>
  );
};

export default BlogPostForm;
