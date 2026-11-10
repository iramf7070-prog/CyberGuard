
import { useEffect, useState } from 'react'

function SecurityDistribution() {
  const [incidents, setIncidents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedLevel, setSelectedLevel] = useState('all')

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

  const levels = [
    { name: 'Low', color: '#22c55e' },
    { name: 'Medium', color: '#f59e0b' },
    { name: 'High', color: '#ef4444' },
    { name: 'Critical', color: '#b91c1c' }
  ]

  const counts = levels.map(level => ({
    ...level,
    count: incidents.filter(
      incident => incident.securityLevel === level.name
    ).length
  }))

  const total = incidents.length
  let current = 0

  const gradient = total === 0
    ? '#334155 0% 100%'
    : counts.map(item => {
        const start = current
        current += (item.count / total) * 100
        return `${item.color} ${start}% ${current}%`
      }).join(', ')

  const selected = counts.find(
    item => item.name === selectedLevel
  )

  return (
    <div className="distribution-panel">
      <h2>Security Level Distribution</h2>
      <p>Overview of detected security threats.</p>

      {loading ? (
        <p>Loading chart data...</p>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : (
        <div className="distribution-content">

          <div
            className="donut-chart"
            style={{
              background: `conic-gradient(${gradient})`
            }}
          >
            <div className="donut-center">
              <h2>{total}</h2>
              <span>Total Incidents</span>
            </div>
          </div>

          <div className="distribution-legend">
            {counts.map(item => (
              <button
                key={item.name}
                className={`legend-item ${
                  selectedLevel === item.name ? 'selected' : ''
                }`}
                onClick={() =>
                  setSelectedLevel(
                    selectedLevel === item.name ? 'all' : item.name
                  )
                }
              >
                <span
                  className="legend-dot"
                  style={{ background: item.color }}
                />
                <span>{item.name}</span>
                <strong>{item.count}</strong>
              </button>
            ))}

            <div className="distribution-details">
              {selectedLevel === 'all' ? (
                <p>Select a security level to see its details.</p>
              ) : (
                <>
                  <strong>{selected.name} Risk</strong>
                  <p>
                    {selected.count} incidents (
                    {total
                      ? ((selected.count / total) * 100).toFixed(1)
                      : 0}%)
                  </p>
                </>
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  )
}

export default SecurityDistribution
