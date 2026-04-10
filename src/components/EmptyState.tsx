"use client";

interface EmptyStateProps {
  emoji: string;
  title: string;
  subtitle: string;
}

export default function EmptyState({ emoji, title, subtitle }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 px-8 pb-16">
      <div className="text-5xl mb-1" style={{ filter: "grayscale(20%)" }}>
        {emoji}
      </div>
      <p className="text-base font-extrabold text-center" style={{ color: "#3E2723" }}>
        {title}
      </p>
      <p className="text-sm text-center leading-relaxed" style={{ color: "#8B7355" }}>
        {subtitle}
      </p>
    </div>
  );
}
