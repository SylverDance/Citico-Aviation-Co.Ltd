const sharp = require("sharp");
const fs = require("fs");

/* The uploaded river photograph is a single wide scene; these crops turn its
   three distinct areas (wheelhouse, cargo barge alongside, passenger deck)
   into a gallery for the River Cargo Transport service page. */
const src =
  "C:/Users/Juba Giyafa/Desktop/Company Profiles 2026/Images/gpt-image-1.5-high-fidelity_a_remove_this_flag.png";

const jobs = [
  // Wheelhouse + crew on the roof (portrait 4:5)
  { name: "river-wheelhouse.webp", extract: { left: 440, top: 230, width: 470, height: 588 }, width: 820 },
  // The towed barge loaded with tarped cargo and blue containers (16:10)
  { name: "river-cargo-deck.webp", extract: { left: 770, top: 545, width: 766, height: 479 }, width: 1200 },
  // The passenger deck packed with travellers and goods (16:10)
  { name: "river-passengers.webp", extract: { left: 0, top: 440, width: 520, height: 325 }, width: 900 },
];

(async () => {
  for (const j of jobs) {
    await sharp(src).extract(j.extract).resize({ width: j.width }).webp({ quality: 82 }).toFile("public/img/" + j.name);
    const p = "public/img/" + j.name;
    const m = await sharp(p).metadata();
    console.log(j.name, `${m.width}x${m.height}`, (m.width / m.height).toFixed(2), (fs.statSync(p).size / 1024).toFixed(0) + "KB");
  }
})();
