import sharp from "sharp";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = path.join(__dirname, "..", "public", "icon.svg");
const out = path.join(__dirname, "..", "src", "app", "favicon.ico");

const sizes = [16, 32, 48];

const pngBuffers = await Promise.all(
  sizes.map((size) => sharp(src).resize(size, size).png().toBuffer())
);

// ICO container with PNG-format frames (supported by all modern OSes/browsers since Vista).
const headerSize = 6;
const dirEntrySize = 16;
const dirSize = dirEntrySize * sizes.length;
let offset = headerSize + dirSize;

const header = Buffer.alloc(headerSize);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // type: icon
header.writeUInt16LE(sizes.length, 4); // image count

const dirEntries = [];
for (let i = 0; i < sizes.length; i++) {
  const size = sizes[i];
  const buf = pngBuffers[i];
  const entry = Buffer.alloc(dirEntrySize);
  entry.writeUInt8(size === 256 ? 0 : size, 0); // width
  entry.writeUInt8(size === 256 ? 0 : size, 1); // height
  entry.writeUInt8(0, 2); // color count
  entry.writeUInt8(0, 3); // reserved
  entry.writeUInt16LE(1, 4); // planes
  entry.writeUInt16LE(32, 6); // bit count
  entry.writeUInt32LE(buf.length, 8); // bytes in resource
  entry.writeUInt32LE(offset, 12); // image offset
  offset += buf.length;
  dirEntries.push(entry);
}

fs.writeFileSync(out, Buffer.concat([header, ...dirEntries, ...pngBuffers]));
console.log(`wrote ${out}`);
