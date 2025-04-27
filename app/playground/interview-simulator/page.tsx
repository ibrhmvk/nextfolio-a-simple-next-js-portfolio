'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiMic, FiMicOff, FiPlay, FiPause, FiRefreshCw, FiClock } from 'react-icons/fi';
import dynamic from 'next/dynamic';

// Dynamically import our custom editor component to avoid SSR issues
const InterviewEditor = dynamic(() => import('../../components/interview-editor'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[50vh] p-4 font-mono text-sm bg-neutral-800 text-neutral-300 rounded-md">
      Loading editor...
    </div>
  )
});

interface InterviewProblem {
  id: string;
  title: string;
  difficulty: string;
  description: string;
  example: string;
  codeTemplate: string;
  expectedOutput: string;
  hints: string[];
}

// Sample interview problems
const interviewProblems: InterviewProblem[] = [
  {
    id: 'problem1',
    title: 'Two Sum',
    difficulty: 'Easy',
    description: 'Given an array of integers and a target sum, return the indices of two numbers that add up to the target.',
    example: 'Input: nums = [2,7,11,15], target = 9\nOutput: [0,1]\nExplanation: Because nums[0] + nums[1] = 2 + 7 = 9',
    codeTemplate: '/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nfunction twoSum(nums, target) {\n  // Your code here\n  \n}\n',
    expectedOutput: '[0,1]',
    hints: [
      'Try using a hash map to store numbers you\'ve seen',
      'For each number, check if its complement (target - num) exists in the map',
      'Time complexity should be O(n) with a single pass through the array'
    ]
  },
  {
    id: 'problem2',
    title: 'Valid Parentheses',
    difficulty: 'Easy',
    description: 'Given a string containing just the characters \'(\', \')\', \'{\', \'}\', \'[\' and \']\', determine if the input string is valid.\nA string is valid if opening brackets are closed by the same type of brackets and in the correct order.',
    example: 'Input: s = "()[]{}"\nOutput: true\n\nInput: s = "([)]"\nOutput: false',
    codeTemplate: '/**\n * @param {string} s\n * @return {boolean}\n */\nfunction isValid(s) {\n  // Your code here\n  \n}\n',
    expectedOutput: 'true',
    hints: [
      'Try using a stack data structure',
      'When you see an opening bracket, push it onto the stack',
      'When you see a closing bracket, check if it matches the most recent opening bracket'
    ]
  },
  {
    id: 'problem3',
    title: 'Maximum Subarray',
    difficulty: 'Medium',
    description: 'Given an integer array, find the contiguous subarray with the largest sum and return the sum.',
    example: 'Input: nums = [-2,1,-3,4,-1,2,1,-5,4]\nOutput: 6\nExplanation: The subarray [4,-1,2,1] has the largest sum = 6.',
    codeTemplate: '/**\n * @param {number[]} nums\n * @return {number}\n */\nfunction maxSubArray(nums) {\n  // Your code here\n  \n}\n',
    expectedOutput: '6',
    hints: [
      'Consider using Kadane\'s algorithm',
      'Keep track of the current sum and the maximum sum so far',
      'If current sum becomes negative, reset it to 0'
    ]
  }
];

// Type for SpeechRecognition
interface CustomWindow extends Window {
  webkitSpeechRecognition: any;
  SpeechRecognition: any;
}

