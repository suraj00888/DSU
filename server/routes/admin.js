const express = require('express');
const { protect, adminProtect } = require('../middleware/authMiddleware');

const router = express.Router();

// GET /dashboard
router.get('/dashboard', protect, adminProtect, (req, res) => {
    res.json({ message: 'Admin dashboard access granted' });
});

module.exports = router;
