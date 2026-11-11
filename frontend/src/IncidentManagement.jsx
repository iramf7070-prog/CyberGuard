
import { useEffect, useState } from 'react'

function IncidentManagement({ filter = 'all' }) {
  const [incidents, setIncidents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingId, setUpdatingId] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDate, setSelectedDate] = useState('')

  const fetchIncidents = async () => {
    try {
      const response = await fetch(
        'https://cyberguard-backend-xybt.onrender.com/api/incidents'
      )

      if (!response.ok) {
        throw new Error('Failed to fetch incidents')
      }

      const data = await response.json()
      setIncidents(data.incidents || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchIncidents()
  }, [])

  const updateStatus = async (id, status) => {
    try {
      setUpdatingId(id)
      setError('')

      const response = await fetch(
        `https://cyberguard-backend-xybt.onrender.com/api/incidents/${id}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status })
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Status update failed')
      }

      setIncidents((previous) =>
        previous.map((incident) =>
          incident._id === id ? data.incident : incident
        )
      )
    } catch (err) {
      setError(err.message)
    } finally {
      setUpdatingId(null)
    }
  }

 const filteredIncidents = incidents.filter((incident) => {
  const matchesFilter =
    filter === 'detected'
      ? incident.status === 'Detected'
      : filter === 'investigating'
      ? incident.status === 'Investigating'
      : filter === 'highRisk'
      ? ['High', 'Critical'].includes(incident.securityLevel)
      : true

  const matchesSearch =
    incident.threatType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    incident.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    incident.status?.toLowerCase().includes(searchTerm.toLowerCase())
    const incidentDate = new Date(incident.createdAt)
  .toISOString()
  .split('T')[0]

const matchesDate =
  selectedDate === '' || incidentDate === selectedDate

  return matchesFilter && matchesSearch && matchesDate
})
   
  if (loading) return <p>Loading incidents...</p>

  return (
    <div className="incident-management">
      <h2>Incident Management</h2>

      <p>
        Showing {filteredIncidents.length} of {incidents.length} incidents
      </p>
      <input
  type="text"
  placeholder="Search by threat type, description or status..."
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
  className="incident-search"
/>
<input
  type="date"
  value={selectedDate}
  onChange={(e) => setSelectedDate(e.target.value)}
  className="incident-search"
/>

{selectedDate && (
  <button onClick={() => setSelectedDate('')}>
    Clear Date
  </button>
)}

      {error && <p style={{ color: '#f87171' }}>{error}</p>}

      {filteredIncidents.length === 0 ? (
        <p>No incidents found in this category.</p>
      ) : (
        filteredIncidents.map((incident) => (
          <div key={incident._id} className="incident-card">
            <h3>{incident.threatType}</h3>

            <p>Description: {incident.description}</p>
            <p>Risk Score: {incident.riskScore}/100</p>
            <p>Security Level: {incident.securityLevel}</p>
            <p>Current Status: {incident.status}</p>

            <label>
              Update Status:{' '}
              <select
                value={incident.status}
                disabled={updatingId === incident._id}
                onChange={(e) =>
                  updateStatus(incident._id, e.target.value)
                }
              >
                <option value="Detected">Detected</option>
                <option value="Investigating">Investigating</option>
                <option value="Resolved">Resolved</option>
              </select>
            </label>

            {updatingId === incident._id && (
              <p>Updating...</p>
            )}
          </div>
        ))
      )}
    </div>
  )
}

export default IncidentManagement
