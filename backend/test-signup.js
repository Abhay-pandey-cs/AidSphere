const axios = require('axios');

const testSignup = async () => {
  try {
    const res = await axios.post('http://localhost:5000/api/auth/register', {
      name: 'Test User',
      email: 'test' + Date.now() + '@example.com',
      password: 'password123',
      phone: '1234567890',
      role: 'victim'
    });
    console.log('SUCCESS:', res.data);
  } catch (err) {
    console.error('FAILURE:', err.response ? err.response.data : err.message);
  }
};

testSignup();
