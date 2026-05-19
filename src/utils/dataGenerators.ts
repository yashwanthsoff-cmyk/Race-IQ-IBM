import { TOTAL_LAPS } from "./constants";

const rnd = (min: number, max: number) => Math.random() * (max - min) + min;

export type LapData = {
  lap: number; time: number; s1: number; s2: number; s3: number;
  compound: "SOFT" | "MEDIUM" | "HARD"; event: "PIT" | null;
};

export function generateLapData(): LapData[] {
  const laps: LapData[] = [];
  for (let i = 1; i <= TOTAL_LAPS; i++) {
    const isPit = i === 18 || i === 36;
    const compound: any = i <= 18 ? "SOFT" : i <= 36 ? "MEDIUM" : "HARD";
    const baseTime = isPit ? rnd(115, 125) : rnd(75, 95);
    const s1 = baseTime * 0.31;
    const s2 = baseTime * 0.36;
    const s3 = baseTime - s1 - s2;
    laps.push({
      lap: i, time: +baseTime.toFixed(3),
      s1: +s1.toFixed(3), s2: +s2.toFixed(3), s3: +s3.toFixed(3),
      compound, event: isPit ? "PIT" : null,
    });
  }
  return laps;
}

export function generateWeather() {
  const data = [];
  for (let h = 0; h < 24; h++) {
    const rainProb = h >= 13 && h <= 17 ? Math.min(75, 30 + (h - 13) * 15) : Math.max(5, 20 - Math.abs(h - 15) * 2);
    data.push({
      hour: h,
      temp: +rnd(18, 28).toFixed(1),
      humidity: +rnd(40, 80).toFixed(0),
      windSpeed: +rnd(5, 25).toFixed(1),
      rainProb,
      rainfall: rainProb > 50 ? +rnd(0.5, 3).toFixed(1) : 0,
      trackTemp: +(rnd(18, 28) + 15).toFixed(1),
    });
  }
  return data;
}

export function initialCompetitors() {
  const drivers = [
    { name: "M. VERSTAPPEN", team: "Red Bull", color: "#3671C6" },
    { name: "L. NORRIS", team: "McLaren", color: "#FF8000" },
    { name: "C. LECLERC", team: "Ferrari", color: "#E8002D" },
    { name: "L. HAMILTON", team: "Mercedes", color: "#27F4D2" },
    { name: "F. ALONSO", team: "Aston Martin", color: "#358C75" },
    { name: "C. SAINZ", team: "Ferrari", color: "#E8002D" },
    { name: "G. RUSSELL", team: "Mercedes", color: "#27F4D2" },
    { name: "O. PIASTRI", team: "McLaren", color: "#FF8000" },
    { name: "S. PEREZ", team: "Red Bull", color: "#3671C6" },
    { name: "P. GASLY", team: "Alpine", color: "#0093CC" },
  ];
  return drivers.map((d, i) => ({
    position: i + 1, name: d.name, team: d.team, teamColor: d.color,
    compound: (["SOFT", "MEDIUM", "HARD"] as const)[i % 3],
    stintAge: Math.floor(rnd(5, 25)),
    gap: `+${rnd(0.5, 30).toFixed(3)}s`,
    lapTime: +rnd(78, 92).toFixed(3),
    predictedPitLap: 0,
    pitConfidence: Math.floor(rnd(60, 95)),
    threatLevel: (i < 3 ? "HIGH" : i < 6 ? "MEDIUM" : "LOW") as "HIGH" | "MEDIUM" | "LOW",
  }));
}

export function initialProbability() {
  return [
    { driver: "VER", name: "Max Verstappen", probability: 35, color: "#3671C6", history: [] as number[] },
    { driver: "NOR", name: "Lando Norris", probability: 22, color: "#FF8000", history: [] },
    { driver: "LEC", name: "Charles Leclerc", probability: 18, color: "#E8002D", history: [] },
    { driver: "HAM", name: "Lewis Hamilton", probability: 14, color: "#27F4D2", history: [] },
    { driver: "ALO", name: "Fernando Alonso", probability: 11, color: "#358C75", history: [] },
  ];
}

export const SENSORS = [
  { id: "engineTemp", name: "Engine Temp", unit: "°C", min: 90, max: 110, range: [0, 130], warn: [85, 105, 118], crit: 118 },
  { id: "oilPressure", name: "Oil Pressure", unit: "bar", min: 4, max: 6, range: [0, 8], warn: [4, 6.5, 7], crit: 7 },
  { id: "brakeTempFL", name: "Brake FL", unit: "°C", min: 400, max: 600, range: [0, 900], warn: [300, 650, 750], crit: 750 },
  { id: "brakeTempFR", name: "Brake FR", unit: "°C", min: 400, max: 600, range: [0, 900], warn: [300, 650, 750], crit: 750 },
  { id: "brakeTempRL", name: "Brake RL", unit: "°C", min: 400, max: 600, range: [0, 900], warn: [300, 650, 750], crit: 750 },
  { id: "brakeTempRR", name: "Brake RR", unit: "°C", min: 400, max: 600, range: [0, 900], warn: [300, 650, 750], crit: 750 },
  { id: "hydraulicPressure", name: "Hydraulic", unit: "bar", min: 180, max: 200, range: [0, 220], warn: [170, 205, 215], crit: 215 },
  { id: "fuelPressure", name: "Fuel Pressure", unit: "bar", min: 5, max: 7, range: [0, 10], warn: [4, 7.5, 8.5], crit: 8.5 },
];
