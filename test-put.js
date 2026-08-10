const http = require('http');

const data = JSON.stringify({
  full_name: 'Test Update',
  gender: 'M',
  phone_number: '0123456789',
  email: 'test@example.com'
});

const req = http.request({
  hostname: 'localhost',
  port: 5000,
  path: '/api/Teacher/1025',
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
}, (res) => {
  console.log('STATUS: ' + res.statusCode);
  res.setEncoding('utf8');
  res.on('data', (chunk) => {
    console.log('BODY: ' + chunk);
  });
});

req.on('error', (e) => {
  console.error('problem with request: ' + e.message);
});

req.write(data);
req.end();
