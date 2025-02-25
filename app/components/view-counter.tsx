"use client";

import { useEffect, useState, ReactNode } from "react";
import { incrementViewCount, getViewCount } from "../lib/supabase";
import { IoEyeOutline, IoLeaf, IoMoon, IoSunny } from "react-icons/io5";

export default function ViewCounter() {
  const [viewCount, setViewCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIcon, setCurrentIcon] = useState<ReactNode>(null);

  useEffect(() => {
    // Determine which icon to show based on time of day
    const updateTimeBasedIcon = () => {
      const currentHour = new Date().getHours();
      // Morning to evening (6 AM to 6 PM) - Sun icon
      // Night (6 PM to 6 AM) - Moon icon
      if (currentHour >= 6 && currentHour < 18) {
        setCurrentIcon(<IoSunny className="text-white mr-3" />);
      } else {
        setCurrentIcon(<IoMoon className="text-white mr-3" />);
      }
    };

    // Set icon initially
    updateTimeBasedIcon();

    // Update icon every hour
    const intervalId = setInterval(updateTimeBasedIcon, 3600000); // 1 hour in milliseconds

    return () => clearInterval(intervalId);
  }, []);

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
    <div className="color-changing-pill flex items-center justify-center w-full max-w-[140px] px-3 py-1.5 rounded-full text-sm">
      {currentIcon}
      <span className="font-medium text-white">
        {viewCount?.toLocaleString()} views
      </span>
      <style jsx>{`
        .color-changing-pill {
          background: linear-gradient(
            270deg,
            #0a0a0a,
            #1a1a1a,
            #2a2a2a,
            #3a3a3a,
            #4a4a4a,
            #5a5a5a,
            #6a6a6a,
            #7a7a7a,
            #6a6a6a,
            #5a5a5a,
            #4a4a4a,
            #3a3a3a,
            #2a2a2a,
            #1a1a1a,
            #0a0a0a
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
