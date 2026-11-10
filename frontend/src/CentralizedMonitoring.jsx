
import { useEffect, useState } from 'react'
import { io } from 'socket.io-client'

function CentralizedMonitoring() {
  const [stats, setStats] = useState(null)
  const [incidents, setIncidents] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [alerts, setAlerts] = useState([])
  const [selectedFilter, setSelectedFilter] = useState('Total')
  const [alertSearch, setAlertSearch] = useState('')
const [severityFilter, setSeverityFilter] = useState('all')

const fetchMonitoringData = async (isManual = false) => {
  if (isManual) {
    setRefreshing(true)
  }

  try {
    const [dashboardResponse, incidentResponse] = await Promise.all([
      fetch('http://localhost:5000/api/dashboard'),
      fetch('http://localhost:5000/api/incidents')
    ])

    if (!dashboardResponse.ok || !incidentResponse.ok) {
      throw new Error('Unable to fetch monitoring data')
    }

    const dashboardData = await dashboardResponse.json()
    const incidentData = await incidentResponse.json()

    setStats(dashboardData.dashboard)
    setIncidents(incidentData.incidents || [])
    setAlerts(incidentData.incidents || [])

    setError('')
  } catch (err) {
    setError(err.message)
  } finally {
    setLoading(false)
    if (isManual) {
      setRefreshing(false)
    }
  }
}

  useEffect(() => {
    fetchMonitoringData()

    const socket = io('http://localhost:5000')

    socket.on('newThreat', (threat) => {
  setAlerts((previousAlerts) => [
    threat,
    ...previousAlerts.filter(
      (alert) => alert._id !== threat._id
    )
  ])

  fetchMonitoringData()
})
    const interval = setInterval(fetchMonitoringData, 10000)

    return () => {
      clearInterval(interval)
      socket.disconnect()
    }
  }, [])

  if (loading) return <p>Loading Centralized Monitoring...</p>
  if (error) return <p>Error: {error}</p>

  const filteredIncidents = incidents.filter((incident) => {
    if (selectedFilter === 'Total') return true
    if (selectedFilter === 'Detected') {
      return incident.status === 'Detected'
    }
    if (selectedFilter === 'Investigating') {
      return incident.status === 'Investigating'
    }
    if (selectedFilter === 'Resolved') {
      return incident.status === 'Resolved'
    }
    if (selectedFilter === 'High Risk') {
      return ['High', 'Critical'].includes(incident.securityLevel)
    }
    return true
  })

const filteredAlerts = alerts.filter((alert) => {
  const matchesSearch =
    alert.threatType?.toLowerCase().includes(alertSearch.toLowerCase()) ||
    alert.source?.toLowerCase().includes(alertSearch.toLowerCase())

  const matchesSeverity =
    severityFilter === 'all' ||
    alert.securityLevel?.toLowerCase() === severityFilter

  return matchesSearch && matchesSeverity
})

const totalAlerts = alerts.length

const highRiskAlerts = alerts.filter((alert) =>
  ['High', 'Critical'].includes(alert.securityLevel)
).length

const criticalAlerts = alerts.filter(
  (alert) => alert.securityLevel === 'Critical'
).length


  const cardStyle = {
    width: '100%',
    textAlign: 'left',
    cursor: 'pointer',
    font: 'inherit',
    color: 'inherit'
  }

  return (
    <div className="panel">
      <h2>Centralized Security Monitoring</h2>
      <p>Monitor all security activities from one place.</p>

     <div className="panel">
<div className="stats-grid">
  <div className="stat-card">
    <h3>Total Alerts</h3>
    <p>{totalAlerts}</p>
  </div>

  <div className="stat-card">
    <h3>High Risk Alerts</h3>
    <p>{highRiskAlerts}</p>
  </div>

  <div className="stat-card">
    <h3>Critical Alerts</h3>
    <p>{criticalAlerts}</p>
  </div>
</div>

  <h3>🔔 Real-Time Security Alerts</h3>
  <input
  type="text"
  placeholder="Search by threat type or source..."
  value={alertSearch}
  onChange={(e) => setAlertSearch(e.target.value)}
  className="incident-search"
/>

<select
  value={severityFilter}
  onChange={(e) => setSeverityFilter(e.target.value)}
  className="incident-search"
>
  <option value="all">All Severity Levels</option>
  <option value="low">Low</option>
  <option value="medium">Medium</option>
  <option value="high">High</option>
  <option value="critical">Critical</option>
</select>
  {filteredAlerts.length === 0 ? (
    <p>No new real-time alerts.</p>
  ) : (
    filteredAlerts.map((alert, index) => (
      <div className="incident-card" key={alert._id || index}>
        <h4> Threat Detected: {alert.threatType}</h4>
        <p>Risk Score: {alert.riskScore}/100</p>
        <p>Security Level: {alert.securityLevel}</p>
        <p>Status: {alert.status}</p>
        <p>Source: {alert.source || 'Not available'}</p>
        <p>
          Time: {alert.createdAt
            ? new Date(alert.createdAt).toLocaleString()
            : 'Not available'}
        </p>
      </div>
    ))
  )}
</div>

      {stats && (
        <div className="stats-grid">
          <button
            type="button"
            className="stat-card"
            style={cardStyle}
            onClick={() => setSelectedFilter('Total')}
          >
            <h3>Total Incidents</h3>
            <p>{stats.total}</p>
          </button>

          <button
            type="button"
            className="stat-card"
            style={cardStyle}
            onClick={() => setSelectedFilter('Detected')}
          >
            <h3>Detected</h3>
            <p>{stats.detected}</p>
          </button>

          <button
            type="button"
            className="stat-card"
            style={cardStyle}
            onClick={() => setSelectedFilter('Investigating')}
          >
            <h3>Investigating</h3>
            <p>{stats.investigating}</p>
          </button>

          <button
            type="button"
            className="stat-card"
            style={cardStyle}
            onClick={() => setSelectedFilter('Resolved')}
          >
            <h3>Resolved</h3>
            <p>{stats.resolved}</p>
          </button>

          <button
            type="button"
            className="stat-card"
            style={cardStyle}
            onClick={() => setSelectedFilter('High Risk')}
          >
            <h3>High Risk</h3>
            <p>{stats.highRisk}</p>
          </button>
        </div>
      )}

      <h3>{selectedFilter} Incidents</h3>

      <button
        type="button"
        onClick={() => setSelectedFilter('Total')}
      >
        Show All Incidents
      </button>

      {filteredIncidents.length === 0 ? (
        <p>No {selectedFilter.toLowerCase()} incidents available.</p>
      ) : (
        filteredIncidents.map((incident) => (
          <div className="incident-card" key={incident._id}>
            <h4>{incident.threatType}</h4>
            <p>Risk Score: {incident.riskScore}/100</p>
            <p>Security Level: {incident.securityLevel}</p>
            <p>Status: {incident.status}</p>
            <p>Source: {incident.source || 'Not available'}</p>
          </div>
        ))
      )}

      <button
  type="button"
  onClick={() => fetchMonitoringData(true)}
  disabled={refreshing}
>
  {refreshing ? 'Refreshing...' : 'Refresh Monitoring'}
</button>
    </div>
  )
}

export default CentralizedMonitoring
