/**
 * Utility functions to test token expiry and refresh
 */

/**
 * Creates a simulated expired JWT token for testing
 * This token will decode correctly but be expired
 */
export const createExpiredToken = () => {
  // Create a payload with an expiration time in the past
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    id: "test-user-id",
    exp: now - 3600 // Expired 1 hour ago
  };
  
  // Base64 encode the header
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  
  // Base64 encode the payload
  const encodedPayload = btoa(JSON.stringify(payload));
  
  // Create a mock signature (not valid for validation, just for testing)
  const signature = btoa("test-signature");
  
  // Assemble the token
  return `${header}.${encodedPayload}.${signature}`;
};

/**
 * Creates a simulated expiring JWT token (about to expire) for testing
 */
export const createExpiringToken = () => {
  // Create a payload with an expiration time in the near future
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    id: "test-user-id",
    exp: now + 240 // Expires in 4 minutes
  };
  
  // Base64 encode the header
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  
  // Base64 encode the payload
  const encodedPayload = btoa(JSON.stringify(payload));
  
  // Create a mock signature
  const signature = btoa("test-signature");
  
  // Assemble the token
  return `${header}.${encodedPayload}.${signature}`;
};

/**
 * Simulates token expiry in the browser for testing
 */
export const simulateTokenExpiry = () => {
  // Set expired token in localStorage
  localStorage.setItem('token', createExpiredToken());
  
  // Set valid refresh token
  localStorage.setItem('refreshToken', 'valid-refresh-token');
  
  console.log('Simulated expired token - refresh flow should trigger on next API call');
};

/**
 * Simulates approaching token expiry to test warning modal
 */
export const simulateTokenExpiring = () => {
  // Set token that will expire in 4 minutes
  localStorage.setItem('token', createExpiringToken());
  
  // Set valid refresh token
  localStorage.setItem('refreshToken', 'valid-refresh-token');
  
  console.log('Simulated expiring token - warning should appear within 5 minutes');
};

/**
 * Simulates complete session expiration (token and refresh token both invalid)
 */
export const simulateSessionExpiry = () => {
  // Set expired token
  localStorage.setItem('token', createExpiredToken());
  
  // Remove refresh token
  localStorage.removeItem('refreshToken');
  
  console.log('Simulated full session expiry - user should be logged out immediately');
}; 