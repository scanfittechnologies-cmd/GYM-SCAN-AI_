const fs = require('fs');
const c = fs.readFileSync('src/data/machines.ts', 'utf8');
const ids = [...c.matchAll(/"id": "([^"]+)"/g)].map(m => m[1]);
console.log('Machine entries:', ids.length);
const qrs = [...c.matchAll(/"qrCodeId": "([^"]+)"/g)].map(m => m[1]);
const dupQr = qrs.filter((v, i) => qrs.indexOf(v) !== i);
console.log('Total QR codes:', qrs.length, '| Duplicate QRs:', dupQr.length ? dupQr : 'None');
