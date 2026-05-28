"use client";

import { useState } from "react";

interface ApplyButtonProps {
  jobTitle: string;
  idx: number;
}

export default function ApplyButton({ jobTitle, idx }: ApplyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleApply = () => {
    // Copy the email to clipboard as a fallback in case mailto: is blocked
    navigator.clipboard.writeText("careers@ghostflow.ai");
    setCopied(true);
    setTimeout(() => setCopied(false), 3500);
  };

  return (
    <div className="flex flex-col items-end gap-1.5 shrink-0">
      <a
        id={`apply-btn-${idx}`}
        href={`mailto:careers@ghostflow.ai?subject=Application for ${encodeURIComponent(jobTitle)} position`}
        onClick={handleApply}
        className="rounded-xl bg-violet-600 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-violet-500 shadow-md shadow-violet-500/10 text-center select-none"
      >
        Apply Now
      </a>
      {copied && (
        <span className="text-[11px] text-emerald-400 font-medium animate-pulse">
          Email copied to clipboard!
        </span>
      )}
    </div>
  );
}
