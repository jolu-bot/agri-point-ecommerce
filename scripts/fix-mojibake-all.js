const fs = require('fs');
const path = require('path');

const FILES_TO_FIX = [
  'app/a-propos/page.tsx',
  'app/auth/login/page.tsx',
  'app/auth/register/page.tsx',
  'app/gagner-plus/page.tsx',
  'app/mieux-vivre/page.tsx',
  'app/panier/page.tsx',
  'app/produits/[slug]/page.tsx',
  'components/home/Newsletter.tsx',
  'components/home/Testimonials.tsx',
];

const ROOT = path.resolve(__dirname, '..');

function fixMojibake(str) {
  // Match consecutive characters in the Latin-1 supplement range (U+0080 to U+00FF)
  // These are the result of UTF-8 bytes being misread as Latin-1 and re-encoded as UTF-8
  return str.replace(/[\u0080-\u00FF]+/g, (match) => {
    try {
      const bytes = Buffer.from(match, 'latin1');
      const decoded = bytes.toString('utf8');
      return decoded;
    } catch {
      return match;
    }
  });
}

let totalFilesFixed = 0;
let totalLinesFixed = 0;

for (const relPath of FILES_TO_FIX) {
  const fullPath = path.join(ROOT, relPath);
  if (!fs.existsSync(fullPath)) {
    console.log(`SKIP (not found): ${relPath}`);
    continue;
  }
  const original = fs.readFileSync(fullPath, 'utf8');
  const fixed = fixMojibake(original);
  if (fixed !== original) {
    fs.writeFileSync(fullPath, fixed, 'utf8');
    const origLines = original.split('\n');
    const fixLines  = fixed.split('\n');
    let changes = 0;
    for (let i = 0; i < origLines.length; i++) {
      if (origLines[i] !== fixLines[i]) changes++;
    }
    console.log(`FIXED ${changes} line(s): ${relPath}`);
    totalFilesFixed++;
    totalLinesFixed += changes;
  } else {
    console.log(`CLEAN: ${relPath}`);
  }
}

console.log(`\nDone. ${totalFilesFixed} file(s) fixed, ${totalLinesFixed} line(s) corrected.`);
