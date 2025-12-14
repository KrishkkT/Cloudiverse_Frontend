// Simple test to check if environment variables are loaded correctly
console.log('VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);

// Test fetch to backend
fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/login`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'test3@example.com',
    password: 'correctpassword123'
  })
})
.then(response => response.json())
.then(data => {
  console.log('Login response:', data);
})
.catch(error => {
  console.error('Login error:', error);
});