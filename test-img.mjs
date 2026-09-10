import fs from 'fs';
const res = await fetch('https://res.cloudinary.com/da8jrztp0/image/upload/v1780859648/ghostal/d41334f0-5fd9-437c-813f-8bfff930e9e2/quqlcuii6luslhfrtx3m.jpg');
const buf = await res.arrayBuffer();
console.log('Status:', res.status);
console.log('Size:', buf.byteLength);
