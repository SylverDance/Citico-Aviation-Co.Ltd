// Extracts embedded raster images from the CITICO company profile PDF.
// Handles /FlateDecode RGB, Gray, CMYK and Indexed images plus /SMask alpha.
// Usage: node scripts/extract-pdf-images.mjs <pdf-path> <out-dir>
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import sharp from "sharp";

const [pdfPath, outDir] = process.argv.slice(2);
if (!pdfPath || !outDir) {
  console.error("usage: node scripts/extract-pdf-images.mjs <pdf> <outdir>");
  process.exit(1);
}
fs.mkdirSync(outDir, { recursive: true });

const buf = fs.readFileSync(pdfPath);

// Collect every top-level object: "N 0 obj ... endobj"
const objects = new Map(); // num -> { dict: string, stream: Buffer | null }
const objRe = /(\d+)\s+0\s+obj\b/g;
let m;
while ((m = objRe.exec(buf.toString("latin1"))) !== null) {
  const num = Number(m[1]);
  const bodyStart = m.index + m[0].length;
  const endIdx = buf.indexOf("endobj", bodyStart);
  if (endIdx === -1) continue;
  const body = buf.slice(bodyStart, endIdx);
  const streamIdx = body.indexOf("stream");
  let dict = body.toString("latin1");
  let stream = null;
  if (streamIdx !== -1) {
    dict = body.slice(0, streamIdx).toString("latin1");
    let dataStart = streamIdx + "stream".length;
    if (body[dataStart] === 0x0d) dataStart++;
    if (body[dataStart] === 0x0a) dataStart++;
    let dataEnd = body.lastIndexOf("endstream");
    if (dataEnd > dataStart) {
      let end = dataEnd;
      if (body[end - 1] === 0x0a) end--;
      if (body[end - 1] === 0x0d) end--;
      stream = body.slice(dataStart, end);
    }
  }
  if (!objects.has(num)) objects.set(num, { dict, stream });
}
console.log("top-level objects:", objects.size);

const dictOf = (n) => {
  const o = objects.get(n);
  if (!o) {
    // object might live inside an object stream — not supported; report
    return null;
  }
  return o;
};
const int = (d, key) => {
  const mm = d.match(new RegExp("/" + key + "\\s+(-?\\d+)"));
  return mm ? Number(mm[1]) : null;
};
const nameOf = (d, key) => {
  const mm = d.match(new RegExp("/" + key + "\\s*/([A-Za-z0-9]+)"));
  return mm ? mm[1] : null;
};

function inflate(streamBuf) {
  for (const fn of [zlib.inflateSync, zlib.inflateRawSync]) {
    try {
      return fn(streamBuf);
    } catch {}
  }
  return null;
}

function decodeImage(objNum, depth = 0) {
  if (depth > 3) return null;
  const o = dictOf(objNum);
  if (!o) return null;
  const d = o.dict;
  if (!/\/Subtype\s*\/Image/.test(d)) return null;
  const w = int(d, "Width");
  const h = int(d, "Height");
  const bpc = int(d, "BitsPerComponent") ?? 8;
  if (!w || !h) return null;

  let filter = nameOf(d, "Filter");
  if (!filter) {
    const arr = d.match(/\/Filter\s*\[([^\]]*)\]/);
    if (arr) {
      const inner = arr[1].match(/\/([A-Za-z0-9]+)/);
      filter = inner ? inner[1] : null;
    }
  }

  let colorSpace = nameOf(d, "ColorSpace");
  let palette = null;
  const idx = d.match(/\/ColorSpace\s*\[?\s*\/Indexed\s+\/Device(RGB|Gray)\s+(\d+)\s+(\d+)\s+0\s+R/);
  if (idx) {
    colorSpace = "Indexed";
    const pal = dictOf(Number(idx[3]));
    if (pal?.stream) {
      const pin = inflate(pal.stream) ?? pal.stream;
      palette = pin.slice(0, (Number(idx[2]) + 1) * (idx[1] === "Gray" ? 1 : 3));
    }
  }

  const smaskRef = d.match(/\/SMask\s+(\d+)\s+0\s+R/);
  const smask = smaskRef ? decodeImage(Number(smaskRef[1]), depth + 1) : null;

  if (!o.stream) return { metaOnly: { w, h, filter, colorSpace, hasStream: false } };
  let data = inflate(o.stream);
  if (!data) {
    if (filter === "DCTDecode") data = o.stream; // raw jpeg
    else return { fail: `inflate failed filter=${filter}` };
  }
  return { w, h, bpc, colorSpace, palette, data, smask: smask && smask.data ? smask : null };
}

