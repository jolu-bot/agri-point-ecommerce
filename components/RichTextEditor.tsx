'use client';

import React, { useState } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

/**
 * Éditeur de texte enrichi simple
 * À remplacer par TinyMCE, Draft.js ou Slate selon les besoins
 */
export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const [content, setContent] = useState(value);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setContent(newValue);
    onChange(newValue);
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="bg-gray-100 border-b p-2 flex gap-2">
        <button className="px-2 py-1 bg-white border rounded hover:bg-gray-50" title="Gras">
          <strong>B</strong>
        </button>
        <button className="px-2 py-1 bg-white border rounded hover:bg-gray-50" title="Italique">
          <em>I</em>
        </button>
        <button className="px-2 py-1 bg-white border rounded hover:bg-gray-50" title="Souligné">
          <u>U</u>
        </button>
      </div>
      <textarea
        value={content}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full p-4 min-h-[200px] resize-y focus:outline-none"
      />
    </div>
  );
}
