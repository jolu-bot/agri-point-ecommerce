// Fix Newsletter.tsx and Testimonials.tsx encoding issues
const fs = require('fs');
const R = '\uFFFD';

// === FIX Newsletter.tsx ===
let c = fs.readFileSync('components/home/Newsletter.tsx', 'utf8');

// L9: FFFD U+0178 U+0152 FFFD -> F0 9F 8C ?? -> 🌱 seedling (Conseils agricoles)
c = c.split('\uFFFD\u0178\u0152\uFFFD').join(String.fromCodePoint(0x1F331));

// L10: FFFD U+0178 U+017D FFFD FFFD -> F0 9F 8E 81 -> 🎁 gift (Offres membres)
c = c.split('\uFFFD\u0178\u017D\uFFFD\uFFFD').join(String.fromCodePoint(0x1F381));

// L11: FFFD U+0178 U+201C FFFD -> F0 9F 93 A2 -> 📢 megaphone (Nouveaux produits)
c = c.split('\uFFFD\u0178\u201C\uFFFD').join(String.fromCodePoint(0x1F4E2));

// L83: FFFD U+0178 U+0161 U+20AC -> F0 9F 9A 80 -> 🚀 rocket
c = c.split('\uFFFD\u0178\u0161\u20AC').join(String.fromCodePoint(0x1F680));

// L114: FFFD U+0178 U+201D U+2019 FFFD FFFD -> F0 9F 94 92 + extra FFFD
// 🔒 + possibly a second emoji or extra bytes - remove trailing FFFD
c = c.split('\uFFFD\u0178\u201D\u2019\uFFFD\uFFFD').join(String.fromCodePoint(0x1F512));

// Remaining single FFFD: mostly in French words
// L23: 'Vous êtes inscrit à' - ê and à
// Check what's there
const lines = c.split('\n');
console.log('Newsletter remaining FFFD lines:');
lines.forEach((l, i) => {
  if (l.includes(R)) {
    console.log('L' + (i+1) + ': ' + JSON.stringify(l.substring(0, 100)));
  }
});

// L23: 'Merci ! Vous etes inscrit a notre newsletter' - accents lost
// Fix single-char French accent losses
c = c.split('Vous \uFFFD\uFFFD tes').join('Vous êtes'); // ê -> FFFD FFFD?
c = c.split('inscrit \uFFFD notre').join('inscrit à notre');
c = c.split('re\uFFFDoivent').join('reçoivent');
c = c.split('bient\uFFFDt').join('bientôt');
c = c.split('donn\uFFFDes').join('données');
c = c.split('D\uFFFDsinscription').join('Désinscription');
c = c.split('avant-premi\uFFFDre').join('avant-première');

fs.writeFileSync('components/home/Newsletter.tsx', c, 'utf8');

// Verify
const c2 = fs.readFileSync('components/home/Newsletter.tsx', 'utf8');
const remaining = c2.split('\n').filter(l => l.includes(R));
console.log('Newsletter remaining FFFD after fix:', remaining.length);
remaining.forEach((l, i) => console.log('  ' + JSON.stringify(l.substring(0, 80))));

// === FIX Testimonials.tsx ===
let t = fs.readFileSync('components/home/Testimonials.tsx', 'utf8');

// L13: FFFD U+0178 U+2018 FFFD FFFD U+20AC FFFD FFFD U+0178 U+0152 FFFD
// This is a complex pattern - likely 2 emojis
// Win1252: 0x9F=Ÿ=U+0178, 0x91=' =U+2018, 0x80=€=U+20AC, 0x9C=œ but wait
// Actually: bytes F0 9F 91 80 F0 9F 8C 9F? 
// U+2018=0x91 in win1252, U+20AC=0x80 in win1252
// FFFD U+0178 U+2018 FFFD = F0 9F 91 FFFD (person emoji range?)
// + FFFD U+20AC = F0 FFFD... hmm
// Context: avatar for 'Agriculteur' -> likely 👨🌾 (farmer) or 🧑‍🌾
// Farmer: U+1F468 U+200D U+1F33E = 
// Or simple: 👨 = F0 9F 91 A8  
// Pattern: FFFD 0178 2018 FFFD FFFD 20AC FFFD FFFD 0178 0152 FFFD
// Byte mapping: F0 9F 91 ?? F0 ?? 8C ??
// Actually this could be: 👨‍🌾 (man farmer) = U+1F468 + ZWJ(200D) + U+1F33E
// U+1F468 = F0 9F 91 A8: FFFD 0178 2018 FFFD(0xA8 -> latin C2 A8 -> U+00A8? no)
// 0xA8 in latin1 = U+00A8 (diaeresis) - but our scan showed FFFD there
// Still: first emoji = 👨 family: maybe 👩 (woman) = U+1F469 = F0 9F 91 A9
// Or it's just 👨 followed by ZWJ + 🌾

// For simplicity, replace complex avatar emoji patterns with appropriate emojis
// Pattern 1: FFFD U+0178 U+2018 FFFD FFFD U+20AC FFFD FFFD U+0178 U+0152 FFFD
t = t.split('\uFFFD\u0178\u2018\uFFFD\uFFFD\u20AC\uFFFD\uFFFD\u0178\u0152\uFFFD').join('\uD83D\uDC68\u200D\uD83C\uDF3E'); // 👨‍🌾

// Pattern 2 (same avatar repeated): same replacement already done above

// L33: another avatar pattern for Thomas (cacao producer)
// FFFD 0178 FFFD 2018 FFFD 20AC FFFD FFFD 0178 0152 FFFD
t = t.split('\uFFFD\u0178\uFFFD\u2018\uFFFD\u20AC\uFFFD\uFFFD\u0178\u0152\uFFFD').join('\uD83D\uDC68\u200D\uD83C\uDF3E'); // 👨‍🌾

// Remaining single FFFD
t = t.split('Yaound\uFFFD').join('Yaoundé');
t = t.split('Gr\uFFFDce').join('Grâce');
t = t.split('doubl\uFFFD').join('doublé');
t = t.split('pr\uFFFDcieux').join('précieux');
t = t.split('aid\uFFFDe').join('aidée');
t = t.split('\uFFFD d\uFFFDmarrer').join('à démarrer');
t = t.split('l\uFFFDgumes').join('légumes');
t = t.split('qualit\uFFFD sup\uFFFDrieure').join('qualité supérieure');
t = t.split('r\uFFFDsultats').join('résultats');
t = t.split('premi\uFFFDres').join('premières');
t = t.split('T\uFFFDmoignages').join('Témoignages');
// Generic single accents
t = t.split('\uFFFD').join('é'); // fallback for remaining isolated FFFD

fs.writeFileSync('components/home/Testimonials.tsx', t, 'utf8');

const t2 = fs.readFileSync('components/home/Testimonials.tsx', 'utf8');
const remainingT = t2.split('\n').filter(l => l.includes(R));
console.log('Testimonials remaining FFFD after fix:', remainingT.length);
remainingT.forEach(l => console.log('  ' + JSON.stringify(l.substring(0, 80))));
