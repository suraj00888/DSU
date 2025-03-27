import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ChevronLeft, AlertTriangle } from 'lucide-react';
import api from '../api';
import AppLayout from '../components/AppLayout';
import Header from '../components/Header';
import { Button } from '../components/index.jsx';
import { DiscussionPost, CommentSection, CreatePostModal } from '../components/discussion';

const PostDetailsPage = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { status: isAuthenticated, user } = useSelector(state => state.auth);
  
  // Check if user is admin
  const isAdmin = user?.role === 'admin';
  
  // State
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentsPagination, setCommentsPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  });
  const [loading, setLoading] = useState(true);
  const [commentLoading, setCommentLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  
  // Add more detailed console logs to track component state
  console.log("PostDetailsPage rendered. Auth status:", isAuthenticated, "User:", user?.id, "PostId:", postId);
  
  // Fetch post and comments data
  useEffect(() => {
    fetchPost();
  }, [postId]);
  
  // Fetch post details
  const fetchPost = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get(`/api/posts/${postId}`);
      setPost(response.data.post);
      
      // Now fetch comments
      fetchComments(1);
    } catch (err) {
      console.error('Error fetching post:', err);
      setError('Failed to load the post. It may not exist or has been removed.');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch comments for the post
  const fetchComments = async (page = 1) => {
    setCommentLoading(true);
    
    try {
      const response = await api.get(`/api/posts/${postId}/comments`, {
        params: { page, limit: 10 }
      });
      
      if (page === 1) {
        // Replace comments
        setComments(response.data.comments);
      } else {
        // Append comments
        setComments(prev => [...prev, ...response.data.comments]);
      }
      
      setCommentsPagination(response.data.pagination);
    } catch (err) {
      console.error('Error fetching comments:', err);
    } finally {
      setCommentLoading(false);
    }
  };
  
  // Handle post edit
  const handlePostEdit = (updatedPost) => {
    try {
      setShowEditModal(false);
      
      // Optimistically update the post in the UI
      setPost(prev => ({
        ...prev,
        title: updatedPost.title,
        content: updatedPost.content,
        tags: updatedPost.tags,
        category: updatedPost.category,
        isEdited: true
      }));
      
    } catch (err) {
      console.error('Error updating post:', err);
      alert('Failed to update post. Please try again.');
    }
  };
  
  // Handle post delete
  const handlePostDelete = async () => {
    if (!isAdmin) {
      alert('Only administrators can delete posts.');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await api.delete(`/api/posts/${postId}`);
        
        // Navigate back to discussions
        navigate('/discussion');
      } catch (err) {
        console.error('Error deleting post:', err);
        alert('Failed to delete post. Please try again.');
      }
    }
  };
  
  // Handle post like
  const handlePostLike = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/discussion/${postId}` } });
      return;
    }
    
    try {
      const response = await api.post(`/api/posts/${postId}/like`);
      
      // Update post in state
      setPost(prev => ({
        ...prev,
        likes: response.data.liked 
          ? [...(prev.likes || []), 'temp-id'] // Temporary ID until page refresh
          : (prev.likes || []).filter(id => id !== prev.user?.id),
        likesCount: response.data.likesCount
      }));
    } catch (err) {
      console.error('Error liking post:', err);
    }
  };
  
  // Handle adding a new comment
  const handleAddComment = async (postId, content) => {
    console.log("handleAddComment called with:", postId, content);
    
    if (!isAuthenticated) {
      console.log("User not authenticated, redirecting to login");
      navigate('/login', { state: { from: `/discussion/${postId}` } });
      return;
    }
    
    try {
      console.log("Sending comment request to API");
      const response = await api.post('/api/posts/comments', {
        postId,
        content
      });
      
      console.log("Comment added successfully:", response.data);
      
      // Add new comment to the list
      setComments(prev => [response.data.comment, ...prev]);
      
      // Update post's comment count
      setPost(prev => ({
        ...prev,
        commentsCount: (prev.commentsCount || 0) + 1
      }));
      
      // Update pagination
      setCommentsPagination(prev => ({
        ...prev,
        total: prev.total + 1
      }));
    } catch (err) {
      console.error('Error adding comment:', err);
      console.error('Error details:', err.response ? err.response.data : 'No response data');
      alert('Failed to add comment. Please try again.');
    }
  };
  
  // Handle reply to comment
  const handleReply = async (commentId, content) => {
    console.log("handleReply called with:", commentId, content);
    
    if (!isAuthenticated) {
      console.log("User not authenticated, redirecting to login");
      navigate('/login', { state: { from: `/discussion/${postId}` } });
      return;
    }
    
    try {
      console.log("Sending reply request to API");
      const response = await api.post('/api/posts/comments', {
        postId,
        content,
        parentCommentId: commentId
      });
      
      console.log("Reply added successfully:", response.data);
      
      // Update the comments in state
      setComments(prev => {
        return prev.map(comment => {
          if (comment._id === commentId) {
            return {
              ...comment,
              replies: [...(comment.replies || []), response.data.comment]
            };
          }
          return comment;
        });
      });
      
      // Update post's comment count
      setPost(prev => ({
        ...prev,
        commentsCount: (prev.commentsCount || 0) + 1
      }));
    } catch (err) {
      console.error('Error replying to comment:', err);
      console.error('Error details:', err.response ? err.response.data : 'No response data');
      alert('Failed to add reply. Please try again.');
    }
  };
  
  // Handle like comment
  const handleCommentLike = async (commentId) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/discussion/${postId}` } });
      return;
    }
    
    try {
      const response = await api.post(`/api/posts/comments/${commentId}/like`);
      
      // Update comments in state (both top-level and replies)
      setComments(prev => {
        return prev.map(comment => {
          // Check if this is the comment that was liked
          if (comment._id === commentId) {
            return {
              ...comment,
              likes: response.data.liked 
                ? [...(comment.likes || []), 'temp-id'] 
                : (comment.likes || []).filter(id => id !== 'user-id'),
              likesCount: response.data.likesCount
            };
          }
          
          // Check if this comment has replies and the liked comment is one of them
          if (comment.replies) {
            return {
              ...comment,
              replies: comment.replies.map(reply => {
                if (reply._id === commentId) {
                  return {
                    ...reply,
                    likes: response.data.liked 
                      ? [...(reply.likes || []), 'temp-id'] 
                      : (reply.likes || []).filter(id => id !== 'user-id'),
                    likesCount: response.data.likesCount
                  };
                }
                return reply;
              })
            };
          }
          
          return comment;
        });
      });
    } catch (err) {
      console.error('Error liking comment:', err);
    }
  };
  
  // Handle edit comment
  const handleEditComment = async (comment) => {
    // Implement comment editing UI (could use a modal or inline editing)
    const newContent = prompt('Edit your comment:', comment.content);
    
    if (newContent && newContent !== comment.content) {
      try {
        const response = await api.put(`/api/posts/comments/${comment._id}`, {
          content: newContent
        });
        
        // Update comment in state (both top-level and replies)
        setComments(prev => {
          return prev.map(c => {
            // Check if this is the comment that was edited
            if (c._id === comment._id) {
              return response.data.comment;
            }
            
            // Check if this comment has replies and the edited comment is one of them
            if (c.replies) {
              return {
                ...c,
                replies: c.replies.map(reply => {
                  if (reply._id === comment._id) {
                    return response.data.comment;
                  }
                  return reply;
                })
              };
            }
            
            return c;
          });
        });
      } catch (err) {
        console.error('Error editing comment:', err);
        alert('Failed to edit comment. Please try again.');
      }
    }
  };
  
  // Handle delete comment
  const handleDeleteComment = async (commentId) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        await api.delete(`/api/posts/comments/${commentId}`);
        
        // Update comments in state
        setComments(prev => {
          // First try to remove from top-level comments
          const filteredComments = prev.filter(c => c._id !== commentId);
          
          // If length is the same, it might be a reply
          if (filteredComments.length === prev.length) {
            return prev.map(comment => {
              if (comment.replies) {
                return {
                  ...comment,
                  replies: comment.replies.filter(reply => reply._id !== commentId)
                };
              }
              return comment;
            });
          }
          
          return filteredComments;
        });
        
        // Update post's comment count
        setPost(prev => ({
          ...prev,
          commentsCount: Math.max(0, (prev.commentsCount || 0) - 1)
        }));
      } catch (err) {
        console.error('Error deleting comment:', err);
        alert('Failed to delete comment. Please try again.');
      }
    }
  };
  
  // Handle load more comments
  const handleLoadMoreComments = () => {
    if (commentsPagination.page < commentsPagination.pages) {
      fetchComments(commentsPagination.page + 1);
    }
  };
  
  // Render loading state
  if (loading && !post) {
    return (
      <AppLayout>
        <Header title="Post Details" />
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading post...</p>
          </div>
        </div>
      </AppLayout>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <AppLayout>
        <Header title="Post Not Found" />
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="bg-destructive/10 text-destructive p-8 rounded-xl text-center max-w-2xl mx-auto">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Post Not Found</h2>
            <p className="mb-6">{error}</p>
            <Link to="/discussion">
              <Button className="bg-primary text-primary-foreground">
                <ChevronLeft className="mr-1" size={16} />
                Back to Discussions
              </Button>
            </Link>
          </div>
        </div>
      </AppLayout>
    );
  }
  
  // Main render with post and comments
  return (
    <AppLayout>
      <Header title="Discussion Post" />
      
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Back button */}
        <div className="mb-6">
          <Link 
            to="/discussion"
            className="inline-flex items-center text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft size={18} />
            <span>Back to Discussions</span>
          </Link>
        </div>
        
        {/* Post content */}
        {post && (
          <div className="max-w-4xl mx-auto">
            <DiscussionPost
              post={post}
              onLike={handlePostLike}
              onDelete={handlePostDelete}
              onEdit={() => setShowEditModal(true)}
              onComment={() => {}}
              showFullContent={true}
            />
            
            {/* Comments section */}
            <CommentSection
              postId={postId}
              comments={comments}
              loading={commentLoading}
              onAddComment={handleAddComment}
              onReply={handleReply}
              onLike={handleCommentLike}
              onEdit={handleEditComment}
              onDelete={handleDeleteComment}
              pagination={commentsPagination}
              onLoadMore={handleLoadMoreComments}
            />
          </div>
        )}
        
        {/* Edit Post Modal */}
        {showEditModal && post && (
          <CreatePostModal
            isOpen={showEditModal}
            onClose={() => setShowEditModal(false)}
            onSubmit={handlePostEdit}
            editingPost={post}
          />
        )}
      </div>
    </AppLayout>
  );
};

export default PostDetailsPage; 