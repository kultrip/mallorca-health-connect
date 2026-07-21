import sharp from "sharp";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const inputPath = "/Users/charles.santana/.gemini/antigravity/brain/f50ddd5b-747c-4bc8-b428-afbb2fcceb29/media__1783385826803.png";
const outputPath = join(__dirname, "../src/assets/real-stones.png");

async function makeTransparent() {
  try {
    console.log("Loading original stones image from:", inputPath);
    const image = sharp(inputPath);
    const { width, height } = await image.metadata();
    console.log(`Dimensions: ${width}x${height}`);

    // Get raw RGBA pixels
    const rawBuffer = await image.ensureAlpha().raw().toBuffer();
    const outputBuffer = Buffer.alloc(width * height * 4);

    for (let i = 0; i < rawBuffer.length; i += 4) {
      const r = rawBuffer[i];
      const g = rawBuffer[i + 1];
      const b = rawBuffer[i + 2];

      // Pure black background detection
      // Calculate average brightness
      const brightness = (r + g + b) / 3;

      let alpha = 255;

      // Pure black background is usually < 12 in brightness
      const lowThreshold = 10;
      const highThreshold = 45;

      if (brightness <= lowThreshold) {
        alpha = 0; // Fully transparent
      } else if (brightness < highThreshold) {
        // Soft transition / anti-aliasing zone
        const factor = (brightness - lowThreshold) / (highThreshold - lowThreshold);
        alpha = Math.round(factor * 255);
      } else {
        alpha = 255; // Opaque
      }

      outputBuffer[i] = r;
      outputBuffer[i + 1] = g;
      outputBuffer[i + 2] = b;
      outputBuffer[i + 3] = alpha;
    }

    console.log("Saving transparent stones image...");
    await sharp(outputBuffer, {
      raw: {
        width,
        height,
        channels: 4,
      },
    })
      .png()
      .toFile(outputPath);

    console.log(`Success! Saved to ${outputPath}`);
  } catch (error) {
    console.error("Error making image transparent:", error);
  }
}

makeTransparent();
