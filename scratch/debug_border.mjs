import sharp from 'sharp';

async function run() {
  const filePath = '/Users/charles.santana/Kultrip/gemini-dev/mallorca-health-connect/src/assets/stones-transparent.png';
  const image = sharp(filePath);
  const { width, height } = await image.metadata();
  const { data } = await image.raw().toBuffer({ resolveWithObject: true });

  console.log('Border pixels with alpha === 255:');
  
  let topCount = 0;
  let bottomCount = 0;
  let leftCount = 0;
  let rightCount = 0;

  for (let x = 0; x < width; x++) {
    const idxTop = (0 * width + x) * 4;
    const idxBottom = ((height - 1) * width + x) * 4;

    if (data[idxTop + 3] === 255) {
      topCount++;
      if (topCount <= 5) {
        console.log(`Top border (x=${x}, y=0): RGB=[${data[idxTop]}, ${data[idxTop+1]}, ${data[idxTop+2]}]`);
      }
    }
    if (data[idxBottom + 3] === 255) {
      bottomCount++;
      if (bottomCount <= 5) {
        console.log(`Bottom border (x=${x}, y=${height-1}): RGB=[${data[idxBottom]}, ${data[idxBottom+1]}, ${data[idxBottom+2]}]`);
      }
    }
  }

  for (let y = 0; y < height; y++) {
    const idxLeft = (y * width + 0) * 4;
    const idxRight = (y * width + (width - 1)) * 4;

    if (data[idxLeft + 3] === 255) {
      leftCount++;
      if (leftCount <= 5) {
        console.log(`Left border (x=0, y=${y}): RGB=[${data[idxLeft]}, ${data[idxLeft+1]}, ${data[idxLeft+2]}]`);
      }
    }
    if (data[idxRight + 3] === 255) {
      rightCount++;
      if (rightCount <= 5) {
        console.log(`Right border (x=${width-1}, y=${y}): RGB=[${data[idxRight]}, ${data[idxRight+1]}, ${data[idxRight+2]}]`);
      }
    }
  }

  console.log(`Summary of 255 alpha border pixels: Top: ${topCount}, Bottom: ${bottomCount}, Left: ${leftCount}, Right: ${rightCount}`);
}

run().catch(console.error);
