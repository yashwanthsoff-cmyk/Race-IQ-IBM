const MAP: Array<[RegExp, string]> = [
  [/\bDRS\b/g, "Turbo Boost Zone"],
  [/\bUndercut\b/gi, "Secret Pit Stop Move"],
  [/\bOvercut\b/gi, "Stay-Out Strategy"],
  [/\bStint\b/gi, "Tire Run"],
  [/\bDegradation\b/gi, "Tire Wear"],
  [/\bDeg\b/g, "Tire Wear"],
  [/\bDelta\b/gi, "Time Gap"],
  [/\bIntermediates\b/gi, "Rain Tires"],
  [/\bSlicks\b/gi, "Dry Tires"],
  [/\bERS\b/g, "Boost Energy"],
  [/\bPit Box\b/gi, "Pit Lane Stop"],
  [/\bSector\b/gi, "Track Section"],
  [/\bOutlap\b/gi, "First Lap on New Tires"],
  [/\bInlap\b/gi, "Last Lap Before Pit"],
];

export const fanText = (s: string, fanMode = true): string => {
  if (!fanMode || !s) return s;
  let out = s;
  for (const [re, repl] of MAP) out = out.replace(re, repl);
  return out;
};

export const FAN_HEADERS: Record<string, string> = {
  dashboard: "LIVE RACE",
  strategy: "RACE BRAIN",
  analytics: "RACE STATS",
  weather: "RAIN WATCH",
  simulator: "WHAT IF?",
  anomaly: "CAR HEALTH",
  probability: "WHO WINS?",
  competitors: "THE RIVALS",
  explain: "WHY?",
  learning: "LESSONS LEARNED",
  "multi-team": "TEAM BATTLE",
};
