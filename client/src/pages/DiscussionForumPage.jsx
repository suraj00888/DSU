import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, MoreHorizontal, ThumbsUp, MessageCircle, Share, Send } from 'lucide-react';
import AppLayout from '../components/AppLayout';
import Header from '../components/Header';
import { Button } from '../components/index.jsx';
import { 
  DiscussionPost, 
  CreatePostModal, 
  PostFilters 
} from '../components/discussion';
import api from '../api';

const DiscussionForumPage = () => {
  const { status: isAuthenticated, user } = useSelector(state => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Check if user is admin
  const isAdmin = user?.role === 'admin';
  
  // State
  const [activeTab, setActiveTab] = useState('all');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  });
  const [filters, setFilters] = useState({ category: '', tag: '' });
  const [sortOption, setSortOption] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Available categories
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
  
  // Fetch posts based on active tab, filters, and pagination
  useEffect(() => {
    fetchPosts();
  }, [activeTab, pagination.page, filters, sortOption, searchQuery]);
  
  // Map sort option to API sort parameter
  const getSortParam = () => {
    switch (sortOption) {
      case 'newest': return '-createdAt';
      case 'oldest': return 'createdAt';
      case 'most_liked': return '-likesCount';
      case 'most_commented': return '-commentsCount';
      default: return '-createdAt';
    }
  };
  
  // Fetch posts
  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let url = '/api/posts';
      let params = {
        page: pagination.page,
        limit: pagination.limit,
        sort: getSortParam()
      };
      
      // Add filters
      if (filters.category) {
        params.category = filters.category;
      }
      
      if (filters.tag) {
        params.tag = filters.tag;
      }
      
      // Handle different tabs
      if (activeTab === 'my' && isAuthenticated) {
        url = '/api/posts/user';
      } else if (activeTab === 'trending') {
        url = '/api/posts/trending';
      }
      
      // Handle search
      if (searchQuery) {
        url = '/api/posts/search';
        params.q = searchQuery;
      }
      
      const response = await api.get(url, { params });
      
      setPosts(response.data.posts);
      setPagination(response.data.pagination);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Failed to load posts. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  };
  
  // Handle create/edit post
  const handlePostSubmit = async (postData) => {
    try {
      if (editingPost) {
        // Update existing post
        await api.put(`/api/posts/${editingPost._id}`, postData);
        setEditingPost(null);
      } else {
        // Create new post
        await api.post('/api/posts', postData);
      }
      
      setShowCreateModal(false);
      fetchPosts(); // Refresh posts
    } catch (err) {
      console.error('Error saving post:', err);
      alert('Failed to save post. Please try again.');
    }
  };
  
  // Handle post like
  const handlePostLike = async (postId) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/discussion' } });
      return;
    }
    
    try {
      await api.post(`/api/posts/${postId}/like`);
      
      // Update local state
      setPosts(prevPosts => 
        prevPosts.map(post => {
          if (post._id === postId) {
            const userLiked = post.likes && post.likes.includes(user.id);
            return {
              ...post,
              likes: userLiked 
                ? post.likes.filter(id => id !== user.id) 
                : [...post.likes, user.id],
              likesCount: userLiked ? post.likesCount - 1 : post.likesCount + 1
            };
          }
          return post;
        })
      );
    } catch (err) {
      console.error('Error liking post:', err);
    }
  };
  
  // Handle post delete
  const handlePostDelete = async (postId) => {
    if (!isAdmin) {
      alert('Only administrators can delete posts.');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await api.delete(`/api/posts/${postId}`);
        
        // Remove from local state
        setPosts(prevPosts => prevPosts.filter(post => post._id !== postId));
      } catch (err) {
        console.error('Error deleting post:', err);
        alert('Failed to delete post. Please try again.');
      }
    }
  };
  
  // Handle post edit
  const handlePostEdit = (post) => {
    if (!isAdmin) {
      alert('Only administrators can edit posts.');
      return;
    }
    
    setEditingPost(post);
    setShowCreateModal(true);
  };
  
  // Handle comment action
  const handleComment = (post) => {
    navigate(`/discussion/${post._id}`);
  };
  
  // Handle filter change
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  };
  
  // Handle sort change
  const handleSortChange = (sortBy) => {
    setSortOption(sortBy);
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  };
  
  // Handle search
  const handleSearch = (query) => {
    setSearchQuery(query);
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  };
  
  // Load more posts
  const loadMorePosts = () => {
    if (pagination.page < pagination.pages) {
      setPagination(prev => ({ ...prev, page: prev.page + 1 }));
    }
  };
  
  // Check if post creation input should be shown
  const showQuickPostInput = isAuthenticated && !showCreateModal;
  
  return (
    <AppLayout>
      <Header title="Discussion Forum" />
      
      {/* Tab Navigation */}
      <div className="bg-background border-b border-border">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-4 overflow-x-auto py-3">
            <button
              onClick={() => handleTabChange('all')}
              className={`px-4 py-2 font-medium rounded-md whitespace-nowrap ${activeTab === 'all' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-secondary/50'}`}
            >
              All Discussions
            </button>
            <button
              onClick={() => handleTabChange('trending')}
              className={`px-4 py-2 font-medium rounded-md whitespace-nowrap ${activeTab === 'trending' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-secondary/50'}`}
            >
              Trending
            </button>
            {isAuthenticated && (
              <button
                onClick={() => handleTabChange('my')}
                className={`px-4 py-2 font-medium rounded-md whitespace-nowrap ${activeTab === 'my' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-secondary/50'}`}
              >
                My Discussions
              </button>
            )}
            
            <div className="ml-auto">
              {isAdmin && (
                <Button 
                  onClick={(e) => {
                    e.preventDefault(); // Prevent any default behavior
                    e.stopPropagation(); // Stop event propagation
                    console.log("New Post button clicked");
                    console.log("isAuthenticated:", isAuthenticated);
                    console.log("user:", user);
                    
                    if (isAuthenticated) {
                      console.log("User is authenticated, showing modal");
                      setEditingPost(null);
                      setShowCreateModal(true);
                      console.log("Modal state set to:", true);
                    } else {
                      console.log("User is not authenticated, redirecting to login");
                      navigate('/login', { state: { from: '/discussion' } });
                    }
                  }}
                  className="bg-primary text-primary-foreground px-4 py-2 rounded-md transition-colors"
                  type="button" // Explicitly set type to button to prevent form submission
                >
                  New Post
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <main className="w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Create Post Box (Quick Input) */}
        {showQuickPostInput && isAdmin && (
          <div className="bg-card/90 backdrop-blur-sm rounded-xl shadow-md p-5 mb-6">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <MessageSquare className="h-5 w-5" />
              </div>
              <input
                type="text"
                placeholder="Start a new discussion..."
                className="w-full p-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ml-3"
                onClick={() => setShowCreateModal(true)}
                readOnly
              />
            </div>
            <div className="flex justify-between items-center mt-3">
              <div className="text-sm text-muted-foreground">Click to create a new post</div>
              <Button 
                size="sm" 
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-3 py-1 rounded-md transition-colors flex items-center gap-1"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log("Quick input Create Post button clicked");
                  setEditingPost(null);
                  setShowCreateModal(true);
                }}
                type="button"
              >
                <Send size={14} />
                Create Post
              </Button>
            </div>
          </div>
        )}
        
        {/* Filters */}
        <PostFilters
          onSearch={handleSearch}
          onFilterChange={handleFilterChange}
          onSortChange={handleSortChange}
          categories={categories}
          initialFilters={filters}
          initialSort={sortOption}
        />
        
        {/* Create/Edit Post Modal */}
        {showCreateModal && (
          <CreatePostModal
            isOpen={showCreateModal}
            onClose={() => {
              console.log("Closing modal");
              setShowCreateModal(false);
              setEditingPost(null);
            }}
            onSubmit={handlePostSubmit}
            editingPost={editingPost}
          />
        )}
        
        {/* Loading and Error States */}
        {loading && posts.length === 0 && (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading discussions...</p>
          </div>
        )}
        
        {error && (
          <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-6">
            <p>{error}</p>
            <button 
              onClick={fetchPosts}
              className="mt-2 text-sm underline"
            >
              Try Again
            </button>
          </div>
        )}
        
        {/* No Posts Found */}
        {!loading && !error && posts.length === 0 && (
          <div className="text-center py-16 border border-dashed border-border rounded-xl">
            <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground" />
            <h3 className="mt-4 font-medium text-foreground">No discussions found</h3>
            <p className="text-muted-foreground mt-1">
              {activeTab === 'my' 
                ? "You haven't created any discussions yet." 
                : searchQuery 
                  ? "No discussions match your search criteria."
                  : isAdmin 
                    ? "Be the first to start a discussion!"
                    : "No discussions available. Only administrators can create new posts."}
            </p>
            
            {isAdmin && isAuthenticated && (
              <Button 
                onClick={() => setShowCreateModal(true)}
                className="mt-4 bg-primary text-primary-foreground"
              >
                Create New Post
              </Button>
            )}
          </div>
        )}
        
        {/* Discussion Posts */}
        {posts.length > 0 && (
          <div className="space-y-6">
            {posts.map((post) => (
              <DiscussionPost
                key={post._id}
                post={post}
                onLike={handlePostLike}
                onDelete={handlePostDelete}
                onEdit={handlePostEdit}
                onComment={handleComment}
              />
            ))}
            
            {/* Load More Button */}
            {pagination.page < pagination.pages && (
              <div className="flex justify-center mt-8">
                <Button 
                  onClick={loadMorePosts}
                  className="bg-accent hover:bg-accent/90 text-accent-foreground"
                  disabled={loading}
                >
                  {loading ? 'Loading...' : 'Load More'}
                </Button>
              </div>
            )}
          </div>
        )}
      </main>
    </AppLayout>
  );
};

export default DiscussionForumPage; 