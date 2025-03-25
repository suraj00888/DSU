import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, AlertCircle } from 'lucide-react';
import AppLayout from '../components/AppLayout';
import Header from '../components/Header';
import EventCard from '../components/EventCard';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import eventsApi from '../api/eventsApi';

const EventsPage = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  
  // Fetch events on component mount
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const fetchedEvents = await eventsApi.getEvents();
        setEvents(fetchedEvents);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch events:', err);
        setError('Failed to load events. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchEvents();
  }, []);
  
  // Filter events based on search term and status filter
  const filteredEvents = Array.isArray(events) ? events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'all') return matchesSearch;
    return matchesSearch && event.status === filter;
  }) : [];
  
  // Navigate to create event page
  const handleCreateEvent = () => {
    navigate('/events/create');
  };
  
  return (
    <AppLayout>
      <Header title="Events" />
      <main className="w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="bg-card/90 backdrop-blur-sm rounded-xl shadow-lg p-6 sm:p-7 md:p-8">
          {/* Header section with title and actions */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
            <div className="text-center">
              <h2 className="text-lg sm:text-xl font-medium text-card-foreground mb-2">Campus Events</h2>
              <p className="text-sm text-muted-foreground">
                Stay connected with the DSU community through these events.
              </p>
            </div>
            
            {/* Create Event button - now visible to all users */}
            <Button 
              onClick={handleCreateEvent} 
              className="mt-4 sm:mt-0"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Event
            </Button>
          </div>
          
          {/* Search and filter section */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant={filter === 'all' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setFilter('all')}
              >
                All
              </Button>
              <Button 
                variant={filter === 'upcoming' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setFilter('upcoming')}
              >
                Upcoming
              </Button>
              <Button 
                variant={filter === 'ongoing' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setFilter('ongoing')}
              >
                Ongoing
              </Button>
            </div>
          </div>
          
          {/* Loading state */}
          {loading && (
            <div className="py-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="mt-4 text-muted-foreground">Loading events...</p>
            </div>
          )}
          
          {/* Error state */}
          {error && !loading && (
            <div className="py-12 text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
              <p className="mt-4 text-destructive">{error}</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => window.location.reload()}
              >
                Try Again
              </Button>
            </div>
          )}
          
          {/* No events state */}
          {!loading && !error && filteredEvents.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">
                {searchTerm || filter !== 'all' ? 
                  'No events match your search criteria.' : 
                  'No events have been scheduled yet.'}
              </p>
              <Button 
                onClick={handleCreateEvent} 
                className="mt-4"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create First Event
              </Button>
            </div>
          )}
          
          {/* Events grid */}
          {!loading && !error && filteredEvents.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <EventCard key={event._id} event={event} />
              ))}
            </div>
          )}
        </div>
      </main>
    </AppLayout>
  );
};

export default EventsPage; 