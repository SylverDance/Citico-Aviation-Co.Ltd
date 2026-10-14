// Maps each embedded image XObject to the PDF page(s) that draw it.
// Handles images nested inside Form XObjects and inherited resources.
// Usage: node scripts/map-pdf-images.mjs <pdf-path>
import fs from "node:fs";
import zlib from "node:zlib";

const pdfPath = process.argv[2];
const buf = fs.readFileSync(pdfPath);
const latin = buf.toString("latin1");

const objects = new Map(); // num -> { dict, stream }
const objRe = /(\d+)\s+0\s+obj\b/g;
let m;
while ((m = objRe.exec(latin)) !== null) {
  const num = Number(m[1]);
  if (objects.has(num)) continue;
  const bodyStart = m.index + m[0].length;
  const endIdx = buf.indexOf("endobj", bodyStart);
  if (endIdx === -1) continue;
  const body = buf.slice(bodyStart, endIdx);
  const streamIdx = body.indexOf("stream");
  let dict = body.slice(0, streamIdx === -1 ? body.length : streamIdx).toString("latin1");
  let stream = null;
  if (streamIdx !== -1) {
    let dataStart = streamIdx + "stream".length;
    if (body[dataStart] === 0x0d) dataStart++;
    if (body[dataStart] === 0x0a) dataStart++;
    const dataEnd = body.lastIndexOf("endstream");
    if (dataEnd > dataStart) {
      let end = dataEnd;
      if (body[end - 1] === 0x0a) end--;
      if (body[end - 1] === 0x0d) end--;
      stream = body.slice(dataStart, end);
    }
  }
  objects.set(num, { dict, stream });
}

const inflate = (b) => {
  for (const fn of [zlib.inflateSync, zlib.inflateRawSync]) {
    try { return fn(b); } catch {}
  }
  return null;
};
function getStream(num, depth = 0) {
  const o = objects.get(num);
  if (!o || depth > 2) return null;
  if (o.stream) {
    if (/\/FlateDecode/.test(o.dict)) return inflate(o.stream)?.toString("latin1") ?? null;
    return o.stream.toString("latin1");
  }
  return null;
}
const fullText = (num) => {
  const o = objects.get(num);
  if (!o) return "";
  return o.dict + "\n" + (getStream(num) ?? "");
};

// Collect the full resources text available to an object (its /Resources inline or by ref)
function resourcesText(objNum, depth = 0) {
  if (depth > 4) return "";
  const t = fullText(objNum);
  // inline resources dict: from /Resources<< to a balanced end — approximate by scanning
  const inlineIdx = t.indexOf("/Resources<<");
  if (inlineIdx !== -1) {
    let i = inlineIdx + "/Resources".length;
    let depthN = 0, start = i;
    for (; i < t.length; i++) {
      if (t[i] === "<") depthN++;
      else if (t[i] === ">") { depthN--; if (depthN === 0) { i++; break; } }
    }
    return t.slice(start, i);
  }
  const ref = t.match(/\/Resources\s+(\d+)\s+0\s+R/);
  if (ref) return fullText(Number(ref[1]));
  return "";
}

// Extract XObject name->objnum pairs from a resources text block (handles nested dicts safely)
function xobjectRefs(resText) {
  const out = [];
  let idx = resText.indexOf("/XObject");
  while (idx !== -1) {
    const seg = resText.slice(idx);
    const m2 = seg.match(/^\/XObject\s*<<([\s\S]*?)>>/);
    if (m2) {
      for (const im of m2[1].matchAll(/\/([A-Za-z0-9_.-]+)\s+(\d+)\s+0\s+R/g)) {
        out.push({ name: im[1], num: Number(im[2]) });
      }
      idx = resText.indexOf("/XObject", idx + m2[0].length);
    } else {
      const m3 = seg.match(/^\/XObject\s+(\d+)\s+0\s+R/);
      if (m3) {
        const inner = resourcesTextDict(Number(m3[1]));
        out.push(...xobjectRefs(inner));
        idx = resText.indexOf("/XObject", idx + m3[0].length);
      } else idx = resText.indexOf("/XObject", idx + 9);
    }
  }
  return out;
}
function resourcesTextDict(num) {
  return resourcesText(num);
}

// Recursively collect image refs starting from page object
function collectImages(objNum, visited, depth = 0) {
  if (depth > 6 || visited.has(objNum)) return [];
  visited.add(objNum);
  const resText = resourcesText(objNum);
  const imgs = [];
  for (const ref of xobjectRefs(resText)) {
    const o = objects.get(ref.num);
    if (!o) continue;
    if (/\/Subtype\s*\/Image/.test(o.dict)) {
      const w = o.dict.match(/\/Width\s+(\d+)/)?.[1];
      const h = o.dict.match(/\/Height\s+(\d+)/)?.[1];
      imgs.push({ ...ref, w, h });
    } else if (/\/Subtype\s*\/Form/.test(o.dict)) {
      imgs.push(...collectImages(ref.num, visited, depth + 1));
    }
  }
  return imgs;
}

// Page tree
let rootNum = null;
const trailerIdx = latin.lastIndexOf("trailer");
if (trailerIdx !== -1) {
  rootNum = Number(latin.slice(trailerIdx, trailerIdx + 2000).match(/\/Root\s+(\d+)\s+0\s+R/)?.[1]) || null;
}
if (!rootNum) rootNum = Number(latin.match(/\/Root\s+(\d+)\s+0\s+R/)?.[1]) || null;
const rootObj = objects.get(rootNum);
const pagesNum = Number(rootObj.dict.match(/\/Pages\s+(\d+)\s+0\s+R/)?.[1]);
if (!pagesNum) { console.error("no pages"); process.exit(1); }

const pages = [];
function walkPages(num, depth = 0) {
  if (depth > 10) return;
  const t = fullText(num);
  if (/\/Type\s*\/Pages\b/.test(t) && !/\/Type\s*\/Page\b/.test(t)) {
    const kids = t.match(/\/Kids\s*\[([^\]]*)\]/);
    if (!kids) return;
    for (const km of kids[1].matchAll(/(\d+)\s+0\s+R/g)) walkPages(Number(km[1]), depth + 1);
  } else if (/\/Type\s*\/Page\b/.test(t)) {
    pages.push(num);
  }
}
walkPages(pagesNum);

console.log("pages found:", pages.length);
pages.forEach((p, i) => {
  const imgs = collectImages(p, new Set());
  if (imgs.length) {
    console.log(`page ${i + 1} (obj ${p}): ` + imgs.map((x) => `${x.name}->obj${x.num} ${x.w}x${x.h}`).join(", "));
  }
});
