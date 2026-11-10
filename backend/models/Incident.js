
const mongoose = require("mongoose");

const incidentSchema = new mongoose.Schema({

  threatType: {
    type: String,
    required: true
  },

  description: {
    type: String,
    required: true
  },

  riskScore: {
    type: Number,
    default: 0
  },

  securityLevel: {
    type: String,
    enum: ["Low", "Medium", "High", "Critical"],
    default: "Low"
  },

  status: {
    type: String,
    enum: ["Detected", "Investigating", "Resolved"],
    default: "Detected"
  },

  source: {
    type: String,
    default: "Unknown"
  },

  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }

}, {
  timestamps: true
});

module.exports = mongoose.model(
  "Incident",
  incidentSchema
);
