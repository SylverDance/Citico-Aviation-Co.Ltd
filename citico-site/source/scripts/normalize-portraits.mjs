// Normalize leadership portraits into a uniform "executive photoshoot" look.
// Strategy: detect the top of the face via skin-tone row density, then anchor
// it at a fixed fraction of the frame — uniform headroom and eye level across
// all four photos. Deterministic 'top-anchored' crop (never the unreliable
// attention zoom).
// Usage: node scripts/normalize-portraits.mjs
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const RAW = ".assets_raw/pdf";
const OUT = "public/img";
fs.mkdirSync(OUT, { recursive: true });
const j = (n) => path.join(RAW, n);

const portraits = [
  ["pdf-14_obj102_2989x4096.png", "leader-gasim-papy-lado.jpg"],
  ["pdf-15_obj103_853x1280.png", "leader-joseph-kamanyiry.jpg"],
  ["pdf-18_obj109_1086x1448.png", "leader-abdelgyom-elzain.jpg"],
  ["pdf-20_obj111_1086x1448.png", "leader-tereza-loro.jpg"],
];

const W = 880, H = 1100; // 4:5
const FACE_ANCHOR = 0.1; // top of face sits 10% from frame top
const GRADE = { brightness: 1.02, saturation: 0.96, gamma: 1.0, coolR: 1.01, coolB: 0.99 };

function isSkin(r, g, b) {
  // practical skin-tone rule (works across dark skin tones too):
  return (
    r > 60 && g > 30 && b > 15 &&
    r > g && r > b &&
    r - Math.min(g, b) > 12 &&
    Math.abs(r - g) < 90
  );
}

// find the first row (from top) where a meaningful amount of skin appears
async function findFaceTop(buf) {
  const { data, info } = await sharp(buf).resize(120, 160, { fit: "fill" }).raw().toBuffer({ resolveWithObject: true });
  const ch = info.channels;
  for (let y = 0; y < info.height; y++) {
    let skin = 0;
    for (let x = 0; x < info.width; x++) {
      const i = (y * info.width + x) * ch;
      if (isSkin(data[i], data[i + 1], data[i + 2])) skin++;
    }
    if (skin > info.width * 0.04) {
      return y / info.height; // fraction of image height
    }
  }
  return null; // no face detected
}

for (const [src, out] of portraits) {
  const baseBuf = await sharp(j(src)).rotate().removeAlpha().toBuffer();
  const meta = await sharp(baseBuf).metadata();
  const iw = meta.width, ih = meta.height;

  // crop window: full width, height = width / 0.8 (4:5), clamp to image
  let cropH = Math.min(ih, Math.round(iw / (W / H)));
  let cropTop = 0;

  const faceFrac = await findFaceTop(baseBuf);
  if (faceFrac !== null) {
    const faceY = faceFrac * ih;
    // place top of face at FACE_ANCHOR of the crop window
    cropTop = Math.round(faceY - FACE_ANCHOR * cropH);
    cropTop = Math.max(0, Math.min(cropTop, ih - cropH));
  } else {
    // fallback: gentle top-anchor with 4% headroom
    cropTop = Math.min(Math.round(ih * 0.04), ih - cropH);
  }

  // render crop+grade; probe on the GRADED pixels so the calibration loop
  // measures exactly what the saved JPEG will contain
  let cropW = iw;
  async function render(top, cw) {
    let pipe = sharp(baseBuf).extract({ left: Math.round((iw - cw) / 2), top, width: Math.round(cw), height: cropH }).resize(W, H, {
      fit: cropH / cw === H / W ? "fill" : "cover",
      position: "top",
    });
    const { data, info } = await pipe.raw().toBuffer({ resolveWithObject: true });
    for (let i = 0; i < data.length; i += info.channels) {
      data[i] = Math.min(255, data[i] * GRADE.coolR);
      data[i + 2] = Math.min(255, data[i + 2] * GRADE.coolB);
    }
    return { data, info };
  }
  function probeFaceTop(data, info) {
    const smallW = 120, smallH = 150;
    // sample graded buffer directly at reduced resolution
    const sx = info.width / smallW, sy = info.height / smallH;
    for (let y = 0; y < smallH; y++) {
      let s = 0;
      for (let x = 0; x < smallW; x++) {
        const si = (Math.round(y * sy) * info.width + Math.round(x * sx)) * info.channels;
        if (isSkin(data[si], data[si + 1], data[si + 2])) s++;
      }
      if (s > smallW * 0.04) return y / smallH;
    }
    return null;
  }

  let { data, info } = await render(cropTop, cropW);
  for (let iter = 0; iter < 6; iter++) {
    const top = probeFaceTop(data, info);
    if (top === null) break;
    const delta = top - FACE_ANCHOR; // + = face too low -> move crop down
    if (Math.abs(delta) <= 0.008) break;
    let shift = Math.round(delta * cropH);
    let newTop = Math.max(0, Math.min(cropTop + shift, ih - cropH));
    // boundary blocked us? zoom in slightly (never below 78% of source width)
    if (newTop === cropTop && cropW > iw * 0.78) {
      cropW = Math.max(iw * 0.78, cropW * 0.94);
      cropH = Math.round(cropW / (W / H));
      newTop = Math.max(0, Math.min(Math.round(faceFrac * ih - FACE_ANCHOR * cropH), ih - cropH));
    }
    if (newTop === cropTop) break;
    cropTop = newTop;
    ({ data, info } = await render(cropTop, cropW));
  }

  const buf = await sharp(data, { raw: { width: info.width, height: info.height, channels: info.channels } })
    .modulate({ brightness: GRADE.brightness, saturation: GRADE.saturation })
    .jpeg({ quality: 84, mozjpeg: true, chromaSubsampling: "4:4:4" })
    .toBuffer();

  fs.writeFileSync(path.join(OUT, out), buf);
  console.log(out, `880x1100`, `faceTop=${(faceFrac ?? -1).toFixed(2)} cropTop=${cropTop}/${ih}`, (buf.length / 1024).toFixed(0) + "KB");
}

// alternates at same geometry
const alts = [
  ["pdf-17_obj108_853x1280.png", "leader-alt-joseph-kamanyiry.jpg"],
  ["pdf-19_obj110_1024x1536.png", "leader-alt-tereza-loro.jpg"],
];
for (const [src, out] of alts) {
  const buf = await sharp(j(src)).rotate().removeAlpha().resize(W, H, { fit: "cover", position: "top" })
    .jpeg({ quality: 84, mozjpeg: true }).toBuffer();
  fs.writeFileSync(path.join(OUT, out), buf);
  console.log(out, "880x1100 (top-anchor)");
}
console.log("DONE");
