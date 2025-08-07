'use client';

import React, { useEffect } from 'react';
import { useQuill } from 'react-quilljs';
import 'quill/dist/quill.snow.css';
import type QuillType from 'quill'; // Quill types for the instance

interface QuillReviewProps {
  onContentChange?: (content: string) => void;
  onQuillInit?: (quill: QuillType) => void;
}

export default function QuillReview({ onContentChange, onQuillInit }: QuillReviewProps) {
  const { quill, quillRef } = useQuill({
    modules: {
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ color: [] }, { background: [] }],
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ align: [] }],
        ['blockquote', 'code-block'],
        ['clean'],
      ],
    },
  });

  useEffect(() => {
    if (quill) {
      onQuillInit?.(quill); // Pass Quill instance back up

      quill.on('text-change', () => {
        const html = quillRef.current?.firstChild?.innerHTML;
        onContentChange?.(html || '');
      });
    }
  }, [quill, onContentChange, onQuillInit, quillRef]);

  return (
    <div
      ref={quillRef}
      className="bg-white text-black border pb-4 max-h-64 border-gray-300 p-3"
    />
  );
}
