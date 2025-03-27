const Comment = require('../models/Comment');
const Post = require('../models/Post');
const mongoose = require('mongoose');

// Create a comment
exports.createComment = async (req, res) => {
  try {
    const { postId, content, parentCommentId } = req.body;
    
    if (!content) {
      return res.status(400).json({ success: false, message: 'Comment content is required' });
    }
    
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ success: false, message: 'Invalid post ID' });
    }
    
    // Check if post exists
    const post = await Post.findById(postId);
    
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    
    // Check if parent comment exists if provided
    if (parentCommentId && !mongoose.Types.ObjectId.isValid(parentCommentId)) {
      return res.status(400).json({ success: false, message: 'Invalid parent comment ID' });
    }
    
    if (parentCommentId) {
      const parentComment = await Comment.findById(parentCommentId);
      if (!parentComment) {
        return res.status(404).json({ success: false, message: 'Parent comment not found' });
      }
    }
    
    // Create comment
    const comment = new Comment({
      post: postId,
      content,
      author: req.user.id,
      parentComment: parentCommentId || null
    });
    
    await comment.save();
    
    // Increment post's commentsCount
    post.commentsCount += 1;
    await post.save();
    
    // Return populated comment
    const populatedComment = await Comment.findById(comment._id)
      .populate('author', 'name email')
      .lean();
    
    return res.status(201).json({ 
      success: true, 
      comment: populatedComment 
    });
  } catch (error) {
    console.error('Error creating comment:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get comments for a post
exports.getPostComments = async (req, res) => {
  try {
    const postId = req.params.postId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ success: false, message: 'Invalid post ID' });
    }
    
    // Get total count of root comments
    const total = await Comment.countDocuments({ 
      post: postId, 
      parentComment: null,
      status: 'active'
    });
    
    // Get root comments
    const rootComments = await Comment.find({ 
      post: postId, 
      parentComment: null,
      status: 'active'
    })
      .sort('-createdAt')
      .skip(skip)
      .limit(limit)
      .populate('author', 'name email')
      .lean();
    
    // Get all replies for these root comments
    const commentIds = rootComments.map(comment => comment._id);
    
    const replies = await Comment.find({
      post: postId,
      parentComment: { $in: commentIds },
      status: 'active'
    })
      .populate('author', 'name email')
      .lean();
    
    // Organize replies by parent comment
    const commentMap = {};
    rootComments.forEach(comment => {
      comment.replies = [];
      commentMap[comment._id] = comment;
    });
    
    replies.forEach(reply => {
      const parentId = reply.parentComment.toString();
      if (commentMap[parentId]) {
        commentMap[parentId].replies.push(reply);
      }
    });
    
    return res.status(200).json({
      success: true,
      comments: rootComments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error getting comments:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Update comment
exports.updateComment = async (req, res) => {
  try {
    const commentId = req.params.id;
    const { content } = req.body;
    
    if (!content) {
      return res.status(400).json({ success: false, message: 'Comment content is required' });
    }
    
    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      return res.status(400).json({ success: false, message: 'Invalid comment ID' });
    }
    
    const comment = await Comment.findById(commentId);
    
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }
    
    // Check if user is the author
    if (comment.author.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this comment' });
    }
    
    // Update comment
    comment.content = content;
    comment.isEdited = true;
    
    await comment.save();
    
    // Return updated comment
    const updatedComment = await Comment.findById(commentId)
      .populate('author', 'name email')
      .lean();
    
    return res.status(200).json({ 
      success: true, 
      comment: updatedComment 
    });
  } catch (error) {
    console.error('Error updating comment:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Delete comment
exports.deleteComment = async (req, res) => {
  try {
    const commentId = req.params.id;
    
    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      return res.status(400).json({ success: false, message: 'Invalid comment ID' });
    }
    
    const comment = await Comment.findById(commentId);
    
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }
    
    // Check if user is the author or admin
    if (comment.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this comment' });
    }
    
    // Soft delete
    comment.status = 'deleted';
    comment.content = 'This comment has been deleted';
    await comment.save();
    
    // Decrement post's commentsCount
    await Post.findByIdAndUpdate(comment.post, { $inc: { commentsCount: -1 } });
    
    return res.status(200).json({ 
      success: true, 
      message: 'Comment deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Like/unlike comment
exports.toggleLike = async (req, res) => {
  try {
    const commentId = req.params.id;
    
    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      return res.status(400).json({ success: false, message: 'Invalid comment ID' });
    }
    
    const comment = await Comment.findById(commentId);
    
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }
    
    // Check if user already liked the comment
    const index = comment.likes.findIndex(id => id.toString() === req.user.id);
    
    if (index === -1) {
      // Add like
      comment.likes.push(req.user.id);
      comment.likesCount = comment.likes.length;
    } else {
      // Remove like
      comment.likes = comment.likes.filter(id => id.toString() !== req.user.id);
      comment.likesCount = comment.likes.length;
    }
    
    await comment.save();
    
    return res.status(200).json({ 
      success: true, 
      liked: index === -1,
      likesCount: comment.likesCount
    });
  } catch (error) {
    console.error('Error toggling comment like:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}; 