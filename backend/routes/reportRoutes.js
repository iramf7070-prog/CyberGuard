
const express = require("express");
const router = express.Router();

const {
  getAllReports,
  getReportById
} = require("../controllers/report");

// Get all reports
router.get("/", getAllReports);

// Get single report by ID
router.get("/:id", getReportById);

module.exports = router;
