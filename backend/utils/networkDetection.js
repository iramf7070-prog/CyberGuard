
function detectNetworkIntrusion(data) {

  let score = 0;
  const reasons = [];

  const {
    failedAttempts = 0,
    requestsPerMinute = 0,
    bytesTransferred = 0,
    destinationPort = 443
  } = data;

  if (failedAttempts >= 5) {
    score += 35;
    reasons.push("Multiple failed login attempts");
  }

  if (requestsPerMinute >= 100) {
    score += 30;
    reasons.push("Unusually high request volume");
  }

  if (bytesTransferred >= 100000000) {
    score += 25;
    reasons.push("Unusually large data transfer");
  }

  if (![80, 443, 53, 22].includes(destinationPort)) {
    score += 10;
    reasons.push("Non-standard destination port observed");
  }

  score = Math.min(score, 100);

  return {
    riskScore: score,

    securityLevel:
      score >= 70 ? "Critical" :
      score >= 40 ? "High" :
      score >= 20 ? "Medium" : "Low",

    suspicious: score >= 40,

    reasons
  };
}

module.exports = { detectNetworkIntrusion };
