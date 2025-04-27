"use client";

import { useEffect, useState, ReactNode } from "react";
import { incrementViewCount, getViewCount } from "../lib/supabase";
import { IoMoon, IoSunny } from "react-icons/io5";

export default function ViewCounter() {
  const [viewCount, setViewCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIcon, setCurrentIcon] = useState<ReactNode>(null);

  // Set initial icon and update it hourly
  useEffect(() => {
    const updateTimeBasedIcon = () => {
      const currentHour = new Date().getHours();
      setCurrentIcon(
        currentHour >= 6 && currentHour < 18 
          ? <IoSunny className="text-white mr-3" />
          : <IoMoon className="text-white mr-3" />
      );
    };

    updateTimeBasedIcon();
    const intervalId = setInterval(updateTimeBasedIcon, 3600000);
    return () => clearInterval(intervalId);
  }, []);

  // Handle view count
  useEffect(() => {
    let isMounted = true;

    const fetchViewCount = async () => {
      try {
        // Try to get cached count from sessionStorage
        if (typeof window !== 'undefined') {
          const cached = window.sessionStorage.getItem("viewCount");
          const hasViewedThisSession = window.sessionStorage.getItem("viewCounted");
          
          if (cached && isMounted) {
            setViewCount(parseInt(cached, 10));
            setIsLoading(false);
          }

          if (!hasViewedThisSession) {
            const newCount = await incrementViewCount();
            if (newCount !== null && isMounted) {
              setViewCount(newCount);
              window.sessionStorage.setItem("viewCount", newCount.toString());
              window.sessionStorage.setItem("viewCounted", "true");
            }
          } else {
            const count = await getViewCount();
            if (count !== null && isMounted) {
              setViewCount(count);
              window.sessionStorage.setItem("viewCount", count.toString());
            }
          }
        }
      } catch (err) {
        console.error("Error updating view count:", err);
        if (isMounted) {
          setError("Failed to update view count");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchViewCount();
    return () => {
      isMounted = false;
    };
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
