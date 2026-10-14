// Rebuild ALL logo assets from the official HD transparent logo
// (Citico Logo Png.png — 1536x1024, true alpha, verified).
// No visual modifications: colors and geometry preserved; only trim/resize/reverse.
// Usage: node scripts/build-logo-assets.mjs
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const SRC = "C:/Users/Juba Giyafa/Desktop/Company Profiles 2026/Jan 2026/Citico Aviation/Logo/Citico Logo Png.png";
const HERO = ".assets_raw/pdf/pdf-00_obj260_1024x1536.png";
const OUT = "public/img";
fs.mkdirSync(OUT, { recursive: true });

// 1) master transparent logo — trim transparent margins, resize to 3x retina
// of the largest display size, palette-quantized (lossless for flat-color art)
async function saveLogo(input, outFile, width) {
  let img;
  if (input && input.data && input.info) {
    img = sharp(input.data, {
      raw: { width: input.info.width, height: input.info.height, channels: input.info.channels },
    });
  } else {
    img = sharp(input);
  }
  const buf = await img
    .resize({ width, kernel: "lanczos3" })
    .png({ compressionLevel: 9, palette: true, quality: 100, effort: 10 })
    .toBuffer();
  fs.writeFileSync(path.join(OUT, outFile), buf);
  const m = await sharp(buf).metadata();
  console.log(outFile, m.width + "x" + m.height, (buf.length / 1024).toFixed(0) + "KB");
  return buf;
}

await saveLogo(await sharp(SRC).trim().toBuffer(), "logo.png", 820);

// 2) white reversed variant for dark surfaces (only dark pixels -> white; alpha untouched)
{
  const { data, info } = await sharp(SRC).trim().ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let i = 0; i < data.length; i += 4) {
    const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    if (data[i + 3] > 40 && lum < 128) data[i] = data[i + 1] = data[i + 2] = 255;
  }
  await saveLogo(
    { data: new Uint8Array(data), info },
    "logo-white.png",
    820
  );
}

// 3) favicons (square canvas, centered, transparent background)
for (const size of [128, 512]) {
  const buf = await sharp(path.join(OUT, "logo.png"))
    .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toBuffer();
  fs.writeFileSync(path.join(OUT, `favicon-${size}.png`), buf);
}
console.log("favicon-128.png / favicon-512.png");

// 4) OG share image (photo + overlay + original-color logo)
{
  const meta = await sharp(path.join(OUT, "logo.png")).metadata();
  const logoH = 220;
  const logoW = Math.round((meta.width / meta.height) * logoH);
  const logo = await sharp(path.join(OUT, "logo.png")).resize({ height: logoH }).png().toBuffer();
  const hero = await sharp(HERO).rotate().resize(1200, 630, { fit: "cover", position: "attention" }).toBuffer();
  const og = await sharp(hero)
    .composite([
      { input: logo, top: 46, left: 48 },
      {
        input: Buffer.from(
          `<svg width="1200" height="630"><text x="48" y="560" font-family="Georgia, serif" font-size="62" font-weight="bold" fill="#ffffff">CITICO Aviation Co. Ltd</text>
           <text x="48" y="600" font-family="Arial" font-size="28" fill="#c9d4ea">Safe. Reliable. Mission Ready.</text></svg>`
        ),
        top: 0,
        left: 0,
      },
    ])
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer();
  fs.writeFileSync(path.join(OUT, "og.jpg"), og);
  console.log("og.jpg", (og.length / 1024).toFixed(0) + "KB", `(logo ${logoW}x${logoH} full color)`);
}
console.log("DONE");
