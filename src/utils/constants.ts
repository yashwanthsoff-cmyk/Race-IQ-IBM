export const TEAMS = [
  { id: "redbull", name: "Red Bull Racing", color: "#3671C6", country: "🇦🇹", standing: 1, drivers: ["Max Verstappen", "Sergio Perez"], description: "Dominant back-to-back world champions" },
  { id: "ferrari", name: "Ferrari", color: "#E8002D", country: "🇮🇹", standing: 2, drivers: ["Charles Leclerc", "Carlos Sainz"], description: "Iconic Italian team with 16 constructors titles" },
  { id: "mercedes", name: "Mercedes", color: "#27F4D2", country: "🇬🇧", standing: 3, drivers: ["Lewis Hamilton", "George Russell"], description: "Record-breaking 8-time constructors champions" },
  { id: "mclaren", name: "McLaren", color: "#FF8000", country: "🇬🇧", standing: 4, drivers: ["Lando Norris", "Oscar Piastri"], description: "Rising contenders with legendary heritage" },
  { id: "astonmartin", name: "Aston Martin", color: "#358C75", country: "🇬🇧", standing: 5, drivers: ["Fernando Alonso", "Lance Stroll"], description: "Strategic powerhouse with a two-time world champion" },
  { id: "alpine", name: "Alpine", color: "#0093CC", country: "🇫🇷", standing: 6, drivers: ["Esteban Ocon", "Pierre Gasly"], description: "French passion and engineering excellence" },
  { id: "williams", name: "Williams", color: "#64C4FF", country: "🇬🇧", standing: 7, drivers: ["Alexander Albon", "Logan Sargeant"], description: "Historic British team with 7 constructors titles" },
  { id: "haas", name: "Haas", color: "#B6BABD", country: "🇺🇸", standing: 8, drivers: ["Kevin Magnussen", "Nico Hulkenberg"], description: "America's only Formula 1 team" },
  { id: "alfaromeo", name: "Alfa Romeo", color: "#C92D4B", country: "🇨🇭", standing: 9, drivers: ["Valtteri Bottas", "Zhou Guanyu"], description: "Swiss precision with Italian racing soul" },
  { id: "alphatauri", name: "AlphaTauri (RB)", color: "#6692FF", country: "🇮🇹", standing: 10, drivers: ["Yuki Tsunoda", "Daniel Ricciardo"], description: "Red Bull's young driver development pipeline" },
];

export type Team = (typeof TEAMS)[number];

export const COMPOUND_COLORS: Record<string, { bg: string; fg: string }> = {
  SOFT: { bg: "#E3001E", fg: "#FDFDFD" },
  MEDIUM: { bg: "#F5A623", fg: "#0F1012" },
  HARD: { bg: "#0F1012", fg: "#FDFDFD" },
};

export const RADIO_MESSAGES = [
  "Box this lap, box this lap",
  "Push push push, you have the pace",
  "Tire temp looking good, push harder",
  "Gap to car ahead is 2.3 seconds",
  "Fuel save mode, fuel save mode",
  "Watch your brake bias rear",
  "Rival has pitted, you are now P3",
  "Final lap, give it everything",
  "Rain radar shows clear for 10 laps",
  "DRS enabled, attack attack attack",
];

export const F1_FACTS = [
  "F1 cars can accelerate from 0-100 km/h in under 2 seconds.",
  "A pit stop takes just 2 seconds on a good day.",
  "Drivers can lose 4 kg of body weight during a single race.",
  "F1 brakes glow red-hot at over 1,000°C.",
  "The G-force in a corner can reach 6G.",
  "An F1 engine reaches 15,000 RPM — a Ferrari road car maxes around 8,500.",
  "Tires lose up to 0.5kg of rubber per lap.",
  "F1 cars produce so much downforce they could drive upside-down at 200 km/h.",
  "Each car has over 80,000 individual components.",
  "DRS can boost top speed by up to 12 km/h.",
  "A steering wheel costs around $50,000.",
  "Monaco is the slowest circuit, averaging 160 km/h.",
  "Drivers' necks endure forces equivalent to 25kg pulling sideways.",
  "Pirelli supplies all teams with the same tire allocation per race weekend.",
  "Lewis Hamilton holds the record with 105 race wins.",
];

export const QUICK_PROMPTS = [
  "How is my rival's tire degrading?",
  "Should I push or manage pace?",
  "What's the undercut potential?",
  "How many laps can my tires last?",
  "Is a safety car likely?",
  "What's my optimal fuel strategy?",
  "Compare my pace to leader",
];

export const TOTAL_LAPS = 57;
