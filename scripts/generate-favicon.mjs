import sharp from "sharp";
import { promises as fs } from "fs";
import path from "path";

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const rootDir = path.resolve(__dirname, "..");
const svgPath = path.join(rootDir, "public", "favicon.svg");
const icoPath = path.join(rootDir, "public", "favicon.ico");
const pngPath = path.join(rootDir, "public", "favicon.png");

async function main() {
  try {
    const svgBuffer = await fs.readFile(svgPath);

    // Generate a 32x32 PNG and write it as favicon.ico (Vite / browser standard fallback)
    await sharp(svgBuffer).resize(32, 32).png().toFile(icoPath);
    console.log("Successfully generated public/favicon.ico");

    // Generate a 192x192 PNG for mobile web clips
    await sharp(svgBuffer).resize(192, 192).png().toFile(pngPath);
    console.log("Successfully generated public/favicon.png");
  } catch (error) {
    console.error("Error generating favicons:", error);
    process.exit(1);
  }
}

main();