function toPng(img) {
  const { w, h, bpc, colorSpace, palette, data, smask } = img;
  if (bpc !== 8) return { fail: `unsupported bpc ${bpc}` };
  let channels;
  if (colorSpace === "DeviceRGB" || colorSpace === "Indexed") channels = 3;
  else if (colorSpace === "DeviceGray") channels = 1;
  else if (colorSpace === "DeviceCMYK") channels = 4;
  else return { fail: `unsupported colorspace ${colorSpace}` };

  const need = w * h * channels;
  if (data.length < need) return { fail: `short data ${data.length}/${need}` };

  let rgba;
  if (channels === 1) {
    rgba = Buffer.alloc(w * h * 3);
    for (let i = 0; i < w * h; i++) {
      const v = data[i];
      rgba[i * 3] = rgba[i * 3 + 1] = rgba[i * 3 + 2] = v;
    }
  } else if (channels === 3) {
    if (colorSpace === "Indexed" && palette) {
      rgba = Buffer.alloc(w * h * 3);
      const maxIdx = palette.length / 3 - 1;
      for (let i = 0; i < w * h; i++) {
        let p = data[i];
        if (p > maxIdx) p = maxIdx;
        rgba[i * 3] = palette[p * 3];
        rgba[i * 3 + 1] = palette[p * 3 + 1];
        rgba[i * 3 + 2] = palette[p * 3 + 2];
      }
    } else {
      rgba = Buffer.from(data.slice(0, need));
    }
  } else {
    // CMYK -> naive RGB
    rgba = Buffer.alloc(w * h * 3);
    for (let i = 0; i < w * h; i++) {
      const c = data[i * 4] / 255,
        mg = data[i * 4 + 1] / 255,
        y = data[i * 4 + 2] / 255,
        k = data[i * 4 + 3] / 255;
      rgba[i * 3] = Math.round(255 * (1 - c) * (1 - k));
      rgba[i * 3 + 1] = Math.round(255 * (1 - mg) * (1 - k));
      rgba[i * 3 + 2] = Math.round(255 * (1 - y) * (1 - k));
    }
  }

  // always produce a 4-channel RGBA raw buffer for sharp
  const out = Buffer.alloc(w * h * 4);
  if (rgba.length === w * h * 4) {
    rgba.copy(out);
  } else {
    for (let i = 0; i < w * h; i++) {
      out[i * 4] = rgba[i * 3];
      out[i * 4 + 1] = rgba[i * 3 + 1];
      out[i * 4 + 2] = rgba[i * 3 + 2];
      out[i * 4 + 3] = 255;
    }
  }
  if (smask && smask.w === w && smask.h === h && smask.colorSpace === "DeviceGray") {
    for (let i = 0; i < w * h; i++) out[i * 4 + 3] = smask.data[i] ?? 255;
  }
  return sharp(out, { raw: { width: w, height: h, channels: 4 } }).png().toBuffer();
}

let saved = 0;
for (const [num, o] of objects) {
  if (!/\/Subtype\s*\/Image/.test(o.dict)) continue;
  const wGuess = int(o.dict, "Width");
  const hGuess = int(o.dict, "Height");
  const decoded = decodeImage(num);
  if (!decoded || decoded.metaOnly) {
    console.log(`obj ${num}: ${wGuess}x${hGuess} SKIPPED (unreachable/compressed dict)`);
    continue;
  }
  if (decoded.fail) {
    console.log(`obj ${num}: ${wGuess}x${hGuess} FAIL ${decoded.fail}`);
    continue;
  }
  try {
    const png = await toPng(decoded);
    const out = path.join(outDir, `pdf-${String(saved).padStart(2, "0")}_obj${num}_${decoded.w}x${decoded.h}.png`);
    fs.writeFileSync(out, png);
    console.log(`obj ${num}: ${decoded.w}x${decoded.h} ${decoded.colorSpace}${decoded.smask ? "+alpha" : ""} -> ${path.basename(out)}`);
    saved++;
  } catch (e) {
    console.log(`obj ${num}: encode fail ${e.message}`);
  }
}
console.log("saved:", saved);
