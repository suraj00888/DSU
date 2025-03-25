const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { eventExists } = require('../middleware/eventMiddleware');
const eventController = require('../controllers/eventController');

// GET /api/events - Get all events with pagination and filtering
router.get('/', eventController.getEvents);

// GET /api/events/user/attending - Get events user is attending (protected)
// This specific route needs to come before the :id route to prevent conflicts
router.get('/user/attending', protect, eventController.getUserEvents);

// GET /api/events/:id - Get a specific event
router.get('/:id', eventExists, eventController.getEvent);

// POST /api/events - Create a new event (protected)
router.post('/', protect, eventController.createEvent);

// PUT /api/events/:id - Update an event (protected)
router.put('/:id', protect, eventExists, eventController.updateEvent);

// DELETE /api/events/:id - Delete/cancel an event (protected)
router.delete('/:id', protect, eventExists, eventController.deleteEvent);

// POST /api/events/:id/register - Register for an event (protected)
router.post('/:id/register', protect, eventExists, eventController.registerForEvent);

// DELETE /api/events/:id/register - Cancel registration (protected)
router.delete('/:id/register', protect, eventExists, eventController.cancelRegistration);

// GET /api/events/:id/attendees - Get event attendees
router.get('/:id/attendees', eventExists, eventController.getEventAttendees);

module.exports = router; 