export default function InterviewSimulatorPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProblem, setSelectedProblem] = useState<InterviewProblem | null>(null);
  const [code, setCode] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [difficulty, setDifficulty] = useState('all');
  const [transcript, setTranscript] = useState('');
  const [speechFeedback, setSpeechFeedback] = useState('');
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any>(null);
  
  // Initialize problem when selected
  useEffect(() => {
    if (selectedProblem) {
      setCode(selectedProblem.codeTemplate);
      resetTimer();
    }
  }, [selectedProblem]);
  
  // Timer functionality
  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isTimerRunning]);
  
  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 
        ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const customWindow = window as unknown as CustomWindow;
      const SpeechRecognition = customWindow.webkitSpeechRecognition || customWindow.SpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      
      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        
        setTranscript(prev => prev + finalTranscript + ' ');
      };
      
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsRecording(false);
      };
      
      recognitionRef.current = recognition;
    }
  }, []);
  
  const startRecording = () => {
    if (recognitionRef.current && !isRecording) {
      recognitionRef.current.start();
      setIsRecording(true);
      
      if (!isTimerRunning) {
        setIsTimerRunning(true);
      }
    }
  };
  
  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };
  
  const resetTimer = () => {
    setTimer(0);
    setIsTimerRunning(false);
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
  };
  
  const submitSolution = () => {
    // In a real implementation, this would send the code to an API for evaluation
    // For now, we'll just provide mock feedback
    setIsTimerRunning(false);
    stopRecording();
    
    // Mock feedback based on the problem
    if (selectedProblem) {
      // Simple check if solution might be correct (this is just a mock)
      const mightBeCorrect = code.includes('return') && 
                             !code.includes('// Your code here') &&
                             code.length > selectedProblem.codeTemplate.length;
      
      if (mightBeCorrect) {
        setFeedback("Good attempt! Your solution looks promising. In a real implementation, we would run tests to verify correctness.");
      } else {
        setFeedback("Your solution may not be complete. Make sure you've implemented the core functionality.");
      }
      
      // Simulate speech analysis feedback
      const speechAnalysis = analyzeSpeech(transcript);
      setSpeechFeedback(speechAnalysis);
    }
  };
  
  const analyzeSpeech = (speechText: string) => {
    // This is a mock analysis - in a real implementation this would use NLP/AI
    if (speechText.length < 50) {
      return "You should try to explain your thought process more thoroughly. Interviewers want to hear your reasoning.";
    } else if (speechText.includes("time complexity") || speechText.includes("space complexity")) {
      return "Great job discussing the time and space complexity of your solution. This shows good analytical thinking.";
    } else if (speechText.includes("test") || speechText.includes("edge case")) {
      return "Good job considering test cases and edge conditions. This demonstrates attention to detail.";
    } else {
      return "Your explanation was decent, but try to clearly articulate your approach, the time/space complexity, and any trade-offs or optimizations.";
    }
  };
  
  const filteredProblems = difficulty === 'all' 
    ? interviewProblems 
    : interviewProblems.filter(p => p.difficulty.toLowerCase() === difficulty.toLowerCase());
  
  return (
    <section className="w-full mx-auto py-2 sm:py-4">
      <div className="mb-3 sm:mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
        <div>
          <Link 
            href="/playground" 
            className="inline-flex items-center text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 mb-1 sm:mb-2"
          >
            <FiArrowLeft className="mr-1" /> Back to Playground
          </Link>
          <h1 className="font-bold text-xl sm:text-2xl">Coding Interview Voice Simulator</h1>
        </div>
      </div>
      
      {!selectedProblem ? (
        // Problem selection screen
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 mb-4">
            <label htmlFor="difficulty" className="text-sm text-neutral-600 dark:text-neutral-400">
              Difficulty:
            </label>
            <select 
              id="difficulty"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="px-3 py-1.5 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredProblems.map(problem => (
              <div 
                key={problem.id}
                className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black/10 rounded-lg p-4 cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition"
                onClick={() => setSelectedProblem(problem)}
              >
                <div className="flex justify-between">
                  <h2 className="font-semibold text-lg">{problem.title}</h2>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    problem.difficulty === 'Easy' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                    problem.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                    'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {problem.difficulty}
                  </span>
                </div>
                <p className="text-neutral-600 dark:text-neutral-400 text-sm mt-2 line-clamp-2">
                  {problem.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        // Interview simulator
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
            <h2 className="font-semibold text-lg">
              {selectedProblem.title}
              <span className={`ml-2 text-xs px-2 py-1 rounded-full ${
                selectedProblem.difficulty === 'Easy' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                selectedProblem.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              }`}>
                {selectedProblem.difficulty}
              </span>
            </h2>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setIsTimerRunning(!isTimerRunning);
                  if (!isTimerRunning && isRecording) {
                    // If resuming timer and was recording, resume recording too
                    startRecording();
                  }
                }}
                className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                title={isTimerRunning ? "Pause timer" : "Start timer"}
              >
                {isTimerRunning ? <FiPause /> : <FiPlay />}
              </button>
              
              <button
                onClick={resetTimer}
                className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                title="Reset timer"
              >
                <FiRefreshCw />
              </button>
              
              <div className="flex items-center gap-1 px-2 py-1 bg-neutral-100 dark:bg-neutral-800 rounded">
                <FiClock className="text-neutral-600 dark:text-neutral-400" />
                <span className="text-sm font-mono">{formatTime(timer)}</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Problem description */}
            <div className="flex flex-col gap-2">
              <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4">
                <h3 className="font-semibold mb-2">Problem Description</h3>
                <p className="text-neutral-600 dark:text-neutral-400 text-sm whitespace-pre-line">
                  {selectedProblem.description}
                </p>
                
                <h4 className="font-semibold mt-4 mb-2">Example</h4>
                <pre className="bg-neutral-100 dark:bg-neutral-800 p-3 rounded text-xs overflow-auto">
                  {selectedProblem.example}
                </pre>
                
                <div className="mt-4">
                  <details className="text-sm">
                    <summary className="font-semibold cursor-pointer text-blue-600 dark:text-blue-400">Need a hint?</summary>
                    <ul className="mt-2 pl-4 list-disc space-y-1">
                      {selectedProblem.hints.map((hint, index) => (
                        <li key={index} className="text-neutral-600 dark:text-neutral-400">{hint}</li>
                      ))}
                    </ul>
                  </details>
                </div>
              </div>
              
              {/* Voice recording */}
              <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold">Voice Recording</h3>
                  <div>
                    <button
                      onClick={isRecording ? stopRecording : startRecording}
                      className={`p-2 rounded-full ${isRecording ? 
                        'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400' : 
                        'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'}`}
                    >
                      {isRecording ? <FiMicOff /> : <FiMic />}
                    </button>
                  </div>
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-500 mb-2">
                  {isRecording 
                    ? "Recording... Explain your approach as you code." 
                    : "Click the microphone icon to start recording your explanation."}
                </p>
                <div className="bg-neutral-100 dark:bg-neutral-800 p-3 rounded-lg min-h-[100px] max-h-[150px] overflow-y-auto">
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    {transcript || "Your speech transcript will appear here."}
                  </p>
                </div>
              </div>
              
              {/* Feedback (only shown after submission) */}
              {feedback && (
                <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Code Feedback</h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    {feedback}
                  </p>
                  
                  {speechFeedback && (
                    <>
                      <h3 className="font-semibold mt-4 mb-2">Communication Feedback</h3>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        {speechFeedback}
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>
            
            {/* Code editor */}
            <div className="flex flex-col gap-2">
              <div className="rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-800">
                <InterviewEditor 
                  code={code}
                  language="javascript"
                  onChange={handleCodeChange}
                />
              </div>
              
              <div className="flex justify-between">
                <button
                  onClick={() => {
                    setSelectedProblem(null);
                    setCode('');
                    setFeedback('');
                    setSpeechFeedback('');
                    setTranscript('');
                    resetTimer();
                  }}
                  className="px-4 py-2 border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                >
                  Select Different Problem
                </button>
                
                <button
                  onClick={submitSolution}
                  className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition"
                >
                  Submit Solution
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
} 