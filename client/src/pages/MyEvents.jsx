import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Calendar, AlertCircle } from 'lucide-react';
import AppLayout from '../components/AppLayout';
import Header from '../components/Header';
import EventCard from '../components/EventCard';
import { Button } from '../components/ui/button';
import eventsApi from '../api/eventsApi';

const MyEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const user = useSelector((state) => state.auth.user);
  const navigate = useNavigate();
  
  // Redirect admin users
  useEffect(() => {
    if (user?.role === 'admin') {
      navigate('/events', { replace: true });
      return; // Exit early if admin
    }
    
    // Only fetch events if the user is not an admin
    const fetchMyEvents = async () => {
      try {
        setLoading(true);
        const data = await eventsApi.getUserEvents();
        if (Array.isArray(data)) {
          setEvents(data);
        } else {
          setError('Invalid data received from the server');
        }
      } catch (err) {
        console.error('Failed to fetch events:', err);
        setError('Failed to load your events. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchMyEvents();
  }, [user, navigate]);
  
  // If user is admin, don't render component
  if (user?.role === 'admin') {
    return null;
  }

  // Group events by status
  const upcomingEvents = events.filter(event => event.status === 'upcoming');
  const ongoingEvents = events.filter(event => event.status === 'ongoing');
  const pastEvents = events.filter(event => event.status === 'completed' || event.status === 'cancelled');

  // Function to refresh events
  const refreshEvents = async () => {
    try {
      setLoading(true);
      const data = await eventsApi.getUserEvents();
      if (Array.isArray(data)) {
        setEvents(data);
      } else {
        setError('Invalid data received from the server');
      }
    } catch (err) {
      console.error('Failed to fetch events:', err);
      setError('Failed to load your events. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <Header
        title="My Events"
        subtitle="Events you've registered for"
      />
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-muted-foreground">Loading your events...</p>
        </div>
      ) : error ? (
        <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-destructive">{error}</p>
          <Button 
            variant="outline" 
            className="mt-2"
            onClick={refreshEvents}
          >
            Try Again
          </Button>
        </div>
      ) : (
        <>
          {events.length === 0 ? (
            <div className="mt-8 text-center">
              <p className="text-muted-foreground">You haven't registered for any events yet.</p>
              <Button 
                className="mt-4"
                onClick={() => navigate('/events')}
              >
                Browse Events
              </Button>
            </div>
          ) : (
            <div className="mt-8 space-y-10">
              {/* Ongoing Events */}
              {ongoingEvents.length > 0 && (
                <section>
                  <h2 className="text-lg font-semibold mb-4">Happening Now</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {ongoingEvents.map(event => (
                      <EventCard 
                        key={event._id}
                        event={event}
                        onRefresh={refreshEvents}
                      />
                    ))}
                  </div>
                </section>
              )}
              
              {/* Upcoming Events */}
              {upcomingEvents.length > 0 && (
                <section>
                  <h2 className="text-lg font-semibold mb-4">Upcoming Events</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {upcomingEvents.map(event => (
                      <EventCard 
                        key={event._id}
                        event={event}
                        onRefresh={refreshEvents}
                      />
                    ))}
                  </div>
                </section>
              )}
              
              {/* Past Events */}
              {pastEvents.length > 0 && (
                <section>
                  <h2 className="text-lg font-semibold mb-4">Past Events</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pastEvents.map(event => (
                      <EventCard 
                        key={event._id}
                        event={event}
                        onRefresh={refreshEvents}
                      />
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </>
      )}
    </AppLayout>
  );
};

export default MyEvents; 