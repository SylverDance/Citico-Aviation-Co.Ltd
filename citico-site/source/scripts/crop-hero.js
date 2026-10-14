const sharp = require("sharp");
const fs = require("fs");
const src = "public/img/hero-tarmac.png";

/* Pre-cropped masters so the hero frame is always filled edge-to-edge
   (no letterboxing / dead sky band) at every viewport ratio. */
(async () => {
  // Desktop: 2:1 panorama — tail → nose → boarding stairs, sky trimmed
  await sharp(src)
    .extract({ left: 0, top: 140, width: 1536, height: 768 })
    .resize({ width: 1920 })
    .webp({ quality: 82 })
    .toFile("public/img/hero-tarmac.webp");

  // Tablet (4:5-ish): engine, fuselage and the loading crew
  await sharp(src)
    .extract({ left: 480, top: 0, width: 800, height: 1024 })
    .resize({ width: 1100 })
    .webp({ quality: 80 })
    .toFile("public/img/hero-tarmac-tablet.webp");

  // Phone (9:16-ish): nose and the boarding stairs
  await sharp(src)
    .extract({ left: 700, top: 0, width: 600, height: 1024 })
    .resize({ width: 900 })
    .webp({ quality: 80 })
    .toFile("public/img/hero-tarmac-mobile.webp");

  for (const f of ["hero-tarmac.webp", "hero-tarmac-tablet.webp", "hero-tarmac-mobile.webp"]) {
    const p = "public/img/" + f;
    const m = await sharp(p).metadata();
    console.log(f, `${m.width}x${m.height}`, (m.width / m.height).toFixed(2), (fs.statSync(p).size / 1024).toFixed(0) + "KB");
  }
})();
