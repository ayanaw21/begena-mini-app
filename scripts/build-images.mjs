/**
 * Turn raw photos in design/source-images into optimised slot assets.
 *
 *   npm run images
 *
 * Sources live outside public/ so they are never served; only the generated
 * files below ship. To add artwork: drop the photo in design/source-images,
 * add a job here, run the script, then point the matching slot in
 * lib/images.ts at the output.
 *
 * Budgets: hero <= 200KB, section photos <= 120KB, panels <= 150KB.
 */
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const SRC_DIR = path.join(process.cwd(), "design", "source-images");
const OUT_DIR = path.join(process.cwd(), "public", "images");
const APP_DIR = path.join(process.cwd(), "app");

const jobs = [
  {
    src: "begena-sunlight.jpg",
    out: "begena-sunlight.webp",
    width: 1600,
    height: 900,
    position: "attention",
  },
  {
    src: "begena-ensemble.jpg",
    out: "begena-ensemble.webp",
    width: 1200,
    height: 675,
    // "attention" crops to the instruments; centre keeps the students in frame.
    position: "centre",
  },
  {
    src: "begena-performer.jpg",
    out: "begena-performer.webp",
    width: 1200,
    height: 675,
    position: "attention",
  },
  {
    src: "begena-ornate.jpg",
    out: "begena-ornate.webp",
    width: 1600,
    height: 900,
    position: "attention",
  },
  {
    src: "king-david.jpg",
    out: "begena-david.webp",
    width: 1200,
    height: 675,
    // Keep the crown and face in frame rather than cropping to the torso.
    position: "top",
  },
  {
    src: "begena-strings.jpg",
    out: "begena-strings.webp",
    width: 1000,
    height: 1400,
    position: "centre",
  },
  {
    src: "begena-strings.jpg",
    out: "begena-strings-wide.webp",
    width: 1400,
    height: 500,
    position: "centre",
  },
  {
    src: "begena-harp.jpg",
    out: "begena-silhouette.webp",
    width: 1200,
    height: 900,
    position: "centre",
  },
  {
    src: "begena-traditional.jpg",
    out: "begena-instrument.webp",
    width: 1200,
    height: 600,
    position: "centre",
  },
];

const report = (name, info) =>
  console.log(
    `${name.padEnd(28)} ${info.width}x${info.height}  ${(info.size / 1024).toFixed(1)}KB`
  );

await mkdir(OUT_DIR, { recursive: true });

for (const job of jobs) {
  const info = await sharp(path.join(SRC_DIR, job.src))
    .rotate()
    .resize(job.width, job.height, { fit: "cover", position: job.position })
    .webp({ quality: 80 })
    .toFile(path.join(OUT_DIR, job.out));
  report(job.out, info);
}

// Next serves these from app/ by filename convention.
report(
  "opengraph-image.jpg",
  await sharp(path.join(SRC_DIR, "begena-sunlight.jpg"))
    .rotate()
    .resize(1200, 630, { fit: "cover", position: "attention" })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(path.join(APP_DIR, "opengraph-image.jpg"))
);

/**
 * Favicon: a photo is unreadable at 32px, so draw the instrument's silhouette
 * with plain shapes (no font dependency) on the site's background colour.
 */
const iconSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="112" fill="#0d192e"/>
  <g stroke="#e5b842" stroke-linecap="round">
    <rect x="112" y="104" width="34" height="304" rx="17" fill="#e5b842" stroke="none"/>
    <rect x="366" y="104" width="34" height="304" rx="17" fill="#e5b842" stroke="none"/>
    <rect x="112" y="104" width="288" height="30" rx="15" fill="#e5b842" stroke="none"/>
    <g stroke-width="11" opacity="0.85">
      <line x1="182" y1="150" x2="182" y2="396"/>
      <line x1="219" y1="150" x2="219" y2="396"/>
      <line x1="256" y1="150" x2="256" y2="396"/>
      <line x1="293" y1="150" x2="293" y2="396"/>
      <line x1="330" y1="150" x2="330" y2="396"/>
    </g>
  </g>
</svg>`;

for (const icon of [
  { out: "icon.png", size: 512 },
  { out: "apple-icon.png", size: 180 },
]) {
  report(
    icon.out,
    await sharp(Buffer.from(iconSvg))
      .resize(icon.size, icon.size)
      .png()
      .toFile(path.join(APP_DIR, icon.out))
  );
}
