import React, { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ThumbsUp, MoreHorizontal, Edit, Trash2, Reply, Send } from 'lucide-react';
import { useSelector } from 'react-redux';

const CommentItem = ({ comment, onReply, onLike, onEdit, onDelete }) => {
  const { user } = useSelector((state) => state.auth);
  const [showOptions, setShowOptions] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  
  // Check if user has liked the comment
  const hasLiked = user && comment.likes && comment.likes.includes(user.id);
  
  // Format date
  const formattedDate = comment.createdAt 
    ? formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })
    : '2 days ago'; // Fallback for mock data
  
  const handleReplySubmit = (e) => {
    // If event is passed, prevent default behavior
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    console.log("Reply submit triggered for comment:", comment._id);
    
    if (replyContent.trim()) {
      console.log("Submitting reply:", replyContent);
      onReply(comment._id, replyContent);
      setReplyContent('');
      setShowReplyForm(false);
    } else {
      console.log("Reply is empty, not submitting");
    }
  };
  
  return (
    <div className="pt-4">
      <div className="flex items-start gap-3">
        <img
          src={comment.author.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.author.name)}&background=random`}
          alt={comment.author.name}
          className="h-8 w-8 rounded-full object-cover"
        />
        
        <div className="flex-1">
          <div className="bg-accent/30 rounded-lg p-3">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-medium text-foreground">{comment.author.name}</span>
                <span className="text-xs text-muted-foreground ml-2">{formattedDate} {comment.isEdited && '(edited)'}</span>
              </div>
              
              <div className="relative">
                <button 
                  onClick={() => setShowOptions(!showOptions)}
                  className="text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-accent/50"
                >
                  <MoreHorizontal size={16} />
                </button>
                
                {showOptions && (
                  <div className="absolute right-0 mt-1 w-36 bg-card border border-border rounded-md shadow-md z-10">
                    {user && user.id === comment.author._id && (
                      <>
                        <button 
                          onClick={() => {
                            onEdit(comment);
                            setShowOptions(false);
                          }}
                          className="flex items-center w-full px-3 py-1.5 text-xs text-left hover:bg-accent/50 rounded-t-md"
                        >
                          <Edit size={14} className="mr-2" />
                          Edit
                        </button>
                        <button 
                          onClick={() => {
                            onDelete(comment._id);
                            setShowOptions(false);
                          }}
                          className="flex items-center w-full px-3 py-1.5 text-xs text-left hover:bg-accent/50 text-destructive rounded-b-md"
                        >
                          <Trash2 size={14} className="mr-2" />
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            <p className="text-foreground mt-1 text-sm whitespace-pre-line">{comment.content}</p>
          </div>
          
          <div className="flex items-center mt-1.5 ml-1 gap-4">
            <button 
              onClick={() => onLike(comment._id)}
              className={`flex items-center gap-1 text-xs ${hasLiked ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}
            >
              <ThumbsUp size={14} />
              <span>{comment.likesCount || 0}</span>
            </button>
            
            <button 
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
            >
              <Reply size={14} />
              <span>Reply</span>
            </button>
          </div>
          
          {/* Reply form */}
          {showReplyForm && (
            <div className="mt-3 ml-1 flex items-start gap-2">
              <img
                src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=random`}
                alt={user?.name || 'User'}
                className="h-7 w-7 rounded-full object-cover"
              />
              
              <div className="flex-1 flex rounded-full border border-border bg-background overflow-hidden pl-3">
                <input
                  type="text"
                  placeholder="Write a reply..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleReplySubmit(e);
                    }
                  }}
                  className="flex-1 bg-transparent text-sm py-1.5 focus:outline-none"
                />
                
                <button 
                  onClick={(e) => handleReplySubmit(e)}
                  className="px-3 text-primary hover:text-primary/80" 
                  disabled={!replyContent.trim()}
                  type="button"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          )}
          
          {/* Nested replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="ml-4 mt-3 space-y-3 border-l-2 border-border pl-3">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply._id}
                  comment={reply}
                  onReply={onReply}
                  onLike={onLike}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const CommentSection = ({ 
  postId, 
  comments, 
  loading, 
  onAddComment, 
  onReply, 
  onLike, 
  onEdit, 
  onDelete,
  pagination,
  onLoadMore 
}) => {
  const { user } = useSelector((state) => state.auth);
  const [newComment, setNewComment] = useState('');
  
  const handleCommentSubmit = (e) => {
    // If event is passed, prevent default behavior
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    console.log("Comment submit triggered");
    
    if (newComment.trim()) {
      console.log("Submitting comment:", newComment);
      onAddComment(postId, newComment);
      setNewComment('');
    } else {
      console.log("Comment is empty, not submitting");
    }
  };
  
  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-4">Comments ({pagination?.total || 0})</h3>
      
      {/* Add comment form */}
      {user && (
        <div className="flex items-start gap-3 mb-6">
          <img
            src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`}
            alt={user.name}
            className="h-10 w-10 rounded-full object-cover"
          />
          
          <div className="flex-1">
            <textarea
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="w-full px-3 py-2 bg-accent/30 rounded-lg border border-border resize-none focus:outline-none focus:ring-1 focus:ring-primary min-h-[80px]"
            />
            
            <div className="flex justify-end mt-2">
              <button
                onClick={(e) => handleCommentSubmit(e)}
                disabled={!newComment.trim()}
                className="bg-primary text-primary-foreground px-4 py-1.5 rounded-md hover:bg-primary/90 flex items-center gap-1.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                type="button"
              >
                <Send size={16} />
                Comment
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Comments list */}
      <div className="space-y-4">
        {loading ? (
          <p className="text-center text-muted-foreground py-4">Loading comments...</p>
        ) : comments.length > 0 ? (
          <>
            {comments.map((comment) => (
              <CommentItem
                key={comment._id}
                comment={comment}
                onReply={onReply}
                onLike={onLike}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
            
            {/* Load more button */}
            {pagination && pagination.page < pagination.pages && (
              <div className="flex justify-center mt-4">
                <button
                  onClick={onLoadMore}
                  className="text-sm text-primary hover:text-primary/80"
                >
                  Load more comments
                </button>
              </div>
            )}
          </>
        ) : (
          <p className="text-center text-muted-foreground py-4">No comments yet. Be the first to comment!</p>
        )}
      </div>
    </div>
  );
};

export default CommentSection;