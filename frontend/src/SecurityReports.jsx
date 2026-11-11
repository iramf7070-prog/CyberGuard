
import { useEffect, useState } from 'react'

function SecurityReports() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
const [searchTerm, setSearchTerm] = useState('')
const [riskFilter, setRiskFilter] = useState('all')
const [selectedDate, setSelectedDate] = useState('')
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await fetch(
          'https://cyberguard-backend-xybt.onrender.com/api/reports'
        )

        if (!response.ok) {
          throw new Error('Failed to fetch security reports')
        }

        const data = await response.json()
        setReports(data.reports || [])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchReports()
  }, [])

  const filteredReports = reports.filter((report) => {
  const matchesSearch =
    report.threatType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.status?.toLowerCase().includes(searchTerm.toLowerCase())

  const matchesRisk =
    riskFilter === 'all' ||
    report.securityLevel?.toLowerCase() === riskFilter.toLowerCase()

  const reportDate = report.createdAt
    ? new Date(report.createdAt).toISOString().split('T')[0]
    : ''

  const matchesDate =
    selectedDate === '' || reportDate === selectedDate

  return matchesSearch && matchesRisk && matchesDate
})
  if (loading) return <p>Loading Security Reports...</p>

  if (error) return <p>Error: {error}</p>

  return (
    <div className="security-reports">
      <h2>Security Reports</h2>

      <h3>Total Reports: {reports.length}</h3>
      <input
  type="text"
  placeholder="Search reports..."
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
  className="incident-search"
/>
<select
  value={riskFilter}
  onChange={(e) => setRiskFilter(e.target.value)}
  className="incident-search"
>
  <option value="all">All Risk Levels</option>
  <option value="low">Low Risk</option>
  <option value="medium">Medium Risk</option>
  <option value="high">High Risk</option>
  <option value="critical">Critical Risk</option>
</select>
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
<button
  onClick={() => window.print()}
  className="print-button"
>
  Print / Save as PDF
</button>


      {filteredReports.length === 0 ? (
  <p>No matching security reports found.</p>
) : (
  filteredReports.map((report) => (
          <div className="incident-card" key={report._id}>
            <h3>{report.threatType}</h3>

            <p>Description: {report.description}</p>

            <p>Risk Score: {report.riskScore}/100</p>

            <p>Security Level: {report.securityLevel}</p>

            <p>Status: {report.status}</p>

            <p>Source: {report.source}</p>

            <p>
              Detection Date:{' '}
              {new Date(report.createdAt).toLocaleString()}
            </p>
          </div>
        ))
      )}
    </div>
  )
}

export default SecurityReports
