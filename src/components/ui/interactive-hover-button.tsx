import React from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface InteractiveHoverButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string;
}

const InteractiveHoverButton = React.forwardRef<
  HTMLButtonElement,
  InteractiveHoverButtonProps
>(({ text = "Button", className, children, ...props }, ref) => {
  const buttonText = text || children;
  return (
    <button
      ref={ref}
      className={cn(
        "group relative inline-flex items-center justify-center gap-2.5 whitespace-nowrap cursor-pointer overflow-hidden rounded-full border border-white/20 bg-gradient-to-r from-violet-600 to-cyan-500 px-8 py-3.5 text-center font-bold text-white shadow-xl shadow-violet-500/25 transition-all duration-300 hover:scale-[1.03] hover:shadow-violet-500/40 active:scale-[0.98]",
        className,
      )}
      {...props}
    >
      <span className="relative z-10 inline-flex items-center gap-2">
        <span>{buttonText}</span>
        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5" />
      </span>
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-violet-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    </button>
  );
});

InteractiveHoverButton.displayName = "InteractiveHoverButton";

export { InteractiveHoverButton };
