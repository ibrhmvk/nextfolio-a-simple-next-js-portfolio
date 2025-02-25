'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { FiCopy, FiRefreshCw, FiUsers, FiCode } from 'react-icons/fi';
import { useRouter } from 'next/navigation';

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
  { id: 'plaintext', name: 'Plain Text' },
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
          await supabase
            .from('collaborative_documents')
            .insert([
              { session_id: sessionId, content: initialCode, language: initialLanguage }
            ]);
          lastSavedCodeRef.current = initialCode;
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
    router.push(`/playground/${newSessionId}`);
  };
  
  if (isLoading) {
    return (
      <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden p-8 text-center">
        <p>Loading editor...</p>
      </div>
    );
  }
  
  return (
    <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
      <div className="bg-neutral-100 dark:bg-neutral-900 p-3 flex justify-between items-center">
        <div className="text-sm font-mono flex items-center">
          <div className="flex items-center mr-4">
            <FiCode className="mr-2 text-neutral-500 dark:text-neutral-400" />
            <select
              value={language}
              onChange={handleLanguageChange}
              className="bg-transparent border border-neutral-300 dark:border-neutral-700 rounded px-2 py-1 text-sm"
              disabled={isChangingLanguage}
            >
              {supportedLanguages.map(lang => (
                <option key={lang.id} value={lang.id}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center text-neutral-500 dark:text-neutral-400">
            <FiUsers className="mr-1" />
            <span>{activeUsers.length} active</span>
            {isSaving && <span className="ml-3 text-xs">Saving...</span>}
            {isResetting && <span className="ml-3 text-xs">Resetting...</span>}
            {isChangingLanguage && <span className="ml-3 text-xs">Changing language...</span>}
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleResetCode}
            className="p-2 text-sm rounded hover:bg-neutral-200 dark:hover:bg-neutral-800"
            title="Reset code"
            disabled={isResetting}
          >
            <FiRefreshCw className={isResetting ? "animate-spin" : ""} />
          </button>
          <button
            onClick={handleCopy}
            className="p-2 text-sm rounded hover:bg-neutral-200 dark:hover:bg-neutral-800"
            title="Copy code"
          >
            {isCopied ? 'Copied!' : <FiCopy />}
          </button>
        </div>
      </div>

      <div className="relative">
        {/* Code editor */}
        <textarea
          ref={textareaRef}
          value={code}
          onChange={handleCodeChange}
          onSelect={handleCursorPositionChange}
          onKeyUp={handleCursorPositionChange}
          onMouseUp={handleCursorPositionChange}
          className={`w-full h-[70vh] p-4 font-mono text-sm bg-neutral-50 dark:bg-neutral-900 focus:outline-none resize-none ${language === 'python' ? 'language-python' : language === 'javascript' ? 'language-javascript' : ''}`}
          spellCheck="false"
        />
        
        {/* User cursors would be rendered here in a production app */}
        {/* This is a simplified version */}
      </div>
      
      <div className="bg-neutral-100 dark:bg-neutral-900 p-3 text-xs text-neutral-500 dark:text-neutral-400 flex justify-between items-center">
        <p>Session ID: {sessionId} • Share this URL with others to code together</p>
        <button
          onClick={handleNewSession}
          className="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Create New Session
        </button>
      </div>
    </div>
  );
} 