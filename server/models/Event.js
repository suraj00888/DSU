const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    location: {
        type: String,
        required: true,
        trim: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    organizer: {
        id: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        name: {
            type: String,
            required: true
        }
    },
    category: {
        type: String,
        required: true,
        enum: ['academic', 'social', 'career', 'sports', 'other']
    },
    capacity: {
        type: Number,
        min: 1,
        default: null // null means unlimited capacity
    },
    image: {
        type: String,
        default: null
    },
    attendees: [{
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        name: {
            type: String,
            required: true
        }
    }],
    status: {
        type: String,
        enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
        default: 'upcoming'
    }
}, {
    timestamps: true
});

// Index for efficient querying
eventSchema.index({ startDate: 1 });
eventSchema.index({ category: 1 });
eventSchema.index({ status: 1 });
eventSchema.index({ 'organizer.id': 1 });

// Virtual for checking if an event is in the past
eventSchema.virtual('isPast').get(function() {
    return this.endDate < new Date();
});

// Method to check if a user is registered for this event
eventSchema.methods.isUserRegistered = function(userId) {
    return this.attendees.some(attendee => 
        attendee.userId.toString() === userId.toString()
    );
};

// Method to check if an event is at capacity
eventSchema.methods.isAtCapacity = function() {
    // If capacity is null or undefined, event has unlimited capacity
    if (!this.capacity) return false;
    
    // Otherwise check if attendees count has reached capacity
    return this.attendees.length >= this.capacity;
};

// Create model
const Event = mongoose.model('Event', eventSchema);

module.exports = Event; 