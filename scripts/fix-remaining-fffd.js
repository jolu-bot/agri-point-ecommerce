// fix-remaining-fffd.js
const fs = require('fs');
const R = '\uFFFD';

const fixes = [
  ['Cr' + R + 'er des r' + R + 'seaux', 'Cr\u00E9er des r\u00E9seaux'],
  ['acc' + R + 's ' + R + ' la sant', 'acc\u00E8s \u00E0 la sant'],
  ['dans 10 r' + R + 'gions', 'dans 10 r\u00E9gions'],
  ['Commerce ' + R + 'quitable', 'Commerce \u00E9quitable'],
  ['certifi\u00E9s ' + R + 'quitables', 'certifi\u00E9s \u00E9quitables'],
  ['assur' + R + 'es', 'assur\u00E9es'],
  ['r' + R + 'g' + R + 'n' + R + 'r' + R + 'es', 'r\u00E9g\u00E9n\u00E9r\u00E9es'],
  ['cr' + R + 'ons un avenir', 'cr\u00E9ons un avenir'],
  ['B' + R + 'n' + R + 'fices d', 'B\u00E9n\u00E9fices d'],
  ['Mara' + R + 'chage', 'Mara\u00EEchage'],
  ['Acc' + R + 's aux march', 'Acc\u00E8s aux march'],
  ['Acc' + R + 's march', 'Acc\u00E8s march'],
  ['Acc' + R + 's semences', 'Acc\u00E8s semences'],
  ['Acc' + R + 's aux services', 'Acc\u00E8s aux services'],
  ['Acc' + R + 's aux technologies', 'Acc\u00E8s aux technologies'],
  ['D' + R + 's Aujourd', 'D\u00E8s Aujourd'],
  ['D' + R + 's Maintenant', 'D\u00E8s Maintenant'],
  ['Priorit' + R, 'Priorit\u00E9'],
  ['Sant' + R + ' &', 'Sant\u00E9 &'],
  ["jusqu'" + R + ' 2 millions', "jusqu'\u00E0 2 millions"],
  ["jusqu'" + R + ' 5 millions', "jusqu'\u00E0 5 millions"],
  ["jusqu'" + R + ' 10 millions', "jusqu'\u00E0 10 millions"],
  ["Solutions d'" + R + 'pargne', "Solutions d'\u00E9pargne"],
  ["d'" + R + 'pargne s', "d'\u00E9pargne s"],
  [R + 'pargne avec int', '\u00C9pargne avec int'],
  ['r' + R + 'colte', 'r\u00E9colte'],
  ['Cr' + R + 'dit habitat', 'Cr\u00E9dit habitat'],
  ['cr' + R + 'dit habitat', 'cr\u00E9dit habitat'],
  ['optimis' + R + 'es', 'optimis\u00E9es'],
  ['Mat' + R + 'riaux', 'Mat\u00E9riaux'],
  ['agriculteurs ' + R + ' cr', 'agriculteurs \u00E0 cr'],
  ['Int' + R + 'r' + R + 'ts', 'Int\u00E9r\u00EAts'],
  ['Programm' + R + 'e', 'Programm\u00E9e'],
  ['Cr' + R + 'dit compl', 'Cr\u00E9dit compl'],
  ['Assurance ' + R + 'pargne', 'Assurance \u00E9pargne'],
  ['conomis' + R + 's', 'conomis\u00E9s'],
  ['Cr' + R + 'dit ', 'Cr\u00E9dit '],
  ['cr' + R + 'dit ', 'cr\u00E9dit '],
  ["J'ai " + R + 'pargn' + R, "J'ai \u00E9pargn\u00E9"],
  [R + 'pargn' + R + 's', '\u00E9pargn\u00E9s'],
  [R + 'pargne ?', '\u00E9pargne ?'],
  ['commencer ' + R + ' ' + R, 'commencer \u00E0 \u00E9'],
  [R + 'pargne r' + R + 'guli', '\u00E9pargne r\u00E9guli'],
  ['guli' + R + 're', 'guli\u00E8re'],
  ['acc' + R + 'der ' + R + ' un', 'acc\u00E9der \u00E0 un'],
  [R + ' partir de', '\u00C0 partir de'],
  ['une ' + R + 'pargne', 'une \u00E9pargne'],
  ['Adh' + R + 'rer', 'Adh\u00E9rer'],
  ['prot' + R + 'geons', 'prot\u00E9geons'],
  ['r' + R + 'gions', 'r\u00E9gions'],
  [R + 'pargne r', '\u00E9pargne r'],
  [R + 'quitables', '\u00E9quitables'],
  [R + 'quitable', '\u00E9quitable'],
  // gagner-plus specific
  ['Réduis' + R + 'z', 'R\u00E9duis\u00E9z'],
  ['Réduis', 'R\u00E9duis'],
  ['reducti' + R + 'on', 'r\u00E9duction'],
  [R + 'pargne incluse', '\u00E9pargne incluse'],
  [R + 'pargn' + R, '\u00E9pargn\u00E9'],
];

const files = [
  'app/a-propos/page.tsx',
  'app/gagner-plus/page.tsx',
  'app/mieux-vivre/page.tsx',
];

for (const f of files) {
  let content = fs.readFileSync(f, 'utf8');
  let count = 0;
  for (const [from, to] of fixes) {
    if (content.includes(from)) {
      content = content.split(from).join(to);
      count++;
    }
  }
  fs.writeFileSync(f, content, 'utf8');
  const remaining = content.split('\n').filter(l => l.includes(R)).length;
  console.log(f + ': ' + count + ' fixes, ' + remaining + ' lines remain');
}
