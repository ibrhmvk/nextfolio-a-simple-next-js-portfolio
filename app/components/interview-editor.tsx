'use client';

import React, { useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import python from 'highlight.js/lib/languages/python';
import xml from 'highlight.js/lib/languages/xml'; // For HTML
import css from 'highlight.js/lib/languages/css';
import plaintext from 'highlight.js/lib/languages/plaintext';
import 'highlight.js/styles/github.css'; // Base styles
import './code-highlight.css'; // Reuse existing styles

// Register languages
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('python', python);
hljs.registerLanguage('html', xml);
hljs.registerLanguage('css', css);
hljs.registerLanguage('plaintext', plaintext);

interface InterviewEditorProps {
  code: string;
  language: string;
  onChange: (code: string) => void;
}

const getLanguageClass = (language: string): string => {
  switch (language) {
    case 'js':
      return 'javascript';
    case 'py':
      return 'python';
    case 'html':
      return 'html';
    case 'css':
      return 'css';
    default:
      return language || 'plaintext';
  }
};

const InterviewEditor: React.FC<InterviewEditorProps> = ({
  code,
  language,
  onChange,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  // Synchronize scrolling between textarea and pre elements
  const syncScroll = (e: Event) => {
    if (preRef.current && textareaRef.current) {
      preRef.current.scrollTop = textareaRef.current.scrollTop;
      preRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  useEffect(() => {
    // Highlight code when it changes
    if (preRef.current) {
      const highlightedCode = hljs.highlight(
        code,
        { language: getLanguageClass(language) }
      ).value;
      preRef.current.innerHTML = highlightedCode;
    }

    // Set up scroll synchronization
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.addEventListener('scroll', syncScroll);
      return () => {
        textarea.removeEventListener('scroll', syncScroll);
      };
    }
  }, [code, language]);

  // Set theme colors based on dark/light mode
  const backgroundColor = isDark ? '#1a1a1a' : '#f8f8f8';
  const textColor = isDark ? '#e0e0e0' : '#333333';
  
  // Define token colors based on theme
  const tokenColors = {
    keyword: isDark ? '#c792ea' : '#7c4dff',
    string: isDark ? '#c3e88d' : '#009688',
    comment: isDark ? '#676e95' : '#9e9e9e',
    function: isDark ? '#82aaff' : '#4271ae',
    number: isDark ? '#f78c6c' : '#e65100',
    operator: isDark ? '#89ddff' : '#0086b3',
    variable: isDark ? '#f07178' : '#986801',
  };

  // Create CSS variables for use in styled components
  const cssVariables = {
    '--bg-color': backgroundColor,
    '--text-color': textColor,
    '--keyword-color': tokenColors.keyword,
    '--string-color': tokenColors.string,
    '--comment-color': tokenColors.comment,
    '--function-color': tokenColors.function,
    '--number-color': tokenColors.number,
    '--operator-color': tokenColors.operator,
    '--variable-color': tokenColors.variable,
  } as React.CSSProperties;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="code-editor-container" style={cssVariables}>
      <pre 
        ref={preRef} 
        className="code-display"
        style={{ color: textColor, backgroundColor: backgroundColor }}
      />
      <textarea
        ref={textareaRef}
        value={code}
        onChange={handleChange}
        className="code-editor"
        spellCheck="false"
        style={{ caretColor: textColor }}
      />
    </div>
  );
};

export default InterviewEditor; 