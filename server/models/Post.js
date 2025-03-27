const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
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
  tags: [{
    type: String,
    trim: true
  }],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  likesCount: {
    type: Number,
    default: 0
  },
  commentsCount: {
    type: Number,
    default: 0
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  category: {
    type: String,
    trim: true,
    default: 'General'
  },
  status: {
    type: String,
    enum: ['active', 'deleted', 'flagged'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Index for search
postSchema.index({ title: 'text', content: 'text', tags: 'text' });

const Post = mongoose.model('Post', postSchema);

module.exports = Post; 