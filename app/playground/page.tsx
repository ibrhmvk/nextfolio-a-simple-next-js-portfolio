'use client';

import { useRouter } from 'next/navigation';
import { FiCode, FiShare2 } from 'react-icons/fi';

export default function PlaygroundPage() {
  const router = useRouter();
  
  const createNewSession = () => {
    const newSessionId = Math.random().toString(36).substring(2, 10);
    router.push(`/playground/${newSessionId}`);
  };
  

  return (
    <section className="max-w-4xl mx-auto py-12">
      <h1 className="font-bold text-3xl mb-4">Collaborative Code Editor</h1>
      <p className="text-lg mb-8">
        Code together with others in real-time, just like Google Docs but for coding.
        Create a new session or join an existing one by sharing the URL.
      </p>

      <div className="grid gap-8 mb-12">
        <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg p-6">
          <div className="flex items-start mb-4">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg mr-4">
              <FiCode className="text-blue-600 dark:text-blue-400 text-xl" />
            </div>
            <div>
              <h2 className="font-semibold text-xl mb-2">Start a New Coding Session</h2>
              <p className="text-neutral-700 dark:text-neutral-300 mb-4">
                Create a new collaborative coding environment and invite others to join.
              </p>
              <button
                onClick={createNewSession}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <FiCode className="mr-2" />
                Create New Session
              </button>
            </div>
          </div>
        </div>

        {/* <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg p-6">
          <div className="flex items-start mb-4">
            <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-lg mr-4">
              <FiUsers className="text-purple-600 dark:text-purple-400 text-xl" />
            </div>
            <div>
              <h2 className="font-semibold text-xl mb-2">Join an Existing Session</h2>
              <p className="text-neutral-700 dark:text-neutral-300 mb-4">
                Have a session ID? Enter it below to join an existing collaborative session.
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  placeholder="Enter session ID"
                  className="px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={sessionId}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                />
                <button
                  onClick={joinSession}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                >
                  Join Session
                </button>
              </div>
            </div>
          </div>
        </div> */}

        <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg p-6">
          <div className="flex items-start">
            <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg mr-4">
              <FiShare2 className="text-green-600 dark:text-green-400 text-xl" />
            </div>
            <div>
              <h2 className="font-semibold text-xl mb-2">How It Works</h2>
              <ul className="list-disc pl-5 space-y-2 text-neutral-700 dark:text-neutral-300">
                <li>Create a new session or join an existing one</li>
                <li>Share the URL with others to collaborate in real-time</li>
                <li>See who's currently editing with you</li>
                <li>All changes are synchronized instantly</li>
                <li>Your code is saved automatically</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 