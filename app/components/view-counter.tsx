"use client";

import { useEffect, useState, ReactNode } from "react";
import { incrementViewCount, getViewCount } from "../lib/supabase";
import { IoEyeOutline, IoLeaf, IoMoon, IoSunny } from "react-icons/io5";

export default function ViewCounter() {
  const [viewCount, setViewCount] = useState<number | null>(() => {
    // Try to get cached count from sessionStorage on initial render
    const cached = sessionStorage.getItem("viewCount");
    return cached ? parseInt(cached, 10) : null;
  });
  const [isLoading, setIsLoading] = useState(!viewCount);
  const [error, setError] = useState<string | null>(null);
  const [currentIcon, setCurrentIcon] = useState<ReactNode>(() => {
    // Set initial icon based on time of day
    const currentHour = new Date().getHours();
    return currentHour >= 6 && currentHour < 18 ? 
      <IoSunny className="text-white mr-3" /> : 
      <IoMoon className="text-white mr-3" />;
  });

  useEffect(() => {
    // Update icon every hour
    const updateTimeBasedIcon = () => {
      const currentHour = new Date().getHours();
      if (currentHour >= 6 && currentHour < 18) {
        setCurrentIcon(<IoSunny className="text-white mr-3" />);
      } else {
        setCurrentIcon(<IoMoon className="text-white mr-3" />);
      }
    };

    const intervalId = setInterval(updateTimeBasedIcon, 3600000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const updateViewCount = async () => {
      try {
        // If we haven't counted this session yet
        if (!sessionStorage.getItem("viewCounted")) {
          const newCount = await incrementViewCount();
          if (newCount !== null) {
            setViewCount(newCount);
            sessionStorage.setItem("viewCount", newCount.toString());
            sessionStorage.setItem("viewCounted", "true");
          }
        } else {
          // Just get the latest count without incrementing
          const count = await getViewCount();
          if (count !== null) {
            setViewCount(count);
            sessionStorage.setItem("viewCount", count.toString());
          }
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

  if (error) {
    return null;
  }

  return (
    <div className="color-changing-pill flex items-center justify-center w-full max-w-[140px] px-3 py-1.5 rounded-full text-sm">
      {currentIcon}
      <span className="font-medium text-white">
        {isLoading && !viewCount ? (
          <span className="opacity-60">-- views</span>
        ) : (
          `${viewCount?.toLocaleString()} views`
        )}
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
