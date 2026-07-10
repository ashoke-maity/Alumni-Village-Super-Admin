import React, { useState } from "react";
import axios from 'axios';

const JobForm = ({ onSubmitSuccess }) => {
  const [jobData, setJobData] = useState({
    jobTitle: "",
    location: "",
    jobType: "",
    salary: "",
    description: "",
    requirements: "",
    deadline: "",
    applyLink: "",
  });



  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("developerAuthToken");
      if (!token) {
        return alert("You must be logged in as admin to post a job.");
      }

      const formData = new FormData();

      for (let key in jobData) {
        formData.append(key, jobData[key]);
      }

      const response = await axios.post(
        `${import.meta.env.VITE_DEVELOPER_API_URL}/developer/jobs`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Job posted successfully:", response.data);
      alert("Job posted successfully!");

      // Pass the job data to parent component
      if (onSubmitSuccess) {
        onSubmitSuccess(response.data.job || {
          ...jobData,
          _id: Date.now(), // Temporary ID if the backend doesn't return an ID
        });
      }

      setJobData({
        jobTitle: "",
        location: "",
        jobType: "",
        salary: "",
        description: "",
        requirements: "",
        deadline: "",
        applyLink: "",
      });

    } catch (error) {
      console.log("Error posting job:", error);
      alert("Failed to post job. Check console for details.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setJobData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };



  return (
    <div className="rounded-xl bg-white shadow-md p-6">
      <form onSubmit={handleSubmit} className="space-y-6 p-6" encType="multipart/form-data">



        {/* Job Title */}
        <div>
          <label className="text-lg font-medium text-gray-700">Job Title</label>
          <input
            type="text"
            name="jobTitle"
            value={jobData.jobTitle}
            onChange={handleInputChange}
            placeholder="Enter job title"
            required
            className="w-full p-3 mt-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Job Description */}
        <div>
          <label className="text-lg font-medium text-gray-700">Job Description</label>
          <textarea
            name="description"
            value={jobData.description}
            onChange={handleInputChange}
            placeholder="Enter job description"
            rows="4"
            required
            className="w-full p-3 mt-2 border border-gray-300 rounded-lg focus:ring-2 "
          />
        </div>

        {/* Job Requirements */}
        <div>
          <label className="text-lg font-medium text-gray-700">Job Requirements</label>
          <textarea
            name="requirements"
            value={jobData.requirements}
            onChange={handleInputChange}
            placeholder="List requirements"
            rows="4"
            required
            className="w-full p-3 mt-2 border border-gray-300 rounded-lg focus:ring-2 "
          />
        </div>

        {/* Job Type */}
        <div>
          <label className="text-lg font-medium text-gray-700">Job Type</label>
          <select
            name="jobType"
            value={jobData.jobType}
            onChange={handleInputChange}
            required
            className="w-full p-3 mt-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select job type</option>
            <option value="Full-time">Full-time (on-site)</option>
            <option value="Internship">Internship (on-site)</option>
            <option value="Remote Internship">Remote Internship</option>
          </select>
        </div>

        {/* Location */}
        <div>
          <label className="text-lg font-medium text-gray-700">Location</label>
          <input
            type="text"
            name="location"
            value={jobData.location}
            onChange={handleInputChange}
            placeholder="Enter location"
            required
            className="w-full p-3 mt-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Salary */}
        <div>
          <label className="text-lg font-medium text-gray-700">Salary</label>
          <input
            type="text"
            name="salary"
            value={jobData.salary}
            onChange={handleInputChange}
            placeholder="e.g. $60,000/year"
            className="w-full p-3 mt-2 border border-gray-300 rounded-lg focus:ring-2 "
          />
        </div>

        {/* Deadline */}
        <div>
          <label className="text-lg font-medium text-gray-700">Application Deadline</label>
          <input
            type="date"
            name="deadline"
            value={jobData.deadline}
            onChange={handleInputChange}
            required
            className="w-full p-3 mt-2 border border-gray-300 rounded-lg focus:ring-2 "
          />
        </div>

        {/* Apply Link */}
        <div>
          <label className="text-lg font-medium text-gray-700">Apply Link</label>
          <input
            type="url"
            name="applyLink"
            value={jobData.applyLink}
            onChange={handleInputChange}
            placeholder="https://example.com/apply"
            className="w-full p-3 mt-2 border border-gray-300 rounded-lg focus:ring-2 "
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 mt-6 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Post Job
        </button>
      </form>
    </div>
  );
};

export default JobForm;
