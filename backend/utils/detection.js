
function detectPhishing(url) {
  let score = 0;
  const reasons = [];

  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();

    // Check HTTPS
    if (parsed.protocol !== "https:") {
      score += 15;
      reasons.push("HTTPS is not used");
    }

    // Check IP address
    if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) {
      score += 25;
      reasons.push("IP address used as hostname");
    }

    // Check unusual subdomains
    if (host.split(".").length > 4) {
      score += 15;
      reasons.push("Unusually many subdomains");
    }

    // Check long URL
    if (url.length > 100) {
      score += 10;
      reasons.push("Unusually long URL");
    }

    // Check suspicious characters
    if (url.includes("@")) {
      score += 20;
      reasons.push("URL contains @ symbol");
    }

    // Check suspicious keywords
    const keywords = [
      "login",
      "verify",
      "account",
      "password",
      "secure",
      "update"
    ];

    if (keywords.some(word =>
      url.toLowerCase().includes(word)
    )) {
      score += 10;
      reasons.push("Sensitive-action keywords found");
    }

    score = Math.min(score, 100);

    return {
      riskScore: score,

      securityLevel:
        score >= 70 ? "High" :
        score >= 40 ? "Medium" : "Low",

      suspicious: score >= 40,

      reasons
    };

  } catch (error) {
    return {
      riskScore: 100,
      securityLevel: "High",
      suspicious: true,
      reasons: ["Invalid URL format"]
    };
  }
}

module.exports = { detectPhishing };
