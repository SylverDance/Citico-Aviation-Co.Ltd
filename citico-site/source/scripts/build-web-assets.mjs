// Builds all optimized web assets (public/img) from extracted PDF photos,
// the official logo, and partner logos. Uses LANCZOS + entropy crop attention.
// Usage: node scripts/build-web-assets.mjs
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const LOGO_DIR = "C:/Users/Juba Giyafa/Desktop/Company Profiles 2026/Jan 2026/Citico Aviation/Logo";
const RAW = ".assets_raw/pdf";
const OUT = "public/img";
fs.mkdirSync(OUT, { recursive: true });

const j = (n) => path.join(RAW, n);

async function saveJpg(srcPath, outName, w, h, opts = {}) {
  let img = sharp(srcPath).rotate();
  if (opts.trim) {
    const t = await sharp(srcPath).rotate().trim().toBuffer().catch(() => null);
    if (t) img = sharp(t);
  }
  if (w && h) img = img.resize(w, h, { fit: "cover", position: opts.pos ?? sharp.strategy.attention });
  else if (w) img = img.resize({ width: w });
  const pipeline = img.jpeg({ quality: opts.q ?? 78, mozjpeg: true, chromaSubsampling: "4:2:0" });
  const buf = await pipeline.toBuffer();
  fs.writeFileSync(path.join(OUT, outName), buf);
  const meta = await sharp(buf).metadata();
  console.log(outName, meta.width + "x" + meta.height, (buf.length / 1024).toFixed(0) + "KB");
}

// ---------- HERO (cover photo obj260 = Antonov on dust strip at golden hour)
await saveJpg(j("pdf-00_obj260_1024x1536.png"), "hero-aviation.jpg", 1920, 1080, { q: 72, pos: "attention" });
await saveJpg(j("pdf-00_obj260_1024x1536.png"), "hero-aviation-mobile.jpg", 900, 1200, { q: 70, pos: "attention" });

// ---------- LEADERSHIP portraits (identified via PDF placement/draw-order analysis)
const portraits = [
  ["pdf-14_obj102_2989x4096.png", "leader-gasim-papy-lado.jpg"],   // Managing Director (largest, top placement)
  ["pdf-15_obj103_853x1280.png", "leader-joseph-kamanyiry.jpg"],   // Director of Administration
  ["pdf-18_obj109_1086x1448.png", "leader-abdelgyom-elzain.jpg"],  // Operations Manager
  ["pdf-20_obj111_1086x1448.png", "leader-tereza-loro.jpg"],       // Marketing & BD Strategist
];
for (const [src, out] of portraits) {
  await saveJpg(j(src), out, 640, 800, { q: 80 });
}

// Alternate candidates kept for easy swapping (drawn *behind* on the page)
const alts = [
  ["pdf-17_obj108_853x1280.png", "leader-alt-joseph-kamanyiry.jpg"],
  ["pdf-17_obj108_853x1280.png", "leader-alt-abdelgyom-elzain.jpg"],
  ["pdf-19_obj110_1024x1536.png", "leader-alt-tereza-loro.jpg"],
];
for (const [src, out] of alts) await saveJpg(j(src), out, 640, 800, { q: 80 });

// ---------- OPERATIONS / SECTION PHOTOS (page-mapped)
await saveJpg(j("pdf-01_obj40_2752x1536.png"), "ops-cargo.jpg", 1600, 1000, { q: 76 });          // p4 fleet & assets
await saveJpg(j("pdf-04_obj58_2848x1600.png"), "ops-airfield.jpg", 1600, 1000, { q: 76 });       // p7 metrics
await saveJpg(j("pdf-06_obj66_2752x1536.png"), "ops-river.jpg", 1600, 1000, { q: 76 });          // p9 safety (wide, sky+dust)
await saveJpg(j("pdf-12_obj97_2752x1536.png"), "ops-humanitarian.jpg", 1600, 1000, { q: 76 });   // p15 partnerships
await saveJpg(j("pdf-25_obj134_2496x1696.png"), "ops-warehouse.jpg", 1600, 1000, { q: 76 });     // p23 juba hub
await saveJpg(j("pdf-09_obj78_2304x1728.png"), "ops-helicopter.jpg", 1600, 1200, { q: 76 });     // p12
await saveJpg(j("pdf-05_obj62_2400x1792.png"), "ops-ground.jpg", 1600, 1100, { q: 76 });         // p8
await saveJpg(j("pdf-03_obj48_1536x1024.png"), "ops-mission.jpg", 1600, 1000, { q: 76 });        // p6
await saveJpg(j("pdf-11_obj93_1536x1024.png"), "ops-fleet.jpg", 1600, 1000, { q: 76 });          // p14
await saveJpg(j("pdf-13_obj101_1536x1024.png"), "ops-sky.jpg", 1600, 1000, { q: 76 });           // p16 header strip
await saveJpg(j("pdf-23_obj126_1536x1024.png"), "ops-cabin.jpg", 1600, 1000, { q: 76 });        // p21
await saveJpg(j("pdf-08_obj74_1024x1024.png"), "ops-square.jpg", 1200, 1200, { q: 76 });         // p11

