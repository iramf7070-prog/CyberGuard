
const express = require("express");
const router = express.Router();

const Incident = require("../models/Incident");

// GET ALL INCIDENTS
router.get("/", async (req, res) => {
  try {
    const incidents = await Incident.find()
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      total: incidents.length,
      incidents
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});


// UPDATE INCIDENT STATUS
router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "Detected",
      "Investigating",
      "Resolved"
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid incident status"
      });
    }

    const incident = await Incident.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!incident) {
      return res.status(404).json({
        success: false,
        message: "Incident not found"
      });
    }

    res.json({
      success: true,
      message: "Incident status updated successfully",
      incident
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});



// GET INCIDENT STATISTICS
router.get("/stats", async (req, res) => {
  try {
    const total = await Incident.countDocuments();

    const detected = await Incident.countDocuments({
      status: "Detected"
    });

    const investigating = await Incident.countDocuments({
      status: "Investigating"
    });

    const resolved = await Incident.countDocuments({
      status: "Resolved"
    });

    const highRisk = await Incident.countDocuments({
      securityLevel: { $in: ["High", "Critical"] }
    });

    res.json({
      success: true,
      statistics: {
        total,
        detected,
        investigating,
        resolved,
        highRisk
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
