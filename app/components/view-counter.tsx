"use client";

import { useEffect, useState } from "react";
import { incrementViewCount, getViewCount } from "../lib/supabase";
import { IoEyeOutline, IoLeaf, IoMoon, IoSunny } from "react-icons/io5";

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
      <div className="flex items-center justify-center w-full max-w-[120px]">
        <div className="animate-pulse h-8 w-full rounded-full bg-gray-800/30 dark:bg-gray-700/30"></div>
      </div>
    );
  }

  if (error) {
    return null; // Don't show anything if there's an error
  }

  return (
    <div className="color-changing-pill flex items-center justify-center w-full max-w-[140px] px-4 py-2 rounded-full text-sm">
      <IoSunny className="text-white mr-3" />
      <span className="font-medium text-white">
        {viewCount?.toLocaleString()} views
      </span>
      <style jsx>{`
        .color-changing-pill {
          background: linear-gradient(
            270deg,
            #1e2533,
            #2a3a5a,
            #364b7a,
            #4a5d8f,
            #5e6fa4,
            #7281b9,
            #8693ce,
            #9aa5e3,
            #8693ce,
            #7281b9,
            #5e6fa4,
            #4a5d8f,
            #364b7a,
            #2a3a5a,
            #1e2533
          );
          background-size: 300% 300%;
          animation: gradient 15s ease infinite;
        }
        
        @keyframes gradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>
    </div>
  );
}
