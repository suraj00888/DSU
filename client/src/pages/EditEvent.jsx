import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, AlertCircle } from 'lucide-react';
import AppLayout from '../components/AppLayout';
import Header from '../components/Header';
import EventForm from '../components/EventForm';
import { Button } from '../components/ui/button';
import eventsApi from '../api/eventsApi';

const EditEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitError, setSubmitError] = useState(null);

  // Fetch event data
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const eventData = await eventsApi.getEvent(id);
        if (eventData && typeof eventData === 'object') {
          setEvent(eventData);
          setError(null);
        } else {
          setError('Invalid event data received');
        }
      } catch (err) {
        console.error('Failed to fetch event:', err);
        setError('Failed to load event. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  // Handle form submission
  const handleSubmit = async (eventData) => {
    try {
      // Update the event
      await eventsApi.updateEvent(id, eventData);
      
      // Navigate to the event details page with success message
      navigate(`/events/${id}`, {
        state: { message: 'Event updated successfully', type: 'success' }
      });
    } catch (err) {
      console.error('Failed to update event:', err);
      setSubmitError(err.message || 'Failed to update event. Please try again.');
    }
  };
  
  // Handle form cancellation
  const handleCancel = () => {
    // Navigate back to event details
    navigate(`/events/${id}`);
  };
  
  // Display loading state
  if (loading) {
    return (
      <AppLayout>
        <Header title="Edit Event" />
        <main className="w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="bg-card/90 backdrop-blur-sm rounded-xl shadow-lg p-6 sm:p-7 md:p-8">
            <div className="flex justify-center items-center h-64">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="ml-4 text-muted-foreground">Loading event details...</p>
            </div>
          </div>
        </main>
      </AppLayout>
    );
  }
  
  // Display error state
  if (error) {
    return (
      <AppLayout>
        <Header title="Edit Event" />
        <main className="w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="bg-card/90 backdrop-blur-sm rounded-xl shadow-lg p-6 sm:p-7 md:p-8">
            <div className="flex flex-col items-center justify-center h-64">
              <AlertCircle className="h-12 w-12 text-destructive" />
              <p className="mt-4 text-destructive">{error}</p>
              <div className="mt-6 flex gap-4">
                <Button variant="outline" onClick={() => navigate('/events')}>
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Back to Events
                </Button>
                <Button onClick={() => window.location.reload()}>Try Again</Button>
              </div>
            </div>
          </div>
        </main>
      </AppLayout>
    );
  }
  
  return (
    <AppLayout>
      <Header title="Edit Event" />
      <main className="w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="bg-card/90 backdrop-blur-sm rounded-xl shadow-lg p-6 sm:p-7 md:p-8">
          {/* Back button */}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(`/events/${id}`)}
            className="mb-6"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Event Details
          </Button>
          
          {/* Page Title */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground">Edit Event</h1>
            <p className="text-muted-foreground mt-2">
              Make changes to your event details below.
            </p>
          </div>
          
          {/* Error Message */}
          {submitError && (
            <div className="bg-destructive/10 text-destructive p-4 rounded-lg mb-6">
              <p>{submitError}</p>
            </div>
          )}
          
          {/* Event Form */}
          {event && (
            <EventForm 
              existingEvent={event}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
            />
          )}
        </div>
      </main>
    </AppLayout>
  );
};

export default EditEvent; 