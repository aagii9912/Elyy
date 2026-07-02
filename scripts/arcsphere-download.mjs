// Downloads all ArcSphere Studio assets (originals) to public/arcsphere/images
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

const OUT = 'public/arcsphere/images';

const hashes = [
  'JEOoI9AUjiorAUapWVh1gnkvdBI.png',
  'vVqkA2phwOpc7kzAHksLgpPasxY.png',
  'eJtReq8aEIEdVjdWqNPxJAANXJQ.jpg',
  'wthfvP6tU9Aorh9kHe1fCtIJ6Lg.png',
  'GR6RzM6Itwx2wDtjwveRN43I.png',
  '4DOVdvbWRuODDfm0C2LMekOT9c.png',
  'q1jRseViT6p77AKtrsON5HifB0.jpg',
  'YJqX4cT1uigCFLzeZ7sd5CjGa0.png',
  'xILzBC4T9dkW9g4SA2OKFCeCpWY.png',
  'XvAPBw1t0Xzlyw7rz6xXH45yg.png',
  '6YL1tAtmkIm3Mvy6fpHipVf7s.png',
  'HZFnCooJ4Nr7M2uNee0yvEoK7k.jpg',
  'yJOuZOIs8ZL0On3JA5nIXentk.jpg',
  'MhNlfvpNMNpvRZw6EG0mXPj9Qg.jpg',
  'UqMqhHYfcJfkq2yOeOBnNWsjEmQ.jpg',
  'ecG0oXxVciB6YeEscSE3BDzmk.jpg',
  'IoCUX80inVa3YYNnEWvV34nKZQ.png',
  '11MwiLjJmisM6fK5qmtatuS8OE.png',
  'BY0VkDaSLT6GSQPRcYDxvN8K448.png',
  'TcTapBxBAcl92Z0CxBxNdDiN5zs.png',
  'uCxt73fPvlnB5kTHTnBcmT5QU.jpg',
  'YwMiyx3zw3BnInoLrttBGb07Ok.jpg',
  '6lE03xTKE41EJJCgtuMd8nnBp6c.jpg',
  'POgUrnekSgfq9jHFSm7Gi1re5xw.jpg',
  'WW5YYUveqRONYLlubu7BDlfjoew.jpg',
  'Vot4TfNdPciaGO0nbBK36oh4ec.png',
  '3GG8FlJkc5UJfOGjTcx5PwNKKs.jpg',
  'OAlvk9UHcuzOq3iRhmZ9Jl4FWZs.png', // og image
];

async function dl(name) {
  const url = `https://framerusercontent.com/images/${name}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${name} -> ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const path = `${OUT}/${name}`;
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, buf);
  return `${name} (${(buf.length/1024).toFixed(0)}kb)`;
}

async function run() {
  const batchSize = 5;
  const results = [];
  for (let i = 0; i < hashes.length; i += batchSize) {
    const batch = hashes.slice(i, i + batchSize);
    const settled = await Promise.allSettled(batch.map(dl));
    settled.forEach((s, j) => {
      if (s.status === 'fulfilled') results.push('OK  ' + s.value);
      else results.push('ERR ' + batch[j] + ' :: ' + s.reason.message);
    });
  }
  console.log(results.join('\n'));
  console.log(`\nDone: ${results.filter(r=>r.startsWith('OK')).length}/${hashes.length}`);
}
run();
