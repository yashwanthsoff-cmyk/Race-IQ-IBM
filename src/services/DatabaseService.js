import supabase from './supabase'

export const saveDecision = async (decision) => {
  const { error } = await supabase.from('ai_decisions').insert(decision)
  if (error) console.error('saveDecision error:', error)
}

export const saveTelemetry = async (snapshot) => {
  const { error } = await supabase.from('telemetry_snapshots').insert(snapshot)
  if (error) console.error('saveTelemetry error:', error)
}

export const saveAnomaly = async (alert) => {
  const { error } = await supabase.from('anomaly_alerts').insert(alert)
  if (error) console.error('saveAnomaly error:', error)
}

export const getDecisions = async (sessionId) => {
  const { data, error } = await supabase
    .from('ai_decisions')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false })
  if (error) console.error('getDecisions error:', error)
  return data || []
}

export const subscribeToDecisions = (callback) => {
  return supabase
    .channel('decisions')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ai_decisions' }, payload => callback(payload.new))
    .subscribe()
}

export const subscribeToAnomalies = (callback) => {
  return supabase
    .channel('anomalies')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'anomaly_alerts' }, payload => callback(payload.new))
    .subscribe()
}

export const getOrCreateSession = async (raceName = 'Monaco Grand Prix') => {
  const { data: existing } = await supabase
    .from('race_sessions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (existing) return existing

  const { data, error } = await supabase
    .from('race_sessions')
    .insert({ race_name: raceName, circuit: 'Monaco', total_laps: 57, status: 'DEMO' })
    .select()
    .single()

  if (error) console.error('getOrCreateSession error:', error)
  return data
}
