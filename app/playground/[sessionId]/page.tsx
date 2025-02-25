'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import CollaborativeEditor from '../../components/collaborative-editor';
import { FiArrowLeft } from 'react-icons/fi';
import Link from 'next/link';

export default function EditorSessionPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;
  const [language, setLanguage] = useState('javascript');
  
  // List of available languages
  const languages = [
    { id: 'javascript', name: 'JavaScript' },
    { id: 'typescript', name: 'TypeScript' },
    { id: 'html', name: 'HTML' },
    { id: 'css', name: 'CSS' },
    { id: 'python', name: 'Python' },
  ];
  
  return (
    <section className="max-w-5xl mx-auto py-8">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link 
            href="/playground" 
            className="inline-flex items-center text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 mb-2"
          >
            <FiArrowLeft className="mr-1" /> Back to Playground
          </Link>
          <h1 className="font-bold text-2xl">Collaborative Session: {sessionId}</h1>
        </div>
        
        {/* <div className="flex items-center">
          <label htmlFor="language-select" className="mr-2 text-sm">Language:</label>
          <select
            id="language-select"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="px-3 py-1.5 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {languages.map((lang) => (
              <option key={lang.id} value={lang.id}>
                {lang.name}
              </option>
            ))}
          </select>
        </div> */}
      </div>
      
      <CollaborativeEditor 
        sessionId={sessionId} 
        language={language}
      />
      
      <div className="mt-6 text-sm text-neutral-600 dark:text-neutral-400">
        <p>
          Share this URL with others to collaborate in real-time. All changes are automatically saved.
        </p>
      </div>
    </section>
  );
} 