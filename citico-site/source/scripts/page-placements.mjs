// Shows placement (position/size on page) of each image drawn on given pages.
// Usage: node scripts/page-placements.mjs <pdf-path> <pageObjNum> [pageObjNum...]
import fs from "node:fs";
import zlib from "node:zlib";

const pdfPath = process.argv[2];
const pageObjs = process.argv.slice(3).map(Number);
const buf = fs.readFileSync(pdfPath);
const latin = buf.toString("latin1");

const objects = new Map();
let m;
const re = /(\d+)\s+0\s+obj\b/g;
while ((m = re.exec(latin)) !== null) {
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

// resolve the XObject dict of an object's resources
function xobjectMap(objNum, depth = 0) {
  if (depth > 4) return [];
  const t = fullText(objNum);
  const refs = [];
  let idx = t.indexOf("/XObject");
  while (idx !== -1) {
    const seg = t.slice(idx);
    const m2 = seg.match(/^\/XObject\s*<<([\s\S]*?)>>/);
    if (m2) {
      for (const im of m2[1].matchAll(/\/([A-Za-z0-9_.-]+)\s+(\d+)\s+0\s+R/g)) {
        refs.push({ name: im[1], num: Number(im[2]) });
      }
      break;
    }
    const m3 = seg.match(/^\/XObject\s+(\d+)\s+0\s+R/);
    if (m3) { refs.push(...xobjectMap(Number(m3[1]), depth + 1)); break; }
    idx = t.indexOf("/XObject", idx + 9);
  }
  return refs;
}

// find image/form refs recursively; track nested names like Fm0/Im0
function collectRefs(objNum, prefix = "", depth = 0, seen = new Set()) {
  if (depth > 6 || seen.has(objNum)) return [];
  seen.add(objNum);
  const out = [];
  for (const ref of xobjectMap(objNum)) {
    const o = objects.get(ref.num);
    if (!o) continue;
    const path = prefix ? `${prefix}/${ref.name}` : ref.name;
    if (/\/Subtype\s*\/Image/.test(o.dict)) {
      out.push({ path, num: ref.num, w: o.dict.match(/\/Width\s+(\d+)/)?.[1], h: o.dict.match(/\/Height\s+(\d+)/)?.[1] });
    } else if (/\/Subtype\s*\/Form/.test(o.dict)) {
      out.push(...collectRefs(ref.num, path, depth + 1, seen));
    }
  }
  return out;
}

// Resolve /Contents of a page (may be a ref or array of refs)
function contentText(objNum, depth = 0) {
  if (depth > 3) return "";
  const t = fullText(objNum);
  const refs = [];
  const single = t.match(/\/Contents\s+(\d+)\s+0\s+R/);
  if (single) refs.push(Number(single[1]));
  else {
    const arr = t.match(/\/Contents\s*\[([^\]]*)\]/);
    if (arr) for (const r of arr[1].matchAll(/(\d+)\s+0\s+R/g)) refs.push(Number(r[1]));
  }
  if (!refs.length) {
    // maybe the object itself has the stream (form xobject)
    return getStream(objNum) ?? "";
  }
  return refs.map((n) => getStream(n) ?? "").join("\n");
}

