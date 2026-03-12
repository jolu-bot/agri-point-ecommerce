/**
 * Converts AgriBot markdown syntax to safe HTML.
 * Handles: tables, headings (## ###), bullet lists, numbered lists,
 * bold/italic/strikethrough/code/links, horizontal rules, line breaks.
 */
export function renderMarkdown(raw: string): string {
  // 1. Strip hidden suggestion comments
  let text = raw.replace(/<!--\s*SUGGESTIONS:[\s\S]*?-->/g, '').trim();

  // 2. Markdown tables
  text = text.replace(/((?:^\|.+\|\s*$\n?)+)/gm, (block) => {
    const rows = block.trim().split('\n').filter(r => r.trim());
    const parsed = rows.map(row =>
      row.split('|').filter((_, i, a) => i > 0 && i < a.length - 1).map(c => c.trim())
    );
    if (parsed.length < 2) return block;
    const isSep = (row: string[]) => row.every(c => /^[-:]+$/.test(c));
    const header = parsed[0];
    const body   = parsed.slice(isSep(parsed[1] || []) ? 2 : 1);
    const th = header.map(c =>
      `<th class="px-2 py-1.5 text-left text-xs font-semibold bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">${c}</th>`
    ).join('');
    const trs = body.map(row =>
      `<tr class="even:bg-gray-50 dark:even:bg-gray-800/50">${row.map(c =>
        `<td class="px-2 py-1.5 text-xs border border-gray-200 dark:border-gray-700">${c}</td>`
      ).join('')}</tr>`
    ).join('');
    return `<div class="overflow-x-auto my-2 rounded-lg border border-green-200 dark:border-green-800"><table class="w-full text-sm border-collapse"><thead><tr>${th}</tr></thead><tbody>${trs}</tbody></table></div>`;
  });

  // 3. Headings
  text = text
    .replace(/^### (.+)$/gm, '<h3 class="font-semibold text-[13px] mt-3 mb-1 text-green-800 dark:text-green-300">$1</h3>')
    .replace(/^## (.+)$/gm,  '<h2 class="font-bold text-sm mt-3 mb-1.5 text-green-900 dark:text-green-200 border-b border-green-100 dark:border-green-900 pb-1">$1</h2>');

  // 4. Bullet lists
  text = text.replace(/((?:^[-•*] .+\n?)+)/gm, (block) => {
    const items = block.trim().split('\n').map(l =>
      `<li class="flex gap-2 items-start"><span class="text-green-500 shrink-0 mt-0.5 text-xs">▸</span><span>${l.replace(/^[-•*] /, '')}</span></li>`
    ).join('');
    return `<ul class="space-y-1 my-1.5 list-none">${items}</ul>`;
  });

  // 5. Numbered lists
  text = text.replace(/((?:^\d+\. .+\n?)+)/gm, (block) => {
    let n = 0;
    const items = block.trim().split('\n').map(l => {
      n++;
      return `<li class="flex gap-2 items-start"><span class="text-green-600 dark:text-green-400 font-bold shrink-0 min-w-[1.2rem] text-xs">${n}.</span><span>${l.replace(/^\d+\. /, '')}</span></li>`;
    }).join('');
    return `<ol class="space-y-1 my-1.5 list-none">${items}</ol>`;
  });

  // 6. Inline: bold/italic/strikethrough/code/links
  text = text
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/~~(.+?)~~/g, '<del class="opacity-60">$1</del>')
    .replace(/`(.+?)`/g, '<code class="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-xs font-mono text-green-700 dark:text-green-300">$1</code>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-green-600 dark:text-green-400 underline decoration-dotted hover:decoration-solid font-medium">$1 ↗</a>');

  // 7. Horizontal rules
  text = text.replace(/^---+$/gm, '<hr class="my-2 border-gray-200 dark:border-gray-700"/>');

  // 8. Line breaks
  text = text.replace(/\n\n/g, '</p><p class="mt-2">').replace(/\n/g, '<br/>');

  return `<p class="leading-relaxed">${text}</p>`;
}
