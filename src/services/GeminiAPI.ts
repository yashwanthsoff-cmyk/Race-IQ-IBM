const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'
const GROQ_KEY = import.meta.env.VITE_GROQ_API_KEY

export const callGemini = async ({ systemPrompt = '', userMessage = '', conversationHistory = [], expectJSON = false, temperature = 0.7, maxTokens = 2048 }: any) => {
  if (!GROQ_KEY) throw new Error('No Groq API key configured.')
  const messages = [
    ...conversationHistory.map((m: any) => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content })),
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userMessage }
  ]
  const response = await fetch(GROQ_URL, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${GROQ_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'llama-3.3-70b-versatile', temperature, max_tokens: maxTokens, messages })
  })
  if (!response.ok) { const e = await response.json(); throw new Error(e.error?.message || 'Groq API request failed') }
  const data = await response.json()
  const text = data.choices[0].message.content || ''
  if (expectJSON) {
    try { return JSON.parse(text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()) }
    catch { throw new Error('Groq returned malformed JSON') }
  }
  return text
}

export default callGemini

export const GEMINI_MODELS = { DEFAULT: 'llama-3.3-70b-versatile' }
