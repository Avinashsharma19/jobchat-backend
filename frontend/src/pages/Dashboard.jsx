import React, { useState, useEffect } from "react";
import axios from "axios";

function Dashboard() {
  // Safe parse
  const storedUser = sessionStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const token = sessionStorage.getItem("token");

  const [jobs, setJobs] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [coverNotes, setCoverNotes] = useState({});
  const [selectedJob, setSelectedJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [myApplications, setMyApplications] = useState([]);

  const fetchJobs = async () => {
    if (!user) return; 
    let url = import.meta.env.VITE_API_URL + "/jobs";
    if (user.role === "Employer") {
      url = import.meta.env.VITE_API_URL + "/jobs/my";
    }
    const res = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setJobs(res.data);
  };

  const fetchMyApplications = async () => {
    if (!user) return;
    try {
      const res = await axios.get(
        import.meta.env.VITE_API_URL + "/applications/my",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMyApplications(res.data);
    } catch (err) {
      console.error(
        "Error fetching my applications:",
        err.response?.data || err.message
      );
    }
  };

  useEffect(() => {
    if (user) {
      fetchJobs();
      if (user.role === "JobSeeker") {
        fetchMyApplications();
      }
    }
  }, []);

  const fetchApplications = async (jobId) => {
    if (!user) return;
    const res = await axios.get(
      import.meta.env.VITE_API_URL + `/applications/job/${jobId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    setApplications(res.data);
    setSelectedJob(jobId);
  };

  const createJob = async (e) => {
    e.preventDefault();
    if (!user) return;
    await axios.post(
      import.meta.env.VITE_API_URL + "/jobs",
      { title, description },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    setTitle("");
    setDescription("");
    fetchJobs();
  };

  const applyJob = async (jobId) => {
    if (!user) return;
    try {
      const note = coverNotes[jobId] || "";
      if (!note.trim()) {
        alert("Please enter a cover note before applying.");
        return;
      }

      await axios.post(
        import.meta.env.VITE_API_URL + "/applications",
        {
          jobId,
          coverNote: note,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("Applied successfully");
      setCoverNotes({ ...coverNotes, [jobId]: "" });
      fetchMyApplications(); 
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to apply");
    }
  };

  const updateStatus = async (appId, status) => {
    if (!user) return;
    const res = await axios.patch(
      import.meta.env.VITE_API_URL + `/applications/${appId}/status`,
      { status },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    if (res.data.chat) {
      alert("Application accepted. Chat created!");
    }
    fetchApplications(selectedJob);
  };

  if (!user) return <p>Please login to continue.</p>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Dashboard</h2>

      {user.role === "Employer" && (
        <div className="mb-6">
          <h3 className="text-xl font-semibold">Post a Job</h3>
          <form onSubmit={createJob} className="space-y-2">
            <input
              type="text"
              placeholder="Job Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border p-2 rounded"
            />
            <textarea
              placeholder="Job Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border p-2 rounded"
            />
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              Create Job
            </button>
          </form>
        </div>
      )}

      <h3 className="text-xl font-semibold">Jobs</h3>
      <ul className="space-y-2">
        {jobs.map((job) => (
          <li key={job._id} className="border p-3 bg-white shadow">
            <h4 className="font-bold">{job.title}</h4>
            <p>{job.description}</p>
            <p className="text-sm text-gray-500">
              Posted by {job.employer?.name}
            </p>

            {user.role === "JobSeeker" && (
              <div className="mt-2">
                <textarea
                  placeholder="Cover Note"
                  value={coverNotes[job._id] || ""}
                  onChange={(e) =>
                    setCoverNotes({
                      ...coverNotes,
                      [job._id]: e.target.value,
                    })
                  }
                  className="w-full border p-2 rounded"
                />

                <button
                  onClick={() => applyJob(job._id)}
                  className="bg-blue-600 text-white px-4 py-1 rounded mt-1"
                >
                  Apply
                </button>
              </div>
            )}

            {user.role === "Employer" && (
              <button
                onClick={() => fetchApplications(job._id)}
                className="bg-purple-600 text-white px-4 py-1 rounded mt-2"
              >
                View Applications
              </button>
            )}
          </li>
        ))}
      </ul>

      {/* JobSeeker: My Applications */}
      {user.role === "JobSeeker" && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold">My Applications</h3>
          <ul className="space-y-2">
            {myApplications.map((app) => (
              <li key={app._id} className="border p-3 bg-white shadow">
                <h4 className="font-bold">{app.job?.title}</h4>
                <p>{app.job?.description}</p>
                <p className="text-gray-700">Cover Note: {app.coverNote}</p>
                <p>
                  Status: <strong>{app.status}</strong>
                </p>
                {app.status === "accepted" && (
                  <a
                    href={`/chat/${app._id}`}
                    className="text-blue-600 underline"
                  >
                    Go to Chat
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {user.role === "Employer" && applications.length > 0 && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold">Applications</h3>
          <ul className="space-y-2">
            {applications.map((app) => (
              <li key={app._id} className="border p-3 bg-white shadow">
                <p>
                  <strong>{app.seeker.name}</strong> ({app.seeker.email})
                </p>
                <p>{app.coverNote}</p>
                <p>Status: {app.status}</p>
                {app.status === "pending" && (
                  <>
                    <button
                      onClick={() => updateStatus(app._id, "accepted")}
                      className="bg-green-600 text-white px-3 py-1 rounded mr-2"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => updateStatus(app._id, "rejected")}
                      className="bg-red-600 text-white px-3 py-1 rounded"
                    >
                      Reject
                    </button>
                  </>
                )}
                {app.status === "accepted" && (
                  <a
                    href={`/chat/${app._id}`}
                    className="text-blue-600 underline"
                  >
                    Go to Chat
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