// ---------- LOGOS: exact file, no visual modifications ----------
fs.copyFileSync(path.join(LOGO_DIR, "Citico - logo.png"), path.join(OUT, "logo.png"));

// White/transparent version for dark surfaces (recolor dark pixels to white, keep alpha)
const logoHd = path.join(LOGO_DIR, "Citico Logo Png.png");
{
  const { data, info } = await sharp(logoHd).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const out = Buffer.from(data);
  for (let i = 0; i < out.length; i += 4) {
    const lum = 0.299 * out[i] + 0.587 * out[i + 1] + 0.114 * out[i + 2];
    if (lum < 128 && out[i + 3] > 40) {
      out[i] = out[i + 1] = out[i + 2] = 255;
    }
  }
  const buf = await sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } })
    .resize({ width: 900 })
    .png({ compressionLevel: 9 })
    .toBuffer();
  fs.writeFileSync(path.join(OUT, "logo-white.png"), buf);
  console.log("logo-white.png", (buf.length / 1024).toFixed(0) + "KB");
}

// Trim white margin from the official logo for tighter header fit (keep original untouched)
{
  const buf = await sharp(path.join(OUT, "logo.png")).trim().png().toBuffer().catch(() => null);
  if (buf) {
    fs.writeFileSync(path.join(OUT, "logo-trim.png"), buf);
    const m = await sharp(buf).metadata();
    console.log("logo-trim.png", m.width + "x" + m.height, (buf.length / 1024).toFixed(0) + "KB");
  }
}

// favicon (128 and 512) from official logo
for (const size of [128, 512]) {
  const buf = await sharp(path.join(OUT, "logo-trim.png"))
    .resize(size, size, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .png()
    .toBuffer();
  fs.writeFileSync(path.join(OUT, `favicon-${size}.png`), buf);
}
console.log("favicon-128.png / favicon-512.png");

// ---------- PARTNER LOGOS (uploaded transparent PNGs)
fs.copyFileSync(path.join(LOGO_DIR, "MSF.png"), path.join(OUT, "partner-msf.png"));
fs.copyFileSync(path.join(LOGO_DIR, "DRC.png"), path.join(OUT, "partner-drc.png"));
console.log("partner-msf.png, partner-drc.png copied");

// ---------- OG share image
{
  const hero = await sharp(j("pdf-00_obj260_1024x1536.png")).rotate().resize(1200, 630, { fit: "cover", position: "attention" }).toBuffer();
  const logo = await sharp(path.join(OUT, "logo-trim.png")).resize(280).png().toBuffer();
  const svg = Buffer.from(
    `<svg width="1200" height="630"><rect width="1200" height="630" fill="rgba(4,16,38,0.35)"/>
     <rect x="0" y="470" width="1200" height="160" fill="rgba(4,16,38,0.82)"/></svg>`
  );
  const withOverlay = await sharp(hero).composite([{ input: svg }]).toBuffer();
  const logoMeta = await sharp(logo).metadata();
  const og = await sharp(withOverlay)
    .composite([
      { input: logo, top: 48, left: 48 },
      {
        input: Buffer.from(
          `<svg width="1200" height="630"><text x="48" y="560" font-family="Georgia, serif" font-size="64" font-weight="bold" fill="#ffffff">CITICO Aviation Co. Ltd</text>
           <text x="48" y="600" font-family="Arial" font-size="28" fill="#9fb6d9">Safe. Reliable. Mission Ready.</text></svg>`
        ),
        top: 0,
        left: 0,
      },
    ])
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer();
  fs.writeFileSync(path.join(OUT, "og.jpg"), og);
  console.log("og.jpg", (og.length / 1024).toFixed(0) + "KB");
}

console.log("DONE");
