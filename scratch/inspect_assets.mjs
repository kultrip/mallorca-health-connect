import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function run() {
  const assetsDir = '/Users/charles.santana/Kultrip/gemini-dev/mallorca-health-connect/src/assets';
  const files = fs.readdirSync(assetsDir);
  
  console.log('--- Assets Files Metadata ---');
  for (const file of files) {
    if (!file.endsWith('.png') && !file.endsWith('.jpg') && !file.endsWith('.jpeg')) continue;
    const fullPath = path.join(assetsDir, file);
    try {
      const meta = await sharp(fullPath).metadata();
      console.log(`File: ${file} | Format: ${meta.format} | Width: ${meta.width} | Height: ${meta.height}`);
    } catch (e) {
      console.error(`Error reading ${file}:`, e.message);
    }
  }
}

run().catch(console.error);
