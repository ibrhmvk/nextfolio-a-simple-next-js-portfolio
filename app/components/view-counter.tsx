"use client";

import { useEffect, useState } from "react";
import { FaBitcoin } from "react-icons/fa";

// Function to get Bitcoin price - moved from supabase.ts
async function getBitcoinPrice() {
  try {
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd');
    
    if (!response.ok) {
      throw new Error('Failed to fetch Bitcoin price');
    }
    
    const data = await response.json();
    return data.bitcoin.usd;
  } catch (error) {
    console.error('Error fetching Bitcoin price:', error);
    return null;
  }
}

export default function BitcoinPrice() {
  const [bitcoinPrice, setBitcoinPrice] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Handle Bitcoin price
  useEffect(() => {
    let isMounted = true;

    const fetchBitcoinPrice = async () => {
      try {
        // Try to get cached price from sessionStorage
        if (typeof window !== 'undefined') {
          const cached = window.sessionStorage.getItem("bitcoinPrice");
          const cacheTime = window.sessionStorage.getItem("bitcoinPriceTime");
          
          // Check if cache is less than 5 minutes old
          if (cached && cacheTime && isMounted) {
            const now = Date.now();
            const cacheAge = now - parseInt(cacheTime, 10);
            if (cacheAge < 5 * 60 * 1000) { // 5 minutes
              setBitcoinPrice(parseFloat(cached));
              setIsLoading(false);
              return;
            }
          }

          // Fetch fresh price
          const price = await getBitcoinPrice();
          if (price !== null && isMounted) {
            setBitcoinPrice(price);
            window.sessionStorage.setItem("bitcoinPrice", price.toString());
            window.sessionStorage.setItem("bitcoinPriceTime", Date.now().toString());
          }
        }
      } catch (err) {
        console.error("Error fetching Bitcoin price:", err);
        if (isMounted) {
          setError("Failed to fetch Bitcoin price");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchBitcoinPrice();
    
    // Refresh price every 5 minutes
    const intervalId = setInterval(fetchBitcoinPrice, 5 * 60 * 1000);
    
    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  if (error) {
    return null;
  }

  return (
    <div className="color-changing-pill flex items-center justify-center w-full max-w-[140px] px-3 py-1.5 rounded-full text-sm">
      <FaBitcoin className="text-white mr-2 text-lg" />
      <span className="font-medium text-white">
        {isLoading && !bitcoinPrice ? (
          <span className="opacity-60">$--,---</span>
        ) : (
          `$${bitcoinPrice?.toLocaleString()}`
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
