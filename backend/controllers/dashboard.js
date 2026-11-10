
const Incident = require("../models/Incident");

// GET DASHBOARD STATISTICS

const getDashboardStats = async (req, res) => {
  try {

    // Total incidents
    const total = await Incident.countDocuments();

    // Detected incidents
    const detected = await Incident.countDocuments({
      status: "Detected"
    });

    // Investigating incidents
    const investigating = await Incident.countDocuments({
      status: "Investigating"
    });

    // Resolved incidents
    const resolved = await Incident.countDocuments({
      status: "Resolved"
    });

    // High risk incidents
    const highRisk = await Incident.countDocuments({
      securityLevel: {
        $in: ["High", "Critical"]
      }
    });

    // Latest 5 incidents
    const recentIncidents = await Incident.find()
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,

      dashboard: {
        total,
        detected,
        investigating,
        resolved,
        highRisk
      },

      recentIncidents
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

module.exports = {
  getDashboardStats
};

