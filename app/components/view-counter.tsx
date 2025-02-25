"use client";

import { useEffect, useState } from "react";
import { incrementViewCount, getViewCount } from "../lib/supabase";

export default function ViewCounter() {
  const [viewCount, setViewCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const updateViewCount = async () => {
      try {
        setIsLoading(true);
        // Only increment view count if this is a new session
        if (!sessionStorage.getItem("viewCounted")) {
          const newCount = await incrementViewCount();
          if (newCount !== null) {
            setViewCount(newCount);
            // Mark this session as counted
            sessionStorage.setItem("viewCounted", "true");
          } else {
            // If increment fails, just get the current count
            const count = await getViewCount();
            setViewCount(count);
          }
        } else {
          // If already counted in this session, just get the current count
          const count = await getViewCount();
          setViewCount(count);
        }
      } catch (err) {
        console.error("Error updating view count:", err);
        setError("Failed to update view count");
      } finally {
        setIsLoading(false);
      }
    };

    updateViewCount();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full max-w-[50px]">
        <div className="animate-spin h-4 w-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>
      </div>
    );
  }

  if (error) {
    return null; // Don't show anything if there's an error
  }

  return (
    <div className="flex items-center space-x-2">
      <span className="font-medium text-gray-700 dark:text-gray-200">
        {viewCount?.toLocaleString()} {viewCount === 1 ? "view" : "views"}
      </span>
    </div>
  );
}
