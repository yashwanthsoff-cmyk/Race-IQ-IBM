import { useEffect, useRef } from 'react'
import { getLatestTelemetry } from '../services/OpenF1API'
import { getAIStrategy, getAnomalyExplanation } from '../services/GroqAPI'
import { saveDecision, saveTelemetry, saveAnomaly, subscribeToDecisions, subscribeToAnomalies, getOrCreateSession } from '../services/DatabaseService'

export const useBackend = ({ currentLap, totalLaps, position, compound, tireAge, gapBehind, rain, onNewDecision, onNewAnomaly }) => {
  const sessionRef = useRef(null)

  useEffect(() => {
    getOrCreateSession().then(s => { sessionRef.current = s })
  }, [])

  useEffect(() => {
    const d = subscribeToDecisions(onNewDecision)
    const a = subscribeToAnomalies(onNewAnomaly)
    return () => { d.unsubscribe(); a.unsubscribe() }
  }, [])

  useEffect(() => {
    let ticks = 0
    const interval = setInterval(async () => {
      try {
        const telemetry = await getLatestTelemetry()
        if (!telemetry) return
        ticks++
        if (telemetry.rpm > 14000) {
          const explanation = await getAnomalyExplanation({ sensor: 'RPM', value: telemetry.rpm })
          await saveAnomaly({ session_id: sessionRef.current?.id, sensor: 'engine_rpm', value: telemetry.rpm, baseline: 12000, severity: 'WARNING', ai_explanation: explanation })
        }
        if (ticks % 3 === 0 && sessionRef.current) {
          await saveTelemetry({ session_id: sessionRef.current.id, lap: currentLap, driver_number: 1, speed: telemetry.speed, throttle: telemetry.throttle, brake: telemetry.brake, rpm: telemetry.rpm, gear: telemetry.n_gear, tire_compound: compound, tire_age: tireAge, position })
        }
      } catch (err) {
        console.warn('Telemetry fetch failed (no live race):', err.message)
      }
    }, 3000)
    return () => clearInterval(interval)
  }, [currentLap, position, compound, tireAge])

  const triggerStrategy = async () => {
    const strategy = await getAIStrategy({ lap: currentLap, totalLaps, position, compound, tireAge, gapBehind, rain })
    if (sessionRef.current) {
      await saveDecision({ session_id: sessionRef.current.id, lap: currentLap, decision: strategy.decision, confidence: strategy.confidence, urgency: strategy.urgency, reasons: strategy.reasons })
    }
    return strategy
  }

  return { triggerStrategy }
}
