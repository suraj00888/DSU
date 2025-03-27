const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const commentController = require('../controllers/commentController');
const { verifyToken } = require('../middleware/auth');

// Post routes
router.post('/', verifyToken, postController.createPost);
router.get('/', postController.getAllPosts);
router.get('/trending', postController.getTrendingPosts);
router.get('/search', postController.searchPosts);
router.get('/user', verifyToken, postController.getUserPosts);
router.get('/:id', postController.getPostById);
router.put('/:id', verifyToken, postController.updatePost);
router.delete('/:id', verifyToken, postController.deletePost);
router.post('/:id/like', verifyToken, postController.toggleLike);

// Comment routes
router.post('/comments', verifyToken, commentController.createComment);
router.get('/:postId/comments', commentController.getPostComments);
router.put('/comments/:id', verifyToken, commentController.updateComment);
router.delete('/comments/:id', verifyToken, commentController.deleteComment);
router.post('/comments/:id/like', verifyToken, commentController.toggleLike);

module.exports = router; 