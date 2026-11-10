import { useEffect, useState } from 'react'

function SystemHealthMonitor() {
  const [health, setHealth] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const response = await fetch(
          'http://localhost:5000/api/health'
        )

        if (!response.ok) {
          throw new Error('Health check failed')
        }

        const data = await response.json()
        setHealth(data)
        setError('')
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchHealth()

    const intervalId = setInterval(fetchHealth, 10000)

    return () => clearInterval(intervalId)
  }, [])

  if (loading) {
    return <div className="health-panel">Checking system health...</div>
  }

  const services = health ? [
    { name: 'Backend Server', status: health.backend.status },
    { name: 'MongoDB Database', status: health.database.status },
    { name: 'Socket.IO', status: health.socket.status },
    { name: 'API Health', status: health.api.status }
  ] : []

  return (
    <div className="health-panel">
      <h2>System Health Monitor</h2>
      <p>Live status of CyberGuard services.</p>

      {error ? (
        <p className="health-error">
          System connection failed: {error}
        </p>
      ) : (
        <div className="health-grid">
          {services.map(service => {
            const online =
              ['Online', 'Connected', 'Working'].includes(
                service.status
              )

            return (
              <div className="health-card" key={service.name}>
                <h3>{service.name}</h3>

                <span className={
                  online ? 'health-online' : 'health-offline'
                }>
                  ● {service.status}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default SystemHealthMonitor