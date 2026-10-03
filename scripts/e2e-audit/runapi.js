#!/usr/bin/env node
// helper: run task code against backend API
// usage: node runapi.js <taskId> <codeFile|- >
const fs = require('fs');
const [taskId, codeFile] = process.argv.slice(2);
const code = fs.readFileSync(codeFile, 'utf8');
fetch('http://localhost:8080/api/run', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ taskId, code }),
})
  .then(r => r.json())
  .then(j => {
    console.log(JSON.stringify(j, null, 1).slice(0, 4000));
  })
  .catch(e => { console.error('ERR', e); process.exit(1); });
