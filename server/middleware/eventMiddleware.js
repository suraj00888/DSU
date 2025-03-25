const Event = require('../models/Event');

/**
 * Updates event status based on current date compared to event dates
 * This can be used as middleware or called as a scheduled task
 */
exports.updateEventStatus = async (req, res, next) => {
    try {
        const now = new Date();
        
        // Update events that have started but not yet marked as ongoing
        await Event.updateMany(
            { 
                status: 'upcoming',
                startDate: { $lte: now }
            },
            { 
                $set: { status: 'ongoing' } 
            }
        );
        
        // Update events that have ended but not yet marked as completed
        await Event.updateMany(
            { 
                status: 'ongoing',
                endDate: { $lte: now }
            },
            { 
                $set: { status: 'completed' } 
            }
        );
        
        // If used as middleware, continue to the next function
        if (next) {
            next();
        }
    } catch (error) {
        console.error('Error updating event statuses:', error);
        
        // If used as middleware, continue to the next function
        if (next) {
            next();
        }
    }
};

/**
 * Schedule periodic updates of event statuses
 * @param {number} intervalMinutes - How often to update (default: every 15 minutes)
 */
exports.scheduleStatusUpdates = (intervalMinutes = 15) => {
    // Convert minutes to milliseconds
    const interval = intervalMinutes * 60 * 1000;
    
    // Initial update
    exports.updateEventStatus();
    
    // Schedule periodic updates
    setInterval(() => {
        exports.updateEventStatus();
    }, interval);
    
    console.log(`Scheduled event status updates every ${intervalMinutes} minutes`);
};

/**
 * Middleware to check if an event exists
 */
exports.eventExists = async (req, res, next) => {
    try {
        const event = await Event.findById(req.params.id);
        
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        
        // Attach event to request object for use in controller
        req.event = event;
        next();
    } catch (error) {
        console.error('Error checking if event exists:', error);
        res.status(500).json({ message: 'Server error' });
    }
}; 