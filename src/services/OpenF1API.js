const BASE = 'https://api.openf1.org/v1'

export const getLatestTelemetry = async (driverNumber = 1) => {
  const res = await fetch(\\/car_data?driver_number=\&session_key=latest\)
  const data = await res.json()
  return data[data.length - 1] || null
}

export const getLatestPosition = async (driverNumber = 1) => {
  const res = await fetch(\\/position?driver_number=\&session_key=latest\)
  const data = await res.json()
  return data[data.length - 1] || null
}

export const getLatestStints = async (driverNumber = 1) => {
  const res = await fetch(\\/stints?driver_number=\&session_key=latest\)
  const data = await res.json()
  return data[data.length - 1] || null
}
