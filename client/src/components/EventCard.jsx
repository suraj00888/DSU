import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Clock, Users } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '../lib/utils';

/**
 * Event Card Component
 * Displays a preview of an event with core information
 */
const EventCard = ({ event, className }) => {
  const navigate = useNavigate();
  
  // Format date for display
  const formatDate = (dateString) => {
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Format time for display
  const formatTime = (dateString) => {
    const options = { hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleTimeString(undefined, options);
  };
  
  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'ongoing':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Get category color
  const getCategoryColor = (category) => {
    switch (category) {
      case 'academic':
        return 'bg-indigo-100 text-indigo-800';
      case 'social':
        return 'bg-pink-100 text-pink-800';
      case 'career':
        return 'bg-amber-100 text-amber-800';
      case 'sports':
        return 'bg-emerald-100 text-emerald-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Navigate to event details page
  const viewEventDetails = () => {
    navigate(`/events/${event._id}`);
  };
  
  return (
    <div 
      className={cn(
        "bg-card hover:bg-card/90 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200 border border-border/50",
        className
      )}
    >
      {/* Event Status Badge */}
      <div className="flex justify-between items-start mb-3">
        <span className={cn(
          "text-xs px-2 py-1 rounded-full font-medium capitalize",
          getStatusColor(event.status)
        )}>
          {event.status}
        </span>
        
        <span className={cn(
          "text-xs px-2 py-1 rounded-full font-medium capitalize",
          getCategoryColor(event.category)
        )}>
          {event.category}
        </span>
      </div>
      
      {/* Event Title */}
      <h3 className="font-semibold text-lg text-foreground mb-2 line-clamp-2">
        {event.title}
      </h3>
      
      {/* Event Description (truncated) */}
      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
        {event.description}
      </p>
      
      {/* Event Details */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center text-muted-foreground">
          <Calendar className="h-4 w-4 mr-2" />
          <span className="text-xs sm:text-sm">
            {formatDate(event.startDate)}
          </span>
        </div>
        
        <div className="flex items-center text-muted-foreground">
          <Clock className="h-4 w-4 mr-2" />
          <span className="text-xs sm:text-sm">
            {formatTime(event.startDate)} - {formatTime(event.endDate)}
          </span>
        </div>
        
        <div className="flex items-center text-muted-foreground">
          <MapPin className="h-4 w-4 mr-2" />
          <span className="text-xs sm:text-sm line-clamp-1">
            {event.location}
          </span>
        </div>
        
        {event.attendees && (
          <div className="flex items-center text-muted-foreground">
            <Users className="h-4 w-4 mr-2" />
            <span className="text-xs sm:text-sm">
              {event.attendees.length} {event.attendees.length === 1 ? 'attendee' : 'attendees'}
            </span>
          </div>
        )}
      </div>
      
      {/* Action Buttons */}
      <div className="flex justify-end">
        <Button
          variant="default"
          size="sm"
          onClick={viewEventDetails}
          className="text-xs sm:text-sm"
        >
          View Details
        </Button>
      </div>
    </div>
  );
};

export default EventCard; 