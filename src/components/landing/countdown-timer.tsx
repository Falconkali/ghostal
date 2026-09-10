"use client";

import { useEffect, useState } from "react";

const DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7-day rolling window
const STORAGE_KEY = "ghostal_offer_timer_start";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export default function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    // Get or create a rolling start time persisted in localStorage
    let startTime = parseInt(localStorage.getItem(STORAGE_KEY) || "0", 10);
    const now = Date.now();

    // If no timer exists or it has already expired, reset it to now
    if (!startTime || now - startTime >= DURATION_MS) {
      startTime = now;
      localStorage.setItem(STORAGE_KEY, String(startTime));
    }

    const endTime = startTime + DURATION_MS;

    function calc() {
      const diff = endTime - Date.now();
      if (diff <= 0) {
        // Reset the timer for the next visit cycle
        const newStart = Date.now();
        localStorage.setItem(STORAGE_KEY, String(newStart));
        setExpired(false);
        setTimeLeft({ days: 7, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      setExpired(false);
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    }

    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, []);

  if (expired || !timeLeft) return null;

  const units = [
    { label: "Days", value: timeLeft.days },
    { label: "Hours", value: timeLeft.hours },
    { label: "Mins", value: timeLeft.minutes },
    { label: "Secs", value: timeLeft.seconds },
  ];

  return (
    <div className="flex items-center gap-1.5">
      {units.map((u, i) => (
        <div key={u.label} className="flex items-center gap-1.5">
          <div className="flex flex-col items-center">
            <div className="min-w-[36px] rounded-lg bg-black/40 border border-amber-500/20 px-2 py-1 text-center">
              <span className="text-sm font-bold tabular-nums text-amber-300">
                {pad(u.value)}
              </span>
            </div>
            <span className="mt-0.5 text-[9px] font-semibold uppercase tracking-wider text-amber-500/60">
              {u.label}
            </span>
          </div>
          {i < units.length - 1 && (
            <span className="mb-3 text-sm font-bold text-amber-500/40">:</span>
          )}
        </div>
      ))}
    </div>
  );
}
