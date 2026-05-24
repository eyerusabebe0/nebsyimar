// Simple test script to check login endpoint
const axios = require('axios');

const testLogin = async () => {
  try {
    console.log('🧪 Testing login endpoint...');
    
    // First, let's test the auth status endpoint
    console.log('📡 Testing auth status endpoint...');
    const statusResponse = await axios.get('http://localhost:5000/api/v1/auth/status', {
      withCredentials: true
    });
    console.log('✅ Auth status response:', statusResponse.data);
    
    // Test with invalid credentials
    console.log('📡 Testing login with invalid credentials...');
    try {
      const loginResponse = await axios.post('http://localhost:5000/api/v1/auth/login', {
        identifier: 'test@example.com',
        password: 'wrongpassword'
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });
      console.log('Login response:', loginResponse.data);
    } catch (error) {
      console.log('Expected login failure:', error.response?.data?.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:');
    console.error('Status:', error.response?.status);
    console.error('Message:', error.response?.data?.message);
    console.error('Full error:', error.message);
  }
};

testLogin();
