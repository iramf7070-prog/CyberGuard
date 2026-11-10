
const Incident = require("../models/Incident");

// GET ALL SECURITY REPORTS

const getAllReports = async (req, res) => {
  try {

    const reports = await Incident.find()
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      totalReports: reports.length,
      reports
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};


// GET REPORT BY ID

const getReportById = async (req, res) => {
  try {

    const report = await Incident.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found"
      });
    }

    res.status(200).json({
      success: true,
      report
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};


// EXPORT FUNCTIONS

module.exports = {
  getAllReports,
  getReportById
};
