const express = require("express");
const {
  applyForJob,
  getApplicationsForJob,
  updateApplicationStatus,
  getMyApplications
} = require("../controllers/applicationController");

const { protect, restrictTo } = require("../middlewares/authMiddleware");

const router = express.Router();

// JobSeeker applies for job
router.post("/", protect, restrictTo("JobSeeker"), applyForJob);

// Employer views applications for their job
router.get("/job/:id", protect, restrictTo("Employer"), getApplicationsForJob);

router.get("/my", protect, restrictTo("JobSeeker"), getMyApplications);

// Employer updates application status
router.patch("/:id/status", protect, restrictTo("Employer"), updateApplicationStatus);

module.exports = router;
