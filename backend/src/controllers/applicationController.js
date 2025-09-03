const Application = require("../models/Application");
const Job = require("../models/Job");
const Chat = require("../models/Chat");

// Apply for a job (JobSeeker only)
// @route POST /applications
exports.applyForJob = async (req, res) => {
  try {
    const { jobId, coverNote } = req.body;

    if (!jobId || !coverNote) {
      return res.status(400).json({ message: "JobId and coverNote required" });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    const existing = await Application.findOne({ job: jobId, seeker: req.user._id });
    if (existing) {
      return res.status(400).json({ message: "You already applied for this job" });
    }

    const application = await Application.create({
      job: jobId,
      seeker: req.user._id,
      coverNote,
    });

    res.status(201).json({ message: "Application submitted", application });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all applications for a job (Employer only)
// @route GET /jobs/:id/applications
exports.getApplicationsForJob = async (req, res) => {
  try {
    const applications = await Application.find({ job: req.params.id })
      .populate("seeker", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(applications);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get applications for logged-in JobSeeker
// @route GET /applications/my
exports.getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ seeker: req.user._id })
      .populate({ path: "job", select: "title description" })
      .populate({ path: "seeker", select: "name email" })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json(applications);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server error in getMyApplications", error: error.message });
  }
};



// Update application status (Employer only)
// @route PATCH /applications/:id/status
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;

    // Only two valid statuses allowed
    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    // Find application + its job
    const application = await Application.findById(req.params.id).populate("job");
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    // Only employer who posted the job can accept/reject
    if (application.job.employer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Update status
    application.status = status;
    await application.save();

    let chat = null;

    // If accepted, create chat room
    if (status === "accepted") {
      // Check if chat already exists for this application
      chat = await Chat.findOne({ application: application._id });

      if (!chat) {
        chat = await Chat.create({
          participants: [application.job.employer, application.seeker],
          application: application._id,
        });
      }
    }

    res.status(200).json({
      message: `Application ${status}`,
      application,
      chat, 
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};