const http = require('http');

const data = JSON.stringify({
  name: 'Test Operational Unit',
  email: 'test' + Date.now() + '@aidsphere.net',
  password: 'testpassword123',
  phone: '9112345678',
  role: 'victim'
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    console.log('STATUS:', res.statusCode);
    console.log('BODY:', body);
  });
});

req.on('error', (e) => {
  console.error('SYSTEM_ERROR:', e.message);
});

req.write(data);
req.end();
