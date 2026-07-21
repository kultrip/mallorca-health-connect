import sharp from 'sharp';

async function run() {
  const inputPath = '/Users/charles.santana/Kultrip/gemini-dev/mallorca-health-connect/src/assets/stones.jpg';
  const outputPath = '/Users/charles.santana/Kultrip/gemini-dev/mallorca-health-connect/src/assets/stones-transparent.png';

  const image = sharp(inputPath);
  const { data, info } = await image
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const rawBuffer = data;

  console.log('Processing stones image to make white/beige background transparent...');

  // The background is bright beige/white (brightness > 200).
  // The stones are darker (brightness < 200) or have some texture.
  // Let's key out pixels that are very bright and have low saturation (close to background color).
  for (let i = 0; i < rawBuffer.length; i += 4) {
    const r = rawBuffer[i];
    const g = rawBuffer[i + 1];
    const b = rawBuffer[i + 2];
    
    const brightness = (r + g + b) / 3;

    // Background of stones.jpg is around R=242-250, G=234-247, B=223-242.
    // It's a very light, warm off-white.
    // Let's make pixels with brightness > 220 transparent, with a smooth transition between 200 and 220.
    const maxThreshold = 230; // 100% transparent
    const minThreshold = 180; // 100% opaque

    if (brightness > maxThreshold) {
      rawBuffer[i + 3] = 0; // Transparent
    } else if (brightness > minThreshold) {
      // Linear interpolation for smooth transition
      const alpha = Math.floor((1 - (brightness - minThreshold) / (maxThreshold - minThreshold)) * 255);
      rawBuffer[i + 3] = alpha;
    } else {
      rawBuffer[i + 3] = 255; // Opaque
    }
  }

  await sharp(rawBuffer, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4
    }
  })
  .png()
  .toFile(outputPath);

  console.log('Saved transparent stones image!');
  
  // Let's run transparency check on it
  let transparentCount = 0;
  for (let i = 0; i < rawBuffer.length; i += 4) {
    if (rawBuffer[i + 3] === 0) transparentCount++;
  }
  console.log(`Fully transparent pixels: ${transparentCount} (${(transparentCount / (info.width * info.height) * 100).toFixed(1)}%)`);
}

run().catch(console.error);
