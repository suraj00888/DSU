import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import AppLayout from '../components/AppLayout';
import Header from '../components/Header';
import EventForm from '../components/EventForm';
import { Button } from '../components/ui/button';
import eventsApi from '../api/eventsApi';

const CreateEvent = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  // Handle form submission
  const handleSubmit = async (eventData) => {
    try {
      // Create new event
      await eventsApi.createEvent(eventData);
      
      // Navigate to the event details page with success message
      navigate(`/events/`, {
        state: { message: 'Event created successfully', type: 'success' }
      });
    } catch (err) {
      console.error('Failed to create event:', err);
      setError(err.message || 'Failed to create event. Please try again.');
    }
  };
  
  // Handle form cancellation
  const handleCancel = () => {
    // Navigate back to events list
    navigate('/events');
  };
  
  return (
    <AppLayout>
      <Header title="Create Event" />
      <main className="w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="bg-card/90 backdrop-blur-sm rounded-xl shadow-lg p-6 sm:p-7 md:p-8">
          {/* Back button */}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/events')}
            className="mb-6"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Events
          </Button>
          
          {/* Page Title */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground">Create a New Event</h1>
            <p className="text-muted-foreground mt-2">
              Fill out the form below to create a new event for the DSU community.
            </p>
          </div>
          
          {/* Error Message */}
          {error && (
            <div className="bg-destructive/10 text-destructive p-4 rounded-lg mb-6">
              <p>{error}</p>
            </div>
          )}
          
          {/* Event Form */}
          <EventForm 
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        </div>
      </main>
    </AppLayout>
  );
};

export default CreateEvent; 