const Post = require('../models/Post');
const Comment = require('../models/Comment');
const mongoose = require('mongoose');

// Create a new post
exports.createPost = async (req, res) => {
  try {
    const { title, content, tags, category } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }
    
    const post = new Post({
      title,
      content,
      author: req.user.id,
      tags: tags || [],
      category: category || 'General'
    });
    
    await post.save();
    
    const populatedPost = await Post.findById(post._id)
      .populate('author', 'name email')
      .lean();
    
    return res.status(201).json({ 
      success: true, 
      post: populatedPost 
    });
  } catch (error) {
    console.error('Error creating post:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// Get all posts with pagination
exports.getAllPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const category = req.query.category;
    const tag = req.query.tag;
    const sort = req.query.sort || '-createdAt'; // Default: newest first
    
    // Build query
    const query = { status: 'active' };
    
    // Filter by category
    if (category) {
      query.category = category;
    }
    
    // Filter by tag
    if (tag) {
      query.tags = tag;
    }
    
    // Get total count
    const total = await Post.countDocuments(query);
    
    // Get posts
    const posts = await Post.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('author', 'name email')
      .lean();
    
    return res.status(200).json({
      success: true,
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error getting posts:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get user's posts
exports.getUserPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const total = await Post.countDocuments({ 
      author: req.user.id,
      status: 'active'
    });
    
    const posts = await Post.find({ 
      author: req.user.id,
      status: 'active'
    })
      .sort('-createdAt')
      .skip(skip)
      .limit(limit)
      .populate('author', 'name email')
      .lean();
    
    return res.status(200).json({
      success: true,
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error getting user posts:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get post by ID
exports.getPostById = async (req, res) => {
  try {
    const postId = req.params.id;
    
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ success: false, message: 'Invalid post ID' });
    }
    
    const post = await Post.findOne({ 
      _id: postId,
      status: 'active'
    })
      .populate('author', 'name email')
      .lean();
    
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    
    return res.status(200).json({ success: true, post });
  } catch (error) {
    console.error('Error getting post:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Update post
exports.updatePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const { title, content, tags, category } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ success: false, message: 'Invalid post ID' });
    }
    
    const post = await Post.findById(postId);
    
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    
    // Check if user is the author
    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this post' });
    }
    
    // Update fields
    post.title = title || post.title;
    post.content = content || post.content;
    post.tags = tags || post.tags;
    post.category = category || post.category;
    post.isEdited = true;
    
    await post.save();
    
    const updatedPost = await Post.findById(postId)
      .populate('author', 'name email')
      .lean();
    
    return res.status(200).json({ success: true, post: updatedPost });
  } catch (error) {
    console.error('Error updating post:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Delete post
exports.deletePost = async (req, res) => {
  try {
    const postId = req.params.id;
    
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ success: false, message: 'Invalid post ID' });
    }
    
    const post = await Post.findById(postId);
    
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    
    // Check if user is the author or admin
    if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this post' });
    }
    
    // Soft delete
    post.status = 'deleted';
    await post.save();
    
    return res.status(200).json({ success: true, message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Like/unlike post
exports.toggleLike = async (req, res) => {
  try {
    const postId = req.params.id;
    
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ success: false, message: 'Invalid post ID' });
    }
    
    const post = await Post.findById(postId);
    
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    
    // Check if user already liked the post
    const index = post.likes.findIndex(id => id.toString() === req.user.id);
    
    if (index === -1) {
      // Add like
      post.likes.push(req.user.id);
      post.likesCount = post.likes.length;
    } else {
      // Remove like
      post.likes = post.likes.filter(id => id.toString() !== req.user.id);
      post.likesCount = post.likes.length;
    }
    
    await post.save();
    
    return res.status(200).json({ 
      success: true, 
      liked: index === -1,
      likesCount: post.likesCount
    });
  } catch (error) {
    console.error('Error toggling like:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Search posts
exports.searchPosts = async (req, res) => {
  try {
    const query = req.query.q;
    
    if (!query) {
      return res.status(400).json({ success: false, message: 'Search query is required' });
    }
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const searchQuery = {
      $text: { $search: query },
      status: 'active'
    };
    
    const total = await Post.countDocuments(searchQuery);
    
    const posts = await Post.find(searchQuery)
      .sort({ score: { $meta: 'textScore' } })
      .skip(skip)
      .limit(limit)
      .populate('author', 'name email')
      .lean();
    
    return res.status(200).json({
      success: true,
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error searching posts:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get trending posts
exports.getTrendingPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Define the date range for trending (last 7 days)
    const trendingDate = new Date();
    trendingDate.setDate(trendingDate.getDate() - 7);
    
    const query = { 
      status: 'active',
      createdAt: { $gte: trendingDate }
    };
    
    const total = await Post.countDocuments(query);
    
    // Get posts sorted by likesCount
    const posts = await Post.find(query)
      .sort({ likesCount: -1, commentsCount: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'name email')
      .lean();
    
    return res.status(200).json({
      success: true,
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error getting trending posts:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}; 