const BASE = import.meta.env.VITE_API_BASE_URL;

async function callLambda(endpoint: string, body: object) {
  const res = await fetch(`${BASE}/${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  return typeof data.body === 'string' ? JSON.parse(data.body) : data;
}

export const callExplain = (p: any) => callLambda('explain', p);
export const callStrategy = (p: any) => callLambda('strategy', p);
export const callCopilot = (p: any) => callLambda('copilot', p);
export const callTelemetry = (p: any) => callLambda('telementry', p);
export const callAnomaly = (p: any) => callLambda('anomaly', p);
export const callWinprob = (p: any) => callLambda('winprob', p);
export const callWeather = (p: any) => callLambda('weather', p);
export const callLaps = (p: any) => callLambda('laps', p);
export const callRival = (p: any) => callLambda('rival', p);
export const callMultiteam = (p: any) => callLambda('multiteam', p);
export const callFanmode = (p: any) => callLambda('fanmode', p);
export const callSimulator = (p: any) => callLambda('simulator', p);
export const callLearn = (p: any) => callLambda('learn', p);
export const callNotify = (p: any) => callLambda('notify', p);
export const callVoice = (p: any) => callLambda('voice', p);