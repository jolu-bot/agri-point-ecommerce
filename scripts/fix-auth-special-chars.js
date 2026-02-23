// fix-auth-special-chars.js - Fix remaining double-encoded chars in auth pages
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');

const files = ['app/auth/login/page.tsx', 'app/auth/register/page.tsx'];

for (const relPath of files) {
  const fullPath = path.join(ROOT, relPath);
  let content = fs.readFileSync(fullPath, 'utf8');
  
  // Fix â€¢ (U+00E2 U+20AC U+00A2) = U+2022 bullet •
  content = content.split('\u00e2\u20ac\u00a2').join('\u2022');
  // Fix â€¦ = U+2026 ellipsis …
  content = content.split('\u00e2\u20ac\u00a6').join('\u2026');
  // Fix ðŸ"' = 🔒 (lock emoji)
  content = content.split('\u00f0\u009f\u0094\u2019').join('\uD83D\uDD12');
  // Fix ðŸ"' padlock (U+1F512) via bytes
  // The emoji 🔒 is U+1F512, its UTF-8 is F0 9F 94 92
  // Double-encoded: F0->U+00F0=ð, 9F->U+009F=compat, 94->U+0094=ctrl, 92->U+0092=ctrl 
  // In Latin-1 misread: ð (U+00F0), Ÿ (U+009F->displayed as Ÿ U+0178), " (U+201C->U+0094 was ctrl)
  // Actually: bytes F0 9F 94 92 read as Latin-1 give U+00F0 U+009F U+0094 U+0092
  // Then each re-encoded as UTF: U+00F0=C3 B0, U+009F=C2 9F, U+0094=C2 94, U+0092=C2 92  
  // In string: \u00F0\u009F\u0094\u0092 -> but display shows ðŸ"'
  // Let's do: ð (U+00F0) + Ÿ (gets displayed as Ÿ, but codepoint is U+009F or U+0178?)
  // Actually unicode U+009F is C1 control. When latin-1 9F, re-encoded as UTF-8 gives 0xC2 0x9F
  // So in JS string: \u00F0\u009F\u0094\u0092 = 🔒 when decoded 
  const emojiBytes = '\u00F0\u009F\u0094\u0092'; // 🔒
  content = content.split(emojiBytes).join('\uD83D\uDD12'); // 🔒
  
  // Fix ðŸŒ¿ (leaf emoji U+1F33F) = bytes F0 9F 8C BF
  content = content.split('\u00F0\u009F\u008C\u00BF').join('\uD83C\uDF3F'); // 🌿
  
  // Fix ðŸ§ª (test tube U+1F9EA) = F0 9F A7 AA
  content = content.split('\u00F0\u009F\u00A7\u00AA').join('\uD83E\uDDEA'); // 🧪

  // Fix common emoji double-encoding pattern: ðŸ = F0 9F -> first 2 bytes of 4-byte emoji
  // Run the mojibake fixer on latin1 supplement chars only (safe version: skip U+0100+)
  content = content.replace(/[\u0080-\u00FF]+/g, (match) => {
    try {
      const bytes = Buffer.from(match, 'latin1');
      const decoded = bytes.toString('utf8');
      if (!decoded.includes('\uFFFD') && decoded.length < match.length) {
        return decoded;
      }
      return match;
    } catch {
      return match;
    }
  });

  fs.writeFileSync(fullPath, content, 'utf8');
  
  // Check results
  const lines = content.split('\n');
  let bad = 0;
  lines.forEach((l) => {
    const t = l.trimStart();
    if (t.startsWith('//') || t.startsWith('*')) return;
    if (/[\u0080-\u00FF]{3,}/.test(l) || l.includes('\uFFFD')) bad++;
  });
  console.log(relPath + ': ' + bad + ' bad lines remain');
  if (bad > 0) {
    lines.forEach((l, i) => {
      const t = l.trimStart();
      if (t.startsWith('//') || t.startsWith('*')) return;
      if (/[\u0080-\u00FF]{2,}/.test(l) || l.includes('\uFFFD')) {
        console.log('  L' + (i+1) + ': ' + l.trim().slice(0, 80));
      }
    });
  }
}
