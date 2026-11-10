import { useEffect, useState } from 'react'

function ThreatActivityTrend() {
  const [incidents, setIncidents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        const response = await fetch(
          'http://localhost:5000/api/incidents'
        )

        if (!response.ok) {
          throw new Error('Unable to load incident data')
        }

        const data = await response.json()
        setIncidents(data.incidents || [])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchIncidents()

    const intervalId = setInterval(fetchIncidents, 10000)

    return () => clearInterval(intervalId)
  }, [])

  const lastSevenDays = Array.from({ length: 7 }, (_, index) => {
    const date = new Date()
    date.setHours(0, 0, 0, 0)
    date.setDate(date.getDate() - (6 - index))

    const key = [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, '0'),
      String(date.getDate()).padStart(2, '0')
    ].join('-')

    return {
      key,
      label: date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short'
      }),
      count: 0
    }
  })

  incidents.forEach(incident => {
    if (!incident.createdAt) return

    const date = new Date(incident.createdAt)
    if (Number.isNaN(date.getTime())) return

    const key = [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, '0'),
      String(date.getDate()).padStart(2, '0')
    ].join('-')

    const day = lastSevenDays.find(item => item.key === key)

    if (day) day.count++
  })

  const maxCount = Math.max(
    ...lastSevenDays.map(day => day.count),
    1
  )

  return (
    <div className="trend-panel">
      <h2>Threat Activity Trend</h2>
      <p>Security incidents recorded over the last 7 days.</p>

      {loading ? (
        <p>Loading trend data...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <div className="trend-chart">
          {lastSevenDays.map(day => (
            <div className="trend-column" key={day.key}>
              <strong>{day.count}</strong>

              <div className="trend-bar-area">
                <div
                  className="trend-bar"
                  style={{
                    height: `${(day.count / maxCount) * 100}%`
                  }}
                />
              </div>

              <span>{day.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ThreatActivityTrend