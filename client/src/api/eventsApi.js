import api from './index';

/**
 * Events API service
 * Provides methods for interacting with the events endpoints
 */
const eventsApi = {
  /**
   * Get events with optional filtering
   * @param {Object} params - Query parameters
   * @returns {Promise} - API response
   */
  getEvents: async (params = {}) => {
    try {
      const response = await api.get('/api/events', { params });
      // Check if response.data contains events property, otherwise return the data itself
      return response.data?.events ? response.data.events : response.data || [];
    } catch (error) {
      console.error('API Error in getEvents:', error);
      throw error.response?.data || { message: 'Failed to fetch events' };
    }
  },

  /**
   * Get a single event by ID
   * @param {string} id - Event ID
   * @returns {Promise} - API response
   */
  getEvent: async (id) => {
    try {
      const response = await api.get(`/api/events/${id}`);
      return response.data || null;
    } catch (error) {
      console.error('API Error in getEvent:', error);
      throw error.response?.data || { message: 'Failed to fetch event details' };
    }
  },

  /**
   * Get events that the current user is attending
   * @returns {Promise} - API response
   */
  getUserEvents: async () => {
    try {
      const response = await api.get('/api/events/user/attending');
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('API Error in getUserEvents:', error);
      throw error.response?.data || { message: 'Failed to fetch your events' };
    }
  },

  /**
   * Create a new event
   * @param {Object} eventData - Event data
   * @returns {Promise} - API response
   */
  createEvent: async (eventData) => {
    try {
      const response = await api.post('/api/events', eventData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to create event' };
    }
  },

  /**
   * Update an existing event
   * @param {string} id - Event ID
   * @param {Object} eventData - Updated event data
   * @returns {Promise} - API response
   */
  updateEvent: async (id, eventData) => {
    try {
      const response = await api.put(`/api/events/${id}`, eventData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update event' };
    }
  },

  /**
   * Delete an event
   * @param {string} id - Event ID
   * @returns {Promise} - API response
   */
  deleteEvent: async (id) => {
    try {
      const response = await api.delete(`/api/events/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete event' };
    }
  },

  /**
   * Register for an event
   * @param {string} id - Event ID
   * @returns {Promise} - API response
   */
  registerForEvent: async (id) => {
    try {
      const response = await api.post(`/api/events/${id}/register`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to register for event' };
    }
  },

  /**
   * Cancel registration for an event
   * @param {string} id - Event ID
   * @returns {Promise} - API response
   */
  cancelRegistration: async (id) => {
    try {
      const response = await api.delete(`/api/events/${id}/register`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to cancel registration' };
    }
  },

  /**
   * Get attendees for an event
   * @param {string} id - Event ID
   * @returns {Promise} - API response
   */
  getEventAttendees: async (id) => {
    try {
      const response = await api.get(`/api/events/${id}/attendees`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch attendees' };
    }
  }
};

export { eventsApi };
export default eventsApi; 