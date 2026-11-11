
import { useState } from 'react'

function Phishing() {
  const [url, setUrl] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const analyzeURL = async (e) => {
    e.preventDefault()

    setResult(null)
    setError('')
    setLoading(true)

    try {
      const response = await fetch(
        'https://cyberguard-backend-xybt.onrender.com/api/analyze/phishing',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ url })
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'URL analysis failed')
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
      <h2>🔗 Phishing URL Detection</h2>
      <p>Enter a URL to check for suspicious characteristics.</p>

      <form onSubmit={analyzeURL}>
        <input
          type="url"
          placeholder="https://example.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
          style={{
            width: '100%',
            padding: '14px',
            marginBottom: '15px',
            background: '#0b1120',
            color: 'white',
            border: '1px solid #334155',
            borderRadius: '8px'
          }}
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Analyzing...' : 'Analyze URL'}
        </button>
      </form>

      {error && <p className="error-message">{error}</p>}

      {result && (
        <div style={{ marginTop: '25px' }}>
          <h3>Analysis Result</h3>
          <p>Risk Score: {result.riskScore}/100</p>
          <p>Security Level: {result.securityLevel}</p>
          
<h4>AI / Machine Learning Result</h4>
<p>ML Prediction: {result.mlPrediction || 'Not Available'}</p>
<p>ML Confidence: {result.mlConfidence ?? 'Not Available'}{result.mlConfidence != null ? '%' : ''}</p>

          <p>
            Detection Status: {result.suspicious ? 'Suspicious' : 'No suspicious indicators found'}
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

export default Phishing
