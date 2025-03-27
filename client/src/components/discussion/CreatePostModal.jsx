import React, { useState, useEffect } from 'react';
import { X, Tag as TagIcon, Check } from 'lucide-react';
import TagInput from './TagInput';

const CreatePostModal = ({ isOpen, onClose, onSubmit, editingPost = null }) => {
  // Add debugging logs
  console.log("CreatePostModal rendered with isOpen:", isOpen);
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState([]);
  const [category, setCategory] = useState('General');
  const [errors, setErrors] = useState({});
  
  // Categories
  const categories = [
    'General',
    'Academics',
    'Events',
    'Clubs',
    'Career',
    'Campus Life',
    'Help',
    'Other'
  ];
  
  // Reset form on close
  useEffect(() => {
    console.log("Modal isOpen state changed to:", isOpen);
    if (!isOpen) {
      setTitle('');
      setContent('');
      setTags([]);
      setCategory('General');
      setErrors({});
    }
  }, [isOpen]);
  
  // If editing, populate fields with post data
  useEffect(() => {
    console.log("editingPost changed:", editingPost);
    if (editingPost) {
      setTitle(editingPost.title || '');
      setContent(editingPost.content || '');
      setTags(editingPost.tags || []);
      setCategory(editingPost.category || 'General');
    }
  }, [editingPost]);
  
  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!title.trim()) {
      newErrors.title = 'Title is required';
    } else if (title.length < 5) {
      newErrors.title = 'Title must be at least 5 characters';
    }
    
    if (!content.trim()) {
      newErrors.content = 'Content is required';
    } else if (content.length < 10) {
      newErrors.content = 'Content must be at least 10 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submit triggered");
    
    if (validateForm()) {
      console.log("Form is valid, submitting");
      onSubmit({
        title,
        content,
        tags,
        category,
        ...(editingPost && { _id: editingPost._id })
      });
    } else {
      console.log("Form validation failed:", errors);
    }
  };
  
  // Early return if the modal should not be open
  if (!isOpen) {
    console.log("Modal is not open, returning null");
    return null;
  }
  
  console.log("Rendering modal content");
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-card w-full max-w-2xl rounded-xl shadow-lg max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center p-4 border-b border-border">
          <h2 className="text-xl font-semibold">{editingPost ? 'Edit Post' : 'Create New Post'}</h2>
          <button 
            onClick={(e) => {
              e.preventDefault();
              console.log("Close button clicked");
              onClose();
            }}
            className="p-1.5 rounded-full hover:bg-accent/50 text-muted-foreground hover:text-foreground"
            type="button"
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4">
          {/* Title input */}
          <div className="mb-4">
            <label className="block text-foreground font-medium mb-1">
              Title <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a descriptive title"
              className={`w-full px-3 py-2 bg-background border ${errors.title ? 'border-destructive' : 'border-border'} rounded-md focus:outline-none focus:ring-1 focus:ring-primary`}
            />
            {errors.title && (
              <p className="text-destructive text-sm mt-1">{errors.title}</p>
            )}
          </div>
          
          {/* Content textarea */}
          <div className="mb-4">
            <label className="block text-foreground font-medium mb-1">
              Content <span className="text-destructive">*</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your post content here..."
              rows={8}
              className={`w-full px-3 py-2 bg-background border ${errors.content ? 'border-destructive' : 'border-border'} rounded-md focus:outline-none focus:ring-1 focus:ring-primary resize-none`}
            />
            {errors.content && (
              <p className="text-destructive text-sm mt-1">{errors.content}</p>
            )}
          </div>
          
          {/* Category select */}
          <div className="mb-4">
            <label className="block text-foreground font-medium mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          
          {/* Tags input */}
          <div className="mb-6">
            <label className="block text-foreground font-medium mb-1">
              Tags (up to 5)
            </label>
            <TagInput tags={tags} setTags={setTags} maxTags={5} />
            <p className="text-muted-foreground text-xs mt-1">
              Add relevant tags to help others find your post
            </p>
          </div>
          
          {/* Action buttons */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-border rounded-md hover:bg-accent/50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              <Check size={18} />
              {editingPost ? 'Update Post' : 'Create Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePostModal; 