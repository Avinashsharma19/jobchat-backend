const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(express.json());

// Enable CORS
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// Routes
app.use("/auth", require("./routes/authRoutes"));
app.use("/jobs", require("./routes/jobRoutes"));
app.use("/applications", require("./routes/applicationRoutes"));

module.exports = app;
