'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { FiCopy, FiRefreshCw, FiUsers, FiCode } from 'react-icons/fi';
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

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface CollaborativeEditorProps {
  sessionId: string;
  language: string;
  initialCode?: string;
}

interface User {
  id: string;
  lastSeen: number;
  cursorPosition?: number;
}

// Define a more accurate type for the presence state
interface PresenceState {
  [key: string]: {
    presence_ref: string;
    [key: string]: any; // Allow any additional properties
  }[];
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
  const [activeUsers, setActiveUsers] = useState<User[]>([]);
  const [userId, setUserId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isChangingLanguage, setIsChangingLanguage] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedCodeRef = useRef<string>(initialCode);
  const presenceChannelRef = useRef<any>(null);
  const cursorPositionRef = useRef<number | null>(null);
  const presenceUpdateTimerRef = useRef<NodeJS.Timeout | null>(null);
  const activeUsersRef = useRef<User[]>([]);
  const activeUsersUpdateTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Generate a unique user ID on component mount
  useEffect(() => {
    const newUserId = Math.random().toString(36).substring(2, 15);
    setUserId(newUserId);
    
    // Set up initial document if it doesn't exist
    const initializeDocument = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('collaborative_documents')
          .select('content, language')
          .eq('session_id', sessionId)
          .single();
        
        if (error) {
          console.log('Creating new document:', sessionId);
          // Document doesn't exist, create it
          // Use the appropriate template based on initialLanguage
          const templateCode = languageTemplates[initialLanguage as keyof typeof languageTemplates] || initialCode;
          
          await supabase
            .from('collaborative_documents')
            .insert([
              { session_id: sessionId, content: templateCode, language: initialLanguage }
            ]);
          setCode(templateCode);
          lastSavedCodeRef.current = templateCode;
        } else if (data) {
          console.log('Document found:', sessionId);
          // Document exists, use its content and language
          setCode(data.content);
          setLanguage(data.language || initialLanguage);
          lastSavedCodeRef.current = data.content;
        }
      } catch (err) {
        console.error('Error initializing document:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeDocument();
    
    // Clean up function
    return () => {
      // Clear any pending timers
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (presenceUpdateTimerRef.current) {
        clearTimeout(presenceUpdateTimerRef.current);
      }
      if (activeUsersUpdateTimerRef.current) {
        clearTimeout(activeUsersUpdateTimerRef.current);
      }
    };
  }, [sessionId, initialCode, initialLanguage]);
  
  // Debounced save function
  const saveCodeToDatabase = useCallback(async (codeToSave: string, languageToSave?: string) => {
    // Don't save if the code hasn't changed and language is the same
    if (codeToSave === lastSavedCodeRef.current && !languageToSave) {
      return;
    }
    
    setIsSaving(true);
    try {
      const updateData: { content: string; language?: string } = { content: codeToSave };
      
      // Only include language in the update if it's provided
      if (languageToSave) {
        updateData.language = languageToSave;
      }
      
      const { error } = await supabase
        .from('collaborative_documents')
        .update(updateData)
        .eq('session_id', sessionId);
      
      if (error) {
        console.error('Error updating document:', error);
      } else {
        lastSavedCodeRef.current = codeToSave;
      }
    } catch (err) {
      console.error('Error updating document:', err);
    } finally {
      setIsSaving(false);
      if (languageToSave) {
        setIsChangingLanguage(false);
      }
    }
  }, [sessionId]);
  
  // Debounced presence update function
  const updatePresenceDebounced = useCallback(() => {
    if (presenceUpdateTimerRef.current) {
      clearTimeout(presenceUpdateTimerRef.current);
    }
    
    presenceUpdateTimerRef.current = setTimeout(() => {
      if (presenceChannelRef.current && presenceChannelRef.current.state === 'SUBSCRIBED') {
        presenceChannelRef.current.track({
          user_id: userId,
          last_seen: Date.now(),
          cursor_position: cursorPositionRef.current
        }).catch(err => {
          console.error('Error tracking presence:', err);
        });
      }
    }, 1000); // Debounce presence updates by 1 second
  }, [userId]);
  
  // Update active users state in a controlled way
  const updateActiveUsersState = useCallback(() => {
    if (activeUsersUpdateTimerRef.current) {
      clearTimeout(activeUsersUpdateTimerRef.current);
    }
    
    // Only update the state every 3 seconds at most
    activeUsersUpdateTimerRef.current = setTimeout(() => {
      // Only update if the count has actually changed
      if (activeUsers.length !== activeUsersRef.current.length) {
        setActiveUsers([...activeUsersRef.current]);
      }
    }, 3000);
  }, [activeUsers.length]);
  
  // Set up real-time subscription
  useEffect(() => {
    if (!sessionId || !userId) return;
    
    console.log('Setting up realtime subscriptions for session:', sessionId);
    
    // Subscribe to document changes
    const documentChannel = supabase.channel(`document-${sessionId}`);
    
    documentChannel
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'collaborative_documents',
          filter: `session_id=eq.${sessionId}`
        },
        (payload) => {
          // Only update if the content is different from what we have
          // and it's not our own update (to avoid cursor jumping)
          if (payload.new) {
            if (payload.new.content !== code && 
                payload.new.content !== lastSavedCodeRef.current) {
              console.log('Document content updated from remote:', payload);
              setCode(payload.new.content);
              lastSavedCodeRef.current = payload.new.content;
            }
            
            // Update language if it changed
            if (payload.new.language && payload.new.language !== language) {
              console.log('Document language updated from remote:', payload.new.language);
              setLanguage(payload.new.language);
            }
          }
        }
      )
      .subscribe((status) => {
        console.log('Document channel status:', status);
      });
    
    // Subscribe to presence changes
    const presenceChannel = supabase.channel(`presence-${sessionId}`, {
      config: {
        presence: {
          key: userId,
        },
      },
    });
    
    // Store the channel reference for later use
    presenceChannelRef.current = presenceChannel;
    
    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState() as PresenceState;
        
        // Process users with a more stable approach
        const currentTime = Date.now();
        const users: User[] = [];
        
        Object.keys(state).forEach(presenceId => {
          const presenceData = state[presenceId][0];
          // Safely access properties that might not exist
          const userData = {
            id: presenceData.user_id || presenceId,
            lastSeen: presenceData.last_seen || currentTime,
            cursorPosition: presenceData.cursor_position
          };
          
          // Only include users who have been active in the last 30 seconds
          if (currentTime - userData.lastSeen < 30000) {
            users.push(userData);
          }
        });
        
        // Update the ref first
        activeUsersRef.current = users;
        
        // Then trigger the controlled state update
        updateActiveUsersState();
      })
      .subscribe(async (status) => {
        console.log('Presence channel status:', status);
        
        // Only track presence after the channel is subscribed
        if (status === 'SUBSCRIBED') {
          // Initial presence tracking
          await presenceChannel.track({
            user_id: userId,
            last_seen: Date.now(),
            cursor_position: cursorPositionRef.current
          });
          
          console.log('Initial presence tracked');
        }
      });
    
    // Update user presence every 10 seconds, but only if the channel is subscribed
    // This is separate from typing events to keep the active users count stable
    const interval = setInterval(() => {
      if (presenceChannelRef.current && presenceChannelRef.current.state === 'SUBSCRIBED') {
        presenceChannelRef.current.track({
          user_id: userId,
          last_seen: Date.now(),
          cursor_position: cursorPositionRef.current
        }).catch(err => {
          console.error('Error tracking presence:', err);
        });
      }
    }, 10000); // Longer interval for regular updates
    
    // Set initial active users display
    setTimeout(() => {
      if (activeUsersRef.current.length > 0 && activeUsers.length === 0) {
        setActiveUsers([...activeUsersRef.current]);
      }
    }, 2000);
    
    return () => {
      console.log('Cleaning up subscriptions');
      
      // Untrack presence before unsubscribing
      if (presenceChannelRef.current) {
        presenceChannelRef.current.untrack().catch(err => {
          console.error('Error untracking presence:', err);
        });
      }
      
      documentChannel.unsubscribe();
      presenceChannel.unsubscribe();
      clearInterval(interval);
      
      if (presenceUpdateTimerRef.current) {
        clearTimeout(presenceUpdateTimerRef.current);
      }
      if (activeUsersUpdateTimerRef.current) {
        clearTimeout(activeUsersUpdateTimerRef.current);
      }
    };
  }, [sessionId, userId, updateActiveUsersState, code, language]);
  
  // Track cursor position changes
  const handleCursorPositionChange = () => {
    if (textareaRef.current) {
      cursorPositionRef.current = textareaRef.current.selectionStart;
      updatePresenceDebounced();
    }
  };
  
  // Handle code changes with debouncing
  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newCode = e.target.value;
    setCode(newCode);
    
    // Update cursor position reference
    if (textareaRef.current) {
      cursorPositionRef.current = textareaRef.current.selectionStart;
    }
    
    // Debounce the save operation
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    // Save after 500ms of inactivity
    debounceTimerRef.current = setTimeout(() => {
      saveCodeToDatabase(newCode);
      // Update presence after saving
      updatePresenceDebounced();
    }, 500);
  };
  
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
      
      // Save the new language and code to the database
      await saveCodeToDatabase(newCode, newLanguage);
    } else {
      // Just save the new language to the database
      await saveCodeToDatabase(code, newLanguage);
    }
  };
  
  // Copy code to clipboard
  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };
  
  // Reset the current session's code
  const handleResetCode = async () => {
    const defaultCode = languageTemplates[language as keyof typeof languageTemplates] || languageTemplates.plaintext;
    setIsResetting(true);
    
    try {
      // Update the code in the database
      const { error } = await supabase
        .from('collaborative_documents')
        .update({ content: defaultCode })
        .eq('session_id', sessionId);
      
      if (error) {
        console.error('Error resetting document:', error);
      } else {
        // Update local state
        setCode(defaultCode);
        lastSavedCodeRef.current = defaultCode;
        console.log('Document reset successfully');
      }
    } catch (err) {
      console.error('Error resetting document:', err);
    } finally {
      setIsResetting(false);
    }
  };
  
  // Create a new session
  const handleNewSession = () => {
    const newSessionId = Math.random().toString(36).substring(2, 10);
    router.push(`/playground/${newSessionId}?language=javascript`);
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
            <select
              id="language-select"
              value={language}
              onChange={handleLanguageChange}
              className="px-2 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              disabled={isChangingLanguage}
            >
              {supportedLanguages.map((lang) => (
                <option key={lang.id} value={lang.id}>
                  {lang.name}
                </option>
              ))}
            </select>
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
            onClick={handleNewSession}
            className="inline-flex items-center px-2 py-1 sm:px-3 sm:py-1.5 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-800/40 text-blue-700 dark:text-blue-300 rounded-md transition-colors"
          >
            <FiCode className="mr-1" />
            New Session
          </button>
        </div>
      </div>
      
      <div className="flex items-center justify-between mb-2 text-xs sm:text-sm">
        <div className="flex items-center">
          <div className="flex items-center">
            <FiUsers className="text-neutral-500 mr-1" />
            <span className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
              {activeUsers.length} active {activeUsers.length === 1 ? 'user' : 'users'}
            </span>
          </div>
        </div>
        
        <div className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
          {isSaving ? 'Saving...' : 'All changes saved'}
        </div>
      </div>
      
      <div className="relative border border-neutral-300 dark:border-neutral-700 rounded-md overflow-hidden">
        <textarea
          ref={textareaRef}
          value={code}
          onChange={handleCodeChange}
          onKeyDown={(e) => {
            if (e.key === 'Tab') {
              e.preventDefault();
              const start = e.currentTarget.selectionStart;
              const end = e.currentTarget.selectionEnd;
              const newValue = code.substring(0, start) + '  ' + code.substring(end);
              setCode(newValue);
              
              // Set cursor position after the inserted tab
              setTimeout(() => {
                if (textareaRef.current) {
                  textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
                }
              }, 0);
            }
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
            onKeyUp={handleCursorPositionChange}
            onMouseUp={handleCursorPositionChange}
            onSelect={handleCursorPositionChange}
          />
        </div>
      </div>
    </div>
  );
} 