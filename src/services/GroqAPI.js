const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'

export const getAIStrategy = async ({ lap, totalLaps, position, compound, tireAge, gapBehind, rain }) => {
  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
      max_tokens: 1024,
      messages: [
        {
          role: 'system',
          content: 'You are RaceIQ, an F1 race strategist. Reply ONLY in this JSON with no extra text: {"decision":"PIT_NOW or STAY_OUT or PREPARE_TO_PIT","confidence":85,"urgency":"CRITICAL or HIGH or MEDIUM or LOW","reasons":["r1","r2","r3"],"pit_window":"Lap X-Y","summary":"one sentence"}'
        },
        {
          role: 'user',
          content: `Lap ${lap}/${totalLaps}, P${position}, ${compound} tires ${tireAge} laps old, gap behind ${gapBehind}s, rain ${rain}%. What strategy?`
        }
      ]
    })
  })
  const data = await res.json()
  const raw = data.choices[0].message.content
  return JSON.parse(raw.replace(/```json\n?/g,'').replace(/```\n?/g,'').trim())
}

export const getAnomalyExplanation = async ({ sensor, value }) => {
  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
      max_tokens: 256,
      messages: [
        { role: 'system', content: 'You are an F1 car engineer. Explain anomalies in one clear sentence.' },
        { role: 'user', content: `${sensor} is reading ${value}. What is the risk?` }
      ]
    })
  })
  const data = await res.json()
  return data.choices[0].message.content
}
