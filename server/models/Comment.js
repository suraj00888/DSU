const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  parentComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  likesCount: {
    type: Number,
    default: 0
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['active', 'deleted', 'flagged'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Index for lookup
commentSchema.index({ post: 1, parentComment: 1 });

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment; 