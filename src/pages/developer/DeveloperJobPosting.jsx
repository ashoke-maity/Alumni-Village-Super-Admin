import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "../../apis/axios";
import socket from "../../socket/socket";
import { Header, PageTransition } from "../../components/layout";
import { Plus } from "lucide-react";
import JobForm from "./forms/JobForm";

const developerRoute = import.meta.env.VITE_DEVELOPER_ROUTE;

const DeveloperJobPosting = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editJob, setEditJob] = useState(null);
  const [editForm, setEditForm] = useState({
    jobTitle: "",

    jobType: "",
    location: "",
    salary: "",
    description: "",
    requirements: "",
    deadline: "",
    applyLink: "",
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState(null);


  const fetchJobs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("developerAuthToken");

      const response = await axios.get(
        `${import.meta.env.VITE_DEVELOPER_API_URL}/developer/jobs`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setJobs(response.data.jobs || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching jobs:", err);
      setError("Failed to load jobs. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // WebSocket listeners for real-time job postings
  useEffect(() => {
    const handleNewJob = (newJob) => {
      setJobs((prev) => {
        const exists = prev.some((j) => j._id === newJob._id);
        if (exists) return prev;
        return [newJob, ...prev];
      });
    };

    const handleJobEdited = (editedJob) => {
      setJobs((prev) => prev.map((j) => (j._id === editedJob._id ? editedJob : j)));
    };

    const handleJobDeleted = (deletedJobId) => {
      setJobs((prev) => prev.filter((j) => j._id !== deletedJobId));
    };

    socket.on("new_job", handleNewJob);
    socket.on("jobEdited", handleJobEdited);
    socket.on("jobDeleted", handleJobDeleted);

    return () => {
      socket.off("new_job", handleNewJob);
      socket.off("jobEdited", handleJobEdited);
      socket.off("jobDeleted", handleJobDeleted);
    };
  }, []);

  const handleJobSubmitSuccess = (newJob) => {
    setJobs((prevJobs) => [newJob, ...prevJobs]);
    setShowForm(false);
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm("Are you sure you want to delete this job?")) {
      return;
    }

    try {
      const token = localStorage.getItem("developerAuthToken");

      await axios.delete(
        `${import.meta.env.VITE_DEVELOPER_API_URL}/developer/jobs/${jobId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Remove the job from the state
      setJobs(jobs.filter((job) => job._id !== jobId));
      alert("Job deleted successfully");
    } catch (err) {
      console.error("Error deleting job:", err);
      alert("Failed to delete job. Please try again.");
    }
  };

  const openEditModal = (job) => {
    setEditJob(job);
    setEditForm({
      jobTitle: job.jobTitle || "",

      jobType: job.jobType || "",
      location: job.location || "",
      salary: job.salary || "",
      description: job.description || "",
      requirements: job.requirements || "",
      deadline: job.deadline ? job.deadline.slice(0, 10) : "",
      applyLink: job.applyLink || "",
    });
    setEditError(null);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditJob(null);
    setEditError(null);
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };



  const handleEditFormSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError(null);
    try {
      const token = localStorage.getItem('developerAuthToken');


      await axios.put(
        `${import.meta.env.VITE_DEVELOPER_API_URL}/developer/jobs/${editJob._id}`,
        editForm,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      await fetchJobs();
      closeEditModal();
    } catch {
      setEditError('Failed to update job. Please try again.');
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <PageTransition locationKey={location.pathname} className={`dashboard wrapper mt-5 content-center space-y-6 px-2 lg:px-8`}>
      <header className="header">
        <article>
          <Header
            title="Post a Job Opening"
            description="Create and manage job openings for all users"
          />
        </article>
      </header>

      <div className="bg-white rounded-lg shadow-sm p-5">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-semibold flex items-center">
            <img src="/icons/briefcase.png" alt="Jobs" className="mr-2 w-5 h-5" />
            Job Openings
          </h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className={`px-4 py-2 rounded-lg text-sm transition-colors font-medium flex items-center gap-2 ${showForm
              ? "bg-gray-200 text-gray-800 hover:bg-gray-300"
              : "bg-red-500 text-white hover:bg-red-600"
              }`}
          >
            {showForm ? (
              "Cancel"
            ) : (
              <>
                <Plus size={16} />
                New Job
              </>
            )}
          </button>
        </div>

        {/* Form for adding jobs */}
        {showForm && (
          <div className="mb-6 p-4 border border-red-100 rounded-lg bg-red-50">
            <h3 className="font-medium mb-3 text-red-800">Post a New Job</h3>
            <JobForm onSubmitSuccess={handleJobSubmitSuccess} />
          </div>
        )}

        {loading ? (
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-gray-100 h-20 rounded"></div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-5 text-red-500">{error}</div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <img
              src="/icons/briefcase.png"
              alt="No jobs"
              className="w-16 h-16 mx-auto mb-3 opacity-30"
            />
            <p>No jobs have been posted yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {jobs.map((job) => (
              <div
                key={job._id}
                className="bg-white rounded-xl shadow-md overflow-hidden"
              >
                <div className="p-5">
                  <div className="flex items-start gap-3">
                    {job.logo ? (
                      <img
                        src={job.logo}
                        alt={`${job.companyName} logo`}
                        className="w-12 h-12 object-contain rounded-md"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center">
                        <span className="text-gray-500 text-xl font-bold">
                          {job.companyName?.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="text-lg font-bold">{job.jobTitle}</h3>

                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                      {job.jobType}
                    </span>
                    <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                      {job.location}
                    </span>
                    {job.salary && (
                      <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                        {job.salary}
                      </span>
                    )}
                  </div>
                  <div className="mt-3">
                    <h4 className="font-medium text-sm">Description:</h4>
                    <p className="text-gray-700 text-sm mt-1">
                      {job.description}
                    </p>
                  </div>
                  <div className="mt-3">
                    <h4 className="font-medium text-sm">Requirements:</h4>
                    <p className="text-gray-700 text-sm mt-1">
                      {job.requirements}
                    </p>
                  </div>
                  {job.deadline && (
                    <div className="mt-2 text-xs text-gray-600">
                      Application Deadline:{" "}
                      {new Date(job.deadline).toLocaleDateString()}
                    </div>
                  )}
                  <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end gap-2">
                    <button
                      onClick={() => openEditModal(job)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteJob(job._id)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Job Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              onClick={closeEditModal}
              disabled={editLoading}
            >
              &times;
            </button>
            <h2 className="text-lg font-semibold mb-4">Edit Job</h2>
            {editError && (
              <div className="bg-red-100 text-red-700 p-2 rounded mb-2 text-sm">
                {editError}
              </div>
            )}
            <form onSubmit={handleEditFormSubmit} className="space-y-3">
              <div>
                <label className="block text-sm font-medium">Job Title</label>
                <input
                  type="text"
                  name="jobTitle"
                  value={editForm.jobTitle}
                  onChange={handleEditFormChange}
                  className="w-full border rounded px-3 py-2 mt-1"
                  required
                />
              </div>

              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium">Job Type</label>
                  <input
                    type="text"
                    name="jobType"
                    value={editForm.jobType}
                    onChange={handleEditFormChange}
                    className="w-full border rounded px-3 py-2 mt-1"
                    required
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={editForm.location}
                    onChange={handleEditFormChange}
                    className="w-full border rounded px-3 py-2 mt-1"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium">Salary</label>
                <input
                  type="text"
                  name="salary"
                  value={editForm.salary}
                  onChange={handleEditFormChange}
                  className="w-full border rounded px-3 py-2 mt-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Description</label>
                <textarea
                  name="description"
                  value={editForm.description}
                  onChange={handleEditFormChange}
                  className="w-full border rounded px-3 py-2 mt-1"
                  rows={2}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Requirements</label>
                <textarea
                  name="requirements"
                  value={editForm.requirements}
                  onChange={handleEditFormChange}
                  className="w-full border rounded px-3 py-2 mt-1"
                  rows={2}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Deadline</label>
                <input
                  type="date"
                  name="deadline"
                  value={editForm.deadline}
                  onChange={handleEditFormChange}
                  className="w-full border rounded px-3 py-2 mt-1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Apply Link</label>
                <input
                  type="url"
                  name="applyLink"
                  value={editForm.applyLink}
                  onChange={handleEditFormChange}
                  className="w-full border rounded px-3 py-2 mt-1"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600 transition disabled:opacity-60"
                  disabled={editLoading}
                >
                  {editLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageTransition>
  );
};

export default DeveloperJobPosting;
