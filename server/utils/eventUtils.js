/**
 * Utility functions for events
 */

/**
 * Get date boundaries for time periods
 * @param {string} period - 'today', 'week', 'month', or 'custom'
 * @param {Date} startDate - Start date for custom period
 * @param {Date} endDate - End date for custom period
 * @returns {Object} Start and end date objects
 */
exports.getDateRange = (period, startDate = null, endDate = null) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (period) {
        case 'today':
            // Today's date range (00:00 to 23:59)
            return {
                start: today,
                end: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1) // End of day
            };
            
        case 'week':
            // Current week (Sunday to Saturday)
            const startOfWeek = new Date(today);
            startOfWeek.setDate(today.getDate() - today.getDay()); // Start from Sunday
            
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6); // End on Saturday at 23:59
            endOfWeek.setHours(23, 59, 59, 999);
            
            return { start: startOfWeek, end: endOfWeek };
            
        case 'month':
            // Current month
            const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
            
            return { start: startOfMonth, end: endOfMonth };
            
        case 'custom':
            // Custom date range
            if (!startDate || !endDate) {
                throw new Error('Start and end dates are required for custom range');
            }
            
            const customStart = new Date(startDate);
            const customEnd = new Date(endDate);
            customEnd.setHours(23, 59, 59, 999); // End of day
            
            return { start: customStart, end: customEnd };
            
        default:
            // Default to all upcoming events (from today onwards)
            return { start: today, end: null };
    }
};

/**
 * Group events by date for calendar view
 * @param {Array} events - Array of event objects
 * @returns {Object} Events grouped by date
 */
exports.groupEventsByDate = (events) => {
    const grouped = {};
    
    events.forEach(event => {
        const date = new Date(event.startDate);
        const dateKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
        
        if (!grouped[dateKey]) {
            grouped[dateKey] = [];
        }
        
        grouped[dateKey].push(event);
    });
    
    return grouped;
};

/**
 * Format event data for client-side consumption
 * @param {Object} event - Event object from database
 * @param {string} userId - Current user ID (optional)
 * @param {string} userRole - User role (optional)
 * @returns {Object} Formatted event object
 */
exports.formatEventData = (event, userId = null, userRole = null) => {
    // Convert to plain object if it's a Mongoose document
    const eventObj = event.toObject ? event.toObject() : { ...event };
    
    // Add derived properties
    const now = new Date();
    
    // Add capacity information
    if (event.capacity) {
        // Use the model's isAtCapacity method if available, otherwise calculate it
        eventObj.isAtCapacity = typeof event.isAtCapacity === 'function' 
            ? event.isAtCapacity() 
            : (event.attendees.length >= event.capacity);
            
        eventObj.spotsRemaining = Math.max(0, event.capacity - event.attendees.length);
    }
    
    // Add user-specific information if userId is provided
    if (userId) {
        // Flag indicating if user is an admin
        const isAdmin = userRole === 'admin';
        eventObj.isAdmin = isAdmin;
        
        // Check if the user is in the attendees list
        eventObj.isAttending = event.attendees.some(
            attendee => attendee.userId.toString() === userId.toString()
        );
        
        // Check if user is the organizer
        eventObj.isOrganizer = event.organizer.id.toString() === userId.toString();
        
        // Determine if user can register (not admin, not attending, and event not at capacity)
        eventObj.canRegister = !isAdmin && 
                              !eventObj.isAttending && 
                              !eventObj.isAtCapacity && 
                              event.status === 'upcoming';
    }
    
    return eventObj;
}; 