const sharp = require("sharp");
const fs = require("fs");

/* Source: uploaded river-barge photograph (single wide deck piled with cargo,
   a second barge alongside) on the Nile corridor. Regenerates the ops-river
   master used by the River Cargo Transport service + logistics pages. */
const src =
  "C:/Users/Juba Giyafa/Desktop/Company Profiles 2026/Images/gpt-image-1.5-high-fidelity_a_remove_this_flag.png";

(async () => {
  const meta = await sharp(src).metadata();
  console.log("source", `${meta.width}x${meta.height}`, meta.format);

  // 1600x1000 (16:10) matches the previous master so no layout shifts.
  // 1536x1024 source -> trim equal top/bottom to 1536x960, then upscale to 1600x1000.
  const targetRatio = 1600 / 1000;
  let w = meta.width;
  let h = Math.round(w / targetRatio);
  if (h > meta.height) {
    h = meta.height;
    w = Math.round(h * targetRatio);
  }
  const left = Math.round((meta.width - w) / 2);
  const top = Math.round((meta.height - h) / 2);

  await sharp(src)
    .extract({ left, top, width: w, height: h })
    .resize({ width: 1600, height: 1000, fit: "cover" })
    .jpeg({ quality: 84, mozjpeg: true })
    .toFile("public/img/ops-river.jpg");

  const out = await sharp("public/img/ops-river.jpg").metadata();
  console.log(
    "ops-river.jpg",
    `${out.width}x${out.height}`,
    `${(fs.statSync("public/img/ops-river.jpg").size / 1024).toFixed(0)}KB`
  );
})();
