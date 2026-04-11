"use client";

const MONTHS = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

interface SeasonCalendarProps {
  seasonMonths: number[];
  peakMonth: number;
  accentColor: string;
}

export default function SeasonCalendar({
  seasonMonths,
  peakMonth,
  accentColor,
}: SeasonCalendarProps) {
  const currentMonth = new Date().getMonth() + 1;

  return (
    <div className="mt-5">
      <p
        className="text-xs font-bold uppercase tracking-wide mb-3"
        style={{ color: "#8B7355" }}
      >
        Season Calendar
      </p>
      <div className="flex gap-1">
        {MONTHS.map((label, i) => {
          const month = i + 1;
          const inSeason = seasonMonths.includes(month);
          const isPeak = month === peakMonth;
          const isCurrent = month === currentMonth;

          return (
            <div key={month} className="flex-1 flex flex-col items-center gap-1.5">
              {/* Bar */}
              <div
                className="w-full rounded-full relative"
                style={{
                  height: isPeak ? 32 : inSeason ? 24 : 8,
                  background: inSeason ? accentColor : "#EDE0D4",
                  opacity: inSeason ? (isPeak ? 1 : 0.6) : 0.3,
                  transition: "all 0.3s ease",
                }}
              >
                {isPeak && (
                  <span
                    className="absolute inset-0 flex items-center justify-center text-[8px] font-black text-white"
                    style={{ textShadow: "0 1px 2px rgba(0,0,0,0.2)" }}
                  >
                    ★
                  </span>
                )}
              </div>
              {/* Label */}
              <span
                className="text-[9px] font-bold"
                style={{
                  color: isCurrent ? accentColor : inSeason ? "#5D4037" : "#B8A088",
                }}
              >
                {label}
              </span>
              {/* Current month indicator */}
              {isCurrent && (
                <div
                  className="w-1 h-1 rounded-full -mt-0.5"
                  style={{ background: accentColor }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
