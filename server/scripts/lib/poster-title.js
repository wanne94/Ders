// Helper za placeholder postere: prelama naslov u više <tspan> redova tako da stane u okvir.
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const CHAR_W = 0.55; // procjena širine znaka (sans-serif bold) u odnosu na font size

// Prelamanje po riječima; riječ duža od reda se siječe na komade.
function wrap(text, maxChars) {
  const lines = [];
  let cur = '';
  for (let word of text.split(/\s+/).filter(Boolean)) {
    while (word.length > maxChars) {
      if (cur) { lines.push(cur); cur = ''; }
      lines.push(word.slice(0, maxChars));
      word = word.slice(maxChars);
    }
    if (!cur) cur = word;
    else if ((cur + ' ' + word).length <= maxChars) cur += ' ' + word;
    else { lines.push(cur); cur = word; }
  }
  if (cur) lines.push(cur);
  return lines;
}

function titleTspans(title, { cx = 400, cy = 520, maxWidth = 600, maxLines = 4, fontSize = 64, minFont = 32, weight = 700, opacity } = {}) {
  const text = String(title || '').trim();
  let font = fontSize;
  let lines;
  for (;;) {
    const maxChars = Math.max(1, Math.floor(maxWidth / (font * CHAR_W)));
    lines = wrap(text, maxChars);
    if (lines.length <= maxLines || font <= minFont) {
      if (lines.length > maxLines) {
        lines = lines.slice(0, maxLines);
        const last = lines[maxLines - 1];
        lines[maxLines - 1] = (last.length >= maxChars ? last.slice(0, maxChars - 1) : last).trimEnd() + '…';
      }
      break;
    }
    font -= 4;
  }
  const lh = font * 1.2;
  const y0 = cy - ((lines.length - 1) * lh) / 2;
  const spans = lines.map((l, i) => `<tspan x="${cx}" y="${Math.round(y0 + i * lh)}">${esc(l)}</tspan>`).join('');
  const op = opacity ? ` opacity="${opacity}"` : '';
  return `<text font-family="sans-serif" font-weight="${weight}" font-size="${font}" fill="#fff"${op} text-anchor="middle">${spans}</text>`;
}

module.exports = { titleTspans };
