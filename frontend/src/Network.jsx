
import { useState } from 'react'

function Network() {
  const [formData, setFormData] = useState({
    failedAttempts: '',
    requestsPerMinute: '',
    bytesTransferred: '',
    destinationPort: '443'
  })

  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const analyzeNetwork = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch(
        'https://cyberguard-backend-xybt.onrender.com/api/analyze/network',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            failedAttempts: Number(formData.failedAttempts),
            requestsPerMinute: Number(formData.requestsPerMinute),
            bytesTransferred: Number(formData.bytesTransferred),
            destinationPort: Number(formData.destinationPort)
          })
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Network analysis failed')
      }

      setResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="panel">
      <h2>🌐 Network Intrusion Detection</h2>
      <p>Enter authorized network log details for analysis.</p>

      <form onSubmit={analyzeNetwork}>
        <input
          type="number"
          name="failedAttempts"
          placeholder="Failed Login Attempts"
          min="0"
          value={formData.failedAttempts}
          onChange={handleChange}
          required
        />

        <input
          type="number"
          name="requestsPerMinute"
          placeholder="Requests Per Minute"
          min="0"
          value={formData.requestsPerMinute}
          onChange={handleChange}
          required
        />

        <input
          type="number"
          name="bytesTransferred"
          placeholder="Bytes Transferred"
          min="0"
          value={formData.bytesTransferred}
          onChange={handleChange}
          required
        />

        <input
          type="number"
          name="destinationPort"
          placeholder="Destination Port"
          min="0"
          max="65535"
          value={formData.destinationPort}
          onChange={handleChange}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Analyzing...' : 'Analyze Network'}
        </button>
      </form>

      {error && <p>{error}</p>}

      {result && (
        <div>
          <h3>Analysis Result</h3>
          <p>Risk Score: {result.riskScore}/100</p>
          <p>Security Level: {result.securityLevel}</p>
          <p>
            Detection Status: {result.suspicious ? 'Suspicious' : 'No suspicious indicators found'}
          </p>


<h3> AI / Machine Learning Result</h3>

<p>
  ML Prediction: <strong>{result.mlPrediction}</strong>
</p>

<p>
  ML Confidence: <strong>{result.mlConfidence}%</strong>
</p>
          <h4>Detection Reasons</h4>
          {result.reasons?.length > 0 ? (
  <ul>
    {result.reasons.map((reason, index) => (
      <li key={index}>{reason}</li>
    ))}
  </ul>
) : (
  <p>No suspicious indicators detected.</p>
)}
        </div>
      )}
    </div>
  )
}

export default Network
