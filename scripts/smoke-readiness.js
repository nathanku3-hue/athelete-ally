#!/usr/bin/env node
// Simple smoke test for readiness endpoints
const http = require('http');

function get(path) {
  return new Promise((resolve, reject) => {
    const req = http.request({ host: 'localhost', port: 4103, path, method: 'GET' }, res => {
      let data='';
      res.on('data', c=> data+=c);
      res.on('end', ()=> resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject); req.end();
  });
}

(async () => {
  const userId = process.env.SMOKE_USER_ID || 'user123';
  const latest = await get(`/api/v1/readiness/${encodeURIComponent(userId)}/latest`);
  console.log('latest', latest.status, latest.body);
  const range = await get(`/api/v1/readiness/${encodeURIComponent(userId)}?days=7`);
  console.log('range', range.status, range.body);
  if (latest.status !== 200 || range.status !== 200) process.exit(1);
})();
