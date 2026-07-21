import sharp from 'sharp';

async function run() {
  const inputPath = '/Users/charles.santana/Kultrip/gemini-dev/mallorca-health-connect/src/assets/stones-transparent.png';
  const image = sharp(inputPath);
  const { width, height } = await image.metadata();

  const { data } = await image.raw().toBuffer({ resolveWithObject: true });

  console.log(`Analyzing rows of ${width}x${height} image...`);

  // Count number of non-transparent pixels in each row
  const rowCounts = [];
  for (let y = 0; y < height; y++) {
    let count = 0;
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const alpha = data[idx + 3];
      if (alpha > 15) { // More than minimal transparency
        count++;
      }
    }
    rowCounts.push(count);
  }

  // Let's print out rows where count is significant
  // We'll print clusters
  let inCluster = false;
  let startY = 0;
  
  for (let y = 0; y < height; y++) {
    // If a row has more than 5% of pixels non-transparent, it's part of the stones
    const isStoneRow = rowCounts[y] > (width * 0.05); 
    
    if (isStoneRow && !inCluster) {
      startY = y;
      inCluster = true;
    } else if (!isStoneRow && inCluster) {
      console.log(`Cluster of stone pixels: Y=[${startY}, ${y - 1}]`);
      inCluster = false;
    }
  }
  if (inCluster) {
    console.log(`Cluster of stone pixels: Y=[${startY}, ${height - 1}]`);
  }
}

run().catch(console.error);
