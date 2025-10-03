#!/usr/bin/env node
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const { Client } = require('pg');

(async () => {
  const base = process.env.READINESS_URL || 'http://localhost:4103';
  const db = process.env.DATABASE_URL;
  const userId = process.env.READINESS_USER || 'smoke-user';
  const date = new Date().toISOString().slice(0,10);

  // 1) Latest incomplete (no seed)
  let latest = await fetch(`${base}/api/v1/readiness/${userId}/latest`).then(r => r.json());
  console.log('latest-1=', latest);

  // 2) Seed normalized if DB available, then re-check
  if (db) {
    const client = new Client({ connectionString: db });
    await client.connect();
    await client.query("insert into sleep_data (id, userid, date, durationminutes, vendor, capturedat, createdat, updatedat) values ($1,$2,$3,$4,'unknown',$5,now(),now()) on conflict(userid, date) do update set durationminutes=excluded.durationminutes, vendor=excluded.vendor, capturedat=excluded.capturedat", [
      'sleep-'+Date.now(), userId, date, 420, new Date().toISOString()
    ]);
    await client.query("insert into hrv_data (id, userid, date, rmssd, lnrmssd, capturedat, createdat, updatedat) values ($1,$2,$3,$4,$5,$6,now(),now()) on conflict(userid, date) do update set rmssd=excluded.rmssd, lnrmssd=excluded.lnrmssd, capturedat=excluded.capturedat", [
      'hrv-'+Date.now(), userId, date, 50, Math.log(50), new Date().toISOString()
    ]);
    await client.end();
  }

  latest = await fetch(`${base}/api/v1/readiness/${userId}/latest`).then(r => r.json());
  console.log('latest-2=', latest);

  const range = await fetch(`${base}/api/v1/readiness/${userId}?days=7`).then(r => r.json());
  console.log('range=', range);
})();
