'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { FiCopy, FiRefreshCw, FiCode, FiShare2 } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

// Import CodeHighlight component with dynamic import to avoid SSR issues with Prism
const CodeHighlight = dynamic(() => import('./code-highlight'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-[50vh] sm:h-[70vh] p-2 sm:p-4 font-mono text-xs sm:text-sm bg-neutral-800 text-neutral-300 rounded-md">
      Loading editor...
    </div>
  )
});

interface CollaborativeEditorProps {
  sessionId: string;
  language: string;
  initialCode?: string;
}

// Language templates
const languageTemplates = {
  javascript: '// JavaScript code\n// Start coding here...\n\nfunction example() {\n  console.log("Hello, world!");\n  return true;\n}\n',
  python: '# Python code\n# Start coding here...\n\ndef example():\n    print("Hello, world!")\n    return True\n',
  plaintext: '// Start coding here...',
};

// Supported languages
const supportedLanguages = [
  { id: 'javascript', name: 'JavaScript' },
  { id: 'python', name: 'Python' },
];

export default function CollaborativeEditor({
  sessionId,
  language: initialLanguage = 'plaintext',
  initialCode = '// Start coding here...',
}: CollaborativeEditorProps) {
  const [code, setCode] = useState(initialCode);
  const [language, setLanguage] = useState(initialLanguage);
  const [isCopied, setIsCopied] = useState(false);
  const [isUrlCopied, setIsUrlCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isChangingLanguage, setIsChangingLanguage] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();
  
  // Initialize with appropriate template based on language
  useEffect(() => {
    const templateCode = languageTemplates[initialLanguage as keyof typeof languageTemplates] || initialCode;
    setCode(templateCode);
  }, [initialCode, initialLanguage]);
  
  // Handle language change
  const handleLanguageChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLanguage = e.target.value;
    setIsChangingLanguage(true);
    setLanguage(newLanguage);
    
    // If the code is empty or just the default template, replace it with the new language template
    const isDefaultOrEmpty = 
      code === '// Start coding here...' || 
      code === languageTemplates.plaintext ||
      code === languageTemplates.javascript ||
      code === languageTemplates.python ||
      code.trim() === '';
    
    if (isDefaultOrEmpty) {
      const newCode = languageTemplates[newLanguage as keyof typeof languageTemplates] || languageTemplates.plaintext;
      setCode(newCode);
    } else {
      // Just save the new language to the database
      setCode(code);
    }
  };
  
  // Copy code to clipboard
  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };
  
  // Share session by copying URL to clipboard
  const handleShareSession = async () => {
    const url = window.location.href;
    await navigator.clipboard.writeText(url);
    setIsUrlCopied(true);
    setTimeout(() => setIsUrlCopied(false), 2000);
  };
  
  // Reset the current session's code
  const handleResetCode = async () => {
    const defaultCode = languageTemplates[language as keyof typeof languageTemplates] || languageTemplates.plaintext;
    setIsResetting(true);
    
    try {
      // Update local state
      setCode(defaultCode);
      console.log('Document reset successfully');
    } catch (err) {
      console.error('Error resetting document:', err);
    } finally {
      setIsResetting(false);
    }
  };
  
  // Handle code changes
  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCode(e.target.value);
  };
  
  if (isLoading) {
    return (
      <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden p-8 text-center">
        <p>Loading editor...</p>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col w-full">
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-start sm:items-center justify-between mb-2 sm:mb-4">
        <div className="flex items-center gap-2 text-xs sm:text-sm">
          <div className="flex items-center">
            <label htmlFor="language-select" className="mr-2 text-xs sm:text-sm whitespace-nowrap">Language:</label>
            <div className="relative">
              <select
                id="language-select"
                value={language}
                onChange={handleLanguageChange}
                className="appearance-none pl-3 pr-8 py-1 sm:py-2 text-xs sm:text-sm border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-800 dark:text-white focus:outline-none"
                disabled={isChangingLanguage}
              >
                {supportedLanguages.map((lang) => (
                  <option key={lang.id} value={lang.id}>
                    {lang.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-neutral-800 dark:text-white">
                <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 sm:gap-3 text-xs sm:text-sm">
          <button
            onClick={handleCopy}
            className="inline-flex items-center px-2 py-1 sm:px-3 sm:py-1.5 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-md transition-colors"
            disabled={isCopied}
          >
            <FiCopy className="mr-1" />
            {isCopied ? 'Copied!' : 'Copy'}
          </button>
          
          <button
            onClick={handleResetCode}
            className="inline-flex items-center px-2 py-1 sm:px-3 sm:py-1.5 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-md transition-colors"
            disabled={isResetting}
          >
            <FiRefreshCw className={`mr-1 ${isResetting ? 'animate-spin' : ''}`} />
            Reset
          </button>
          
          <button
            onClick={handleShareSession}
            className="inline-flex items-center px-2 py-1 sm:px-3 sm:py-1.5 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-800/40 text-blue-700 dark:text-blue-300 rounded-md transition-colors"
          >
            <FiShare2 className="mr-1" />
            {isUrlCopied ? 'Copied!' : 'Share Session'}
          </button>
        </div>
      </div>
      
      <div className="relative border border-neutral-300 dark:border-neutral-700 rounded-md overflow-hidden">
        <textarea
          ref={textareaRef}
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
          }}
          className="absolute opacity-0 top-0 left-0 h-full w-full resize-none outline-none"
          placeholder="Start coding here..."
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
        />
        <div className="w-full h-[50vh] sm:h-[70vh] overflow-hidden">
          <CodeHighlight 
            code={code} 
            language={language}
            textareaRef={textareaRef as React.RefObject<HTMLTextAreaElement>}
            onChange={handleCodeChange}
          />
        </div>
      </div>
    </div>
  );
} 