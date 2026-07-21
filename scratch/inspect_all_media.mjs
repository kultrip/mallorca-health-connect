import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function run() {
  const brainDir = '/Users/charles.santana/.gemini/antigravity/brain/f50ddd5b-747c-4bc8-b428-afbb2fcceb29';
  const files = fs.readdirSync(brainDir);
  const mediaFiles = files.filter(f => f.startsWith('media__') && (f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.jpeg')));
  
  console.log('--- Media Files Metadata ---');
  for (const file of mediaFiles) {
    const fullPath = path.join(brainDir, file);
    try {
      const meta = await sharp(fullPath).metadata();
      console.log(`File: ${file} | Size: ${meta.size} bytes | Format: ${meta.format} | Width: ${meta.width} | Height: ${meta.height}`);
    } catch (e) {
      console.error(`Error reading ${file}:`, e.message);
    }
  }
}

run().catch(console.error);
