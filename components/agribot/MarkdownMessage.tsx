'use client';

import { memo, useMemo } from 'react';
import { renderMarkdown } from './markdown';

interface Props {
  content: string;
}

/**
 * Renders AgriBot markdown content as safe HTML.
 * Double-memoised: useMemo for the render computation + React.memo for
 * the component itself, so the DOM is only updated when content changes.
 */
export const MarkdownMessage = memo(function MarkdownMessage({ content }: Props) {
  const html = useMemo(() => renderMarkdown(content), [content]);
  return (
    <div
      className="text-[13px] leading-relaxed prose-sm max-w-none [&_strong]:font-semibold [&_ul]:my-1 [&_ol]:my-1 [&_h2]:mt-2 [&_h3]:mt-2 [&_p+p]:mt-1.5 [&_a]:break-words"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
});
