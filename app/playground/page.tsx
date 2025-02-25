'use client';

import { useRouter } from 'next/navigation';
import { FiCode, FiShare2, FiUsers, FiRefreshCw, FiSave } from 'react-icons/fi';

export default function PlaygroundPage() {
  const router = useRouter();
  
  const createNewSession = () => {
    const newSessionId = Math.random().toString(36).substring(2, 10);
    router.push(`/playground/${newSessionId}`);
  };
  
  return (
    <section>
      <h1 className="text-3xl md:text-4xl font-bold mb-4">Collaborative Code Editor</h1>
      <p className="text-neutral-600 dark:text-neutral-400 text-lg mb-10">
        Code together with others in real-time, just like Google Docs but for coding.
        Create a new session or join an existing one by sharing the URL.
      </p>

      <div className="grid gap-8 mb-12">
        <div className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black/10 rounded-lg p-6">
          <div className="flex items-start gap-5">
            {/* <div className="bg-neutral-100 dark:bg-neutral-800 p-3 rounded-lg">
              <FiCode className="text-neutral-500 dark:text-neutral-400 text-xl" />
            </div> */}
            <div className="flex-1">
              <h2 className="font-semibold text-xl mb-2">Start a New Coding Session</h2>
              <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                Create a new collaborative coding environment and invite others to join.
                Your session will have a unique URL that you can share.
              </p>
              <button
                onClick={createNewSession}
                className="inline-flex items-center px-4 py-2 bg-neutral-800 dark:bg-neutral-700 text-white rounded-lg hover:bg-neutral-700 dark:hover:bg-neutral-600 transition"
              >
                <FiCode className="mr-2" />
                Create New Session
              </button>
            </div>
          </div>
        </div>

        <div className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black/10 rounded-lg p-6">
          <div className="flex items-start gap-5">
            {/* <div className="bg-neutral-100 dark:bg-neutral-800 p-3 rounded-lg">
              <FiShare2 className="text-neutral-500 dark:text-neutral-400 text-xl" />
            </div> */}
            <div className="flex-1">
              <h2 className="font-semibold text-xl mb-4">How It Works</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <div className="text-neutral-500 dark:text-neutral-400">
                    <FiUsers className="text-lg" />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-neutral-700 dark:text-neutral-300">Collaborate</h3>
                    <p className="text-neutral-600 dark:text-neutral-500 text-sm">
                      Share the URL with others to code together in real-time
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="text-neutral-500 dark:text-neutral-400">
                    <FiRefreshCw className="text-lg" />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-neutral-700 dark:text-neutral-300">Instant Sync</h3>
                    <p className="text-neutral-600 dark:text-neutral-500 text-sm">
                      All changes are synchronized instantly across all users
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="text-neutral-500 dark:text-neutral-400">
                    <FiSave className="text-lg" />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-neutral-700 dark:text-neutral-300">Auto-Save</h3>
                    <p className="text-neutral-600 dark:text-neutral-500 text-sm">
                      Your code is automatically saved as you type
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="text-neutral-500 dark:text-neutral-400">
                    <FiCode className="text-lg" />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-neutral-700 dark:text-neutral-300">Syntax Highlighting</h3>
                    <p className="text-neutral-600 dark:text-neutral-500 text-sm">
                      Support for multiple programming languages
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 