// tokenize a content stream and simulate CTM for "q cm ... Do Q"
function placements(objNum, refList, depth = 0) {
  if (depth > 6) return [];
  let content = contentText(objNum);
  if (!content && objects.get(objNum)?.stream) content = objects.get(objNum).stream.toString("latin1");
  const refs = refList ?? collectRefs(objNum);
  const byName = new Map(refs.map((r) => [r.path, r]));
  const out = [];
  // very small PDF interpreter: track q/Q and cm, handle Do (both image and nested form)
  const stack = [];
  let ctm = [1, 0, 0, 1, 0, 0];
  const mul = (a, b) => [
    a[0] * b[0] + a[1] * b[2],
    a[0] * b[1] + a[1] * b[3],
    a[2] * b[0] + a[3] * b[2],
    a[2] * b[1] + a[3] * b[3],
    a[4] * b[0] + a[5] * b[2] + b[4],
    a[4] * b[1] + a[5] * b[3] + b[5],
  ];
  const apply = (m, p) => [
    m[0] * p[0] + m[2] * p[1] + m[4],
    m[1] * p[0] + m[3] * p[1] + m[5],
  ];
  const tokens = content.match(/\/[A-Za-z0-9_.#-]+|-?\d*\.?\d+|q|Q|cm|Do|BT|ET/g) ?? [];
  let operands = [];
  const forms = new Map(refs.filter((r) => !r.w).map((r) => [r.path, r.num]));
  const run = (tokens, forms, ctmStart, prefix = "", depth = 0) => {
    let ctm = ctmStart;
    const stack = [];
    let operands = [];
    let inText = false;
    for (const tk of tokens) {
      if (tk === "BT") { inText = true; operands = []; continue; }
      if (tk === "ET") { inText = false; operands = []; continue; }
      if (inText) continue; // skip all text-state ops & operands
      if (/^-?\d*\.?\d+$/.test(tk)) { operands.push(parseFloat(tk)); continue; }
      if (tk === "q") { stack.push(ctm); operands = []; continue; }
      if (tk === "Q") { ctm = stack.pop() ?? ctmStart; operands = []; continue; }
      if (tk === "cm" && operands.length >= 6) {
        const c = operands.slice(-6);
        ctm = mul(c, ctm);
        operands = [];
        continue;
      }
      if (tk === "Do" && operands.length >= 1) {
        const name = operands[operands.length - 1].replace(/^\//, "");
        operands = [];
        const key = (prefix ? prefix + "/" : "") + name;
        const full = byName.get(key) ?? byName.get(name);
        if (full) {
          if (full.w) {
            const p1 = apply(ctm, [0, 0]);
            const p2 = apply(ctm, [1, 1]);
            out.push({ path: full.path, num: full.num, w: full.w, h: full.h, x: Math.min(p1[0], p2[0]), y: Math.min(p1[1], p2[1]), wpt: Math.abs(p2[0] - p1[0]), hpt: Math.abs(p2[1] - p1[1]) });
          } else {
            const formNum = forms.get(key) ?? forms.get(name);
            if (formNum && depth < 6) {
              const innerRefs = collectRefs(formNum, key, 0, new Set());
              const inner = placements(formNum, innerRefs, depth + 1);
              for (const pl of inner) {
                const q1 = [pl.x, pl.y], q2 = [pl.x + pl.wpt, pl.y + pl.hpt];
                const a1 = [ctm[0] * q1[0] + ctm[2] * q1[1] + ctm[4], ctm[1] * q1[0] + ctm[3] * q1[1] + ctm[5]];
                const a2 = [ctm[0] * q2[0] + ctm[2] * q2[1] + ctm[4], ctm[1] * q2[0] + ctm[3] * q2[1] + ctm[5]];
                out.push({ ...pl, x: Math.min(a1[0], a2[0]), y: Math.min(a1[1], a2[1]), wpt: Math.abs(a2[0] - a1[0]), hpt: Math.abs(a2[1] - a1[1]) });
              }
            }
          }
        }
        continue;
      }
      if (tk.startsWith("/")) { operands = [tk]; continue; } // keep name operand for Do
      operands = [];
    }
  };
  run(tokens, forms, [1, 0, 0, 1, 0, 0], "", 0);
  return out;
}

for (const pageObj of pageObjs) {
  console.log(`=== page obj ${pageObj} ===`);
  const refs = collectRefs(pageObj);
  for (const r of refs) console.log("  refs:", r.path, "->obj" + r.num, r.w ? `${r.w}x${r.h}` : "(form)");
  const pls = placements(pageObj, refs);
  const media = objects.get(pageObj).dict.match(/\/MediaBox\s*\[([^\]]*)\]/)?.[1] ?? "0 0 595.276 841.89";
  const [ , , W, H] = media.split(/\s+/).map(Number);
  for (const p of pls.sort((a, b) => b.y - a.y)) {
    console.log(
      `  ${p.path} obj${p.num} ${p.w}x${p.h}px -> x=${p.x.toFixed(0)} y=${p.y.toFixed(0)} ${p.wpt.toFixed(0)}x${p.hpt.toFixed(0)}pt (page ${W}x${H}) top=${(((H - p.y - p.hpt) / H) * 100).toFixed(0)}% left=${((p.x / W) * 100).toFixed(0)}% w=${((p.wpt / W) * 100).toFixed(0)}%`
    );
  }
}
