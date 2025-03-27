import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ThumbsUp, MessageCircle, Share, MoreHorizontal, Edit, Trash2, AlertCircle, Copy } from 'lucide-react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

const DiscussionPost = ({ post, onLike, onDelete, onEdit, onComment, showFullContent = false }) => {
  const { user } = useSelector((state) => state.auth);
  const [showOptions, setShowOptions] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Check if user is admin
  const isAdmin = user?.role === 'admin';
  
  // Check if user has liked the post
  const hasLiked = user && post.likes && post.likes.includes(user.id);
  
  // Format date
  const formattedDate = post.createdAt 
    ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })
    : post.date; // Fallback for mock data
  
  // Handle link copy
  const handleCopyLink = () => {
    const url = `${window.location.origin}/discussion/${post._id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    setShowOptions(false);
  };
  
  // Handle report
  const handleReport = () => {
    // Implement report functionality
    alert('Post reported');
    setShowOptions(false);
  };
  
  // Get shortened content for list view
  const getContentPreview = () => {
    if (showFullContent) return post.content;
    
    const MAX_LENGTH = 200;
    if (post.content.length <= MAX_LENGTH) return post.content;
    
    return `${post.content.substring(0, MAX_LENGTH)}...`;
  };
  
  return (
    <div className="bg-card shadow-sm rounded-xl p-5 transition-all hover:shadow-md">
      <div className="flex justify-between items-start">
        <div className="flex items-center">
          <img
            src={post.author.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author.name)}&background=random`}
            alt={post.author.name}
            className="h-10 w-10 rounded-full mr-3 object-cover"
          />
          <div>
            <h3 className="font-medium text-foreground">{post.author.name}</h3>
            <p className="text-sm text-muted-foreground">{formattedDate} {post.isEdited && '(edited)'}</p>
          </div>
        </div>
        
        <div className="relative">
          <button 
            onClick={() => setShowOptions(!showOptions)}
            className="text-muted-foreground hover:text-foreground rounded-full p-1.5 hover:bg-accent/50"
          >
            <MoreHorizontal size={20} />
          </button>
          
          {showOptions && (
            <div className="absolute right-0 mt-1 w-48 bg-card border border-border rounded-md shadow-md z-10">
              {/* Only admins can edit and delete posts */}
              {isAdmin && (
                <>
                  <button 
                    onClick={() => {
                      onEdit(post);
                      setShowOptions(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-left hover:bg-accent/50 rounded-t-md"
                  >
                    <Edit size={16} className="mr-2" />
                    Edit post
                  </button>
                  <button 
                    onClick={() => {
                      onDelete(post._id);
                      setShowOptions(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-left hover:bg-accent/50 text-destructive"
                  >
                    <Trash2 size={16} className="mr-2" />
                    Delete post
                  </button>
                  <hr className="border-border my-1" />
                </>
              )}
              
              <button 
                onClick={handleCopyLink}
                className="flex items-center w-full px-4 py-2 text-sm text-left hover:bg-accent/50"
              >
                <Copy size={16} className="mr-2" />
                {copied ? 'Copied!' : 'Copy link'}
              </button>
              
              <button 
                onClick={handleReport}
                className="flex items-center w-full px-4 py-2 text-sm text-left hover:bg-accent/50 rounded-b-md"
              >
                <AlertCircle size={16} className="mr-2" />
                Report
              </button>
            </div>
          )}
        </div>
      </div>
      
      <Link to={`/discussion/${post._id}`} className={showFullContent ? '' : 'block'}>
        <h2 className="text-lg font-semibold mt-3 text-foreground">{post.title}</h2>
        <div className="mt-2 text-foreground whitespace-pre-line">
          {getContentPreview()}
          {!showFullContent && post.content.length > 200 && (
            <span className="text-primary ml-1">Read more</span>
          )}
        </div>
      </Link>
      
      {/* Tags */}
      <div className="flex flex-wrap gap-2 mt-3">
        {post.tags && post.tags.map((tag) => (
          <span key={tag} className="bg-accent text-accent-foreground text-xs px-2 py-1 rounded-full">
            #{tag}
          </span>
        ))}
      </div>
      
      {/* Actions */}
      <div className="mt-4 flex gap-6 text-muted-foreground">
        <button 
          onClick={() => onLike(post._id)}
          className={`flex items-center gap-1 ${hasLiked ? 'text-primary' : 'hover:text-primary'}`}
        >
          <ThumbsUp size={18} />
          <span>{post.likesCount || 0}</span>
        </button>
        <button 
          onClick={() => onComment(post)}
          className="flex items-center gap-1 hover:text-primary"
        >
          <MessageCircle size={18} />
          <span>{post.commentsCount || 0}</span>
        </button>
        <button 
          onClick={handleCopyLink}
          className="flex items-center gap-1 hover:text-primary"
        >
          <Share size={18} />
          <span>{copied ? 'Copied!' : 'Share'}</span>
        </button>
      </div>
    </div>
  );
};

export default DiscussionPost; 