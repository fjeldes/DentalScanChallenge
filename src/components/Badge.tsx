import React from "react";

interface BadgeProps {
  active: boolean;
  label: string;
}

export default function Badge({ active, label }: BadgeProps) {
  return (
    <div
      className={`px-3 py-1.5 text-xs font-bold rounded-full transition-colors flex items-center gap-1.5 shadow-lg ${
        active 
          ? "bg-green-500 text-black shadow-green-500/20" 
          : "bg-black/60 text-white border border-zinc-700"
      }`}
    >
      <div className={`w-2 h-2 rounded-full ${active ? "bg-black" : "bg-zinc-500"}`} />
      {label}
    </div>
  );
}
