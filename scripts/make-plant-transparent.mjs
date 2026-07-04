import sharp from "sharp";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const inputPath = join(__dirname, "../src/assets/hero-branch.jpg");
const outputPath = join(__dirname, "../src/assets/hero-branch-transparent.png");

async function makeTransparent() {
  try {
    console.log("Loading original plant image...");
    const image = sharp(inputPath);
    const { width, height } = await image.metadata();
    console.log(`Dimensions: ${width}x${height}`);

    // Get raw RGB pixels
    const rawBuffer = await image.ensureAlpha().raw().toBuffer();
    const outputBuffer = Buffer.alloc(width * height * 4);

    for (let i = 0; i < rawBuffer.length; i += 4) {
      const r = rawBuffer[i];
      const g = rawBuffer[i + 1];
      const b = rawBuffer[i + 2];
      
      // Calculate brightness or distance from cream background.
      // Cream background in this image is generally very bright and warm.
      // Let's analyze how close the pixel is to the light background.
      const minVal = Math.min(r, g, b);
      const maxVal = Math.max(r, g, b);
      
      // A pixel is background if it's very bright
      // Original background is near white/cream (e.g., R > 235, G > 230, B > 220)
      let alpha = 255;
      
      // We can use a simple thresholding with soft transition.
      // Let's use the average brightness:
      const brightness = (r + g + b) / 3;
      
      if (brightness >= 240) {
        // High confidence background
        alpha = 0;
      } else if (brightness > 200) {
        // Soft transition zone (anti-aliasing)
        // Interpolate alpha from 0 (at 240 brightness) to 255 (at 200 brightness)
        const factor = (240 - brightness) / 40;
        alpha = Math.round(factor * 255);
      } else {
        alpha = 255;
      }

      outputBuffer[i] = r;
      outputBuffer[i + 1] = g;
      outputBuffer[i + 2] = b;
      outputBuffer[i + 3] = alpha;
    }

    console.log("Saving transparent plant illustration...");
    await sharp(outputBuffer, {
      raw: {
        width,
        height,
        channels: 4
      }
    })
    .png()
    .toFile(outputPath);

    console.log(`Success! Saved to ${outputPath}`);
  } catch (error) {
    console.error("Error making image transparent:", error);
  }
}

makeTransparent();
