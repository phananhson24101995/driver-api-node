const http = require('http');

http.get('http://localhost:5000/api/Teacher?pageSize=5', (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log(JSON.stringify(JSON.parse(body), null, 2));
  });
}).on('error', e => console.error(e));
