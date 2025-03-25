import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Users, Pencil } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';

/**
 * EventForm Component
 * Reusable form for creating and editing events
 * 
 * @param {Object} props - Component props
 * @param {Object} props.existingEvent - Event data for editing (null for new event)
 * @param {Function} props.onSubmit - Function to handle form submission
 * @param {Function} props.onCancel - Function to handle cancellation
 */
const EventForm = ({ existingEvent = null, onSubmit, onCancel }) => {
  const isEditing = !!existingEvent;
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'academic',
    location: '',
    startDate: '',
    startTime: '12:00',
    endDate: '',
    endTime: '13:00',
    capacity: '',
    additionalDetails: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  // Load existing event data for editing
  useEffect(() => {
    if (existingEvent) {
      const startDate = new Date(existingEvent.startDate);
      const endDate = new Date(existingEvent.endDate);
      
      setFormData({
        title: existingEvent.title || '',
        description: existingEvent.description || '',
        category: existingEvent.category || 'academic',
        location: existingEvent.location || '',
        startDate: formatDateForInput(startDate),
        startTime: formatTimeForInput(startDate),
        endDate: formatDateForInput(endDate),
        endTime: formatTimeForInput(endDate),
        capacity: existingEvent.capacity || '',
        additionalDetails: existingEvent.additionalDetails || ''
      });
    }
  }, [existingEvent]);
  
  // Format date for input field (YYYY-MM-DD)
  const formatDateForInput = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  };
  
  // Format time for input field (HH:MM)
  const formatTimeForInput = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };
  
  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };
  
  // Validate form fields
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }
    
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }
    
    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }
    
    if (!formData.startTime) {
      newErrors.startTime = 'Start time is required';
    }
    
    if (!formData.endTime) {
      newErrors.endTime = 'End time is required';
    }
    
    // Check if end date/time is after start date/time
    const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
    const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);
    
    if (startDateTime >= endDateTime) {
      newErrors.endDate = 'End date/time must be after start date/time';
    }
    
    // Validate capacity if provided
    if (formData.capacity && (!Number.isInteger(Number(formData.capacity)) || Number(formData.capacity) <= 0)) {
      newErrors.capacity = 'Capacity must be a positive integer';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      
      // Format dates for submission
      const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
      const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);
      
      const eventData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        location: formData.location,
        startDate: startDateTime.toISOString(),
        endDate: endDateTime.toISOString(),
        additionalDetails: formData.additionalDetails,
        ...(formData.capacity && { capacity: Number(formData.capacity) })
      };
      
      // Call onSubmit function with prepared data
      await onSubmit(eventData);
      
    } catch (error) {
      console.error('Failed to submit event:', error);
      // Handle server errors if not caught by onSubmit
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title" className="text-base">
          Event Title <span className="text-destructive">*</span>
        </Label>
        <Input
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Enter event title"
          className={errors.title ? 'border-destructive' : ''}
        />
        {errors.title && (
          <p className="text-xs text-destructive">{errors.title}</p>
        )}
      </div>
      
      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description" className="text-base">
          Description <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe your event"
          rows={4}
          className={errors.description ? 'border-destructive' : ''}
        />
        {errors.description && (
          <p className="text-xs text-destructive">{errors.description}</p>
        )}
      </div>
      
      {/* Category */}
      <div className="space-y-2">
        <Label htmlFor="category" className="text-base">
          Category <span className="text-destructive">*</span>
        </Label>
        <select
          id="category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <option value="academic">Academic</option>
          <option value="social">Social</option>
          <option value="career">Career</option>
          <option value="sports">Sports</option>
          <option value="other">Other</option>
        </select>
      </div>
      
      {/* Location */}
      <div className="space-y-2">
        <Label htmlFor="location" className="text-base">
          Location <span className="text-destructive">*</span>
        </Label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="Where will this event take place?"
            className={`pl-10 ${errors.location ? 'border-destructive' : ''}`}
          />
        </div>
        {errors.location && (
          <p className="text-xs text-destructive">{errors.location}</p>
        )}
      </div>
      
      {/* Date and Time */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Start Date/Time */}
        <div className="space-y-4">
          <Label className="text-base">
            Start Date & Time <span className="text-destructive">*</span>
          </Label>
          
          <div className="space-y-2">
            <Label htmlFor="startDate" className="text-sm">Date</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="startDate"
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleChange}
                className={`pl-10 ${errors.startDate ? 'border-destructive' : ''}`}
              />
            </div>
            {errors.startDate && (
              <p className="text-xs text-destructive">{errors.startDate}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="startTime" className="text-sm">Time</Label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="startTime"
                name="startTime"
                type="time"
                value={formData.startTime}
                onChange={handleChange}
                className={`pl-10 ${errors.startTime ? 'border-destructive' : ''}`}
              />
            </div>
            {errors.startTime && (
              <p className="text-xs text-destructive">{errors.startTime}</p>
            )}
          </div>
        </div>
        
        {/* End Date/Time */}
        <div className="space-y-4">
          <Label className="text-base">
            End Date & Time <span className="text-destructive">*</span>
          </Label>
          
          <div className="space-y-2">
            <Label htmlFor="endDate" className="text-sm">Date</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="endDate"
                name="endDate"
                type="date"
                value={formData.endDate}
                onChange={handleChange}
                className={`pl-10 ${errors.endDate ? 'border-destructive' : ''}`}
              />
            </div>
            {errors.endDate && (
              <p className="text-xs text-destructive">{errors.endDate}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="endTime" className="text-sm">Time</Label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="endTime"
                name="endTime"
                type="time"
                value={formData.endTime}
                onChange={handleChange}
                className={`pl-10 ${errors.endTime ? 'border-destructive' : ''}`}
              />
            </div>
            {errors.endTime && (
              <p className="text-xs text-destructive">{errors.endTime}</p>
            )}
          </div>
        </div>
      </div>
      
      {/* Capacity */}
      <div className="space-y-2">
        <Label htmlFor="capacity" className="text-base">
          Capacity <span className="text-muted-foreground text-sm">(Optional)</span>
        </Label>
        <div className="relative">
          <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="capacity"
            name="capacity"
            type="number"
            min="1"
            value={formData.capacity}
            onChange={handleChange}
            placeholder="Maximum number of attendees (leave empty for unlimited)"
            className={`pl-10 ${errors.capacity ? 'border-destructive' : ''}`}
          />
        </div>
        {errors.capacity && (
          <p className="text-xs text-destructive">{errors.capacity}</p>
        )}
      </div>
      
      {/* Additional Details */}
      <div className="space-y-2">
        <Label htmlFor="additionalDetails" className="text-base">
          Additional Details <span className="text-muted-foreground text-sm">(Optional)</span>
        </Label>
        <Textarea
          id="additionalDetails"
          name="additionalDetails"
          value={formData.additionalDetails}
          onChange={handleChange}
          placeholder="Any additional information about the event"
          rows={3}
        />
      </div>
      
      {/* Form Actions */}
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading}
        >
          {loading ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-background"></div>
              {isEditing ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            <>
              {isEditing ? (
                <>
                  <Pencil className="mr-2 h-4 w-4" />
                  Update Event
                </>
              ) : (
                <>
                  <Calendar className="mr-2 h-4 w-4" />
                  Create Event
                </>
              )}
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export default EventForm; 