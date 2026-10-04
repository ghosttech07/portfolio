// Converts a TTF into three.js "typeface.json" (for drei <Text3D>).
// Usage: node scripts/gen-font.mjs path/to/Font.ttf public/fonts/anton.typeface.json
import opentype from 'opentype.js';
import { writeFileSync, readFileSync } from 'node:fs';

const [, , src, out] = process.argv;
const buf = readFileSync(src);
const font = opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 .,!?&'-+/";
const glyphs = {};
const r = (n) => Math.round(n);
for (const ch of chars) {
  const g = font.charToGlyph(ch);
  const cmds = [];
  let x = 0, y = 0;
  for (const c of g.getPath(0, 0, font.unitsPerEm).commands) {
    // opentype paths are y-down (screen); typeface.json is y-up
    const Y = (v) => r(-v);
    if (c.type === 'M') cmds.push('m', r(c.x), Y(c.y));
    else if (c.type === 'L') cmds.push('l', r(c.x), Y(c.y));
    else if (c.type === 'Q') cmds.push('q', r(c.x), Y(c.y), r(c.x1), Y(c.y1));
    else if (c.type === 'C') cmds.push('b', r(c.x), Y(c.y), r(c.x1), Y(c.y1), r(c.x2), Y(c.y2));
  }
  glyphs[ch] = { ha: r(g.advanceWidth), x_min: 0, x_max: r(g.advanceWidth), o: cmds.join(' ') };
}
const json = {
  glyphs,
  familyName: 'Anton',
  ascender: font.ascender,
  descender: font.descender,
  underlinePosition: -100,
  underlineThickness: 50,
  boundingBox: { yMin: font.descender, xMin: 0, yMax: font.ascender, xMax: 2000 },
  resolution: font.unitsPerEm,
  original_font_information: {},
};
writeFileSync(out, JSON.stringify(json));
console.log('wrote', out, Object.keys(glyphs).length, 'glyphs, upm', font.unitsPerEm);
