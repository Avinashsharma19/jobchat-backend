const express = require("express");
const { createJob, getJobs, getJobById,getMyJobs } = require("../controllers/jobController");
const { protect, restrictTo } = require("../middlewares/authMiddleware");

const router = express.Router();

// Employers only can create jobs
router.post("/", protect, restrictTo("Employer"), createJob);

router.get("/my", protect, restrictTo("Employer"), getMyJobs);

// Anyone can view jobs
router.get("/", getJobs);
router.get("/:id", getJobById);

module.exports = router;
