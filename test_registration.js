// Simple test script to check registration endpoint
const axios = require('axios');

const testRegistration = async () => {
  try {
    console.log('🧪 Testing registration endpoint...');
    
    const testData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'Test123@',
      phone: '+251911234567'
    };
    
    const response = await axios.post('http://localhost:5000/api/v1/auth/register', testData, {
      headers: {
        'Content-Type': 'application/json'
      },
      withCredentials: true
    });
    
    console.log('✅ Registration successful:', response.data);
    
  } catch (error) {
    console.error('❌ Registration failed:');
    console.error('Status:', error.response?.status);
    console.error('Message:', error.response?.data?.message);
    console.error('Errors:', error.response?.data?.errors);
    console.error('Full error:', error.message);
  }
};

// Wait a bit for server to start, then test
setTimeout(testRegistration, 8000);
