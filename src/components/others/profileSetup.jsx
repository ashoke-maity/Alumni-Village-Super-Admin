import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "../../apis/axios";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { User, ChevronDown, AlertCircle, X, Plus, ChevronLeft, ChevronRight, Upload } from "lucide-react";
import LoadingScreen from "../common/LoadingScreen";
import ProfileCompletionLoader from "./ProfileCompletionLoader";

const iconVariants = {
  initial: { scale: 0.5, opacity: 0 },
  animate: { scale: 1, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
};

const formVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
};

const courses = ["B.Tech", "M.Tech", "B.Sc", "M.Sc", "MBA", "BBA", "Ph.D"];
const years = Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i);
const currentYear = new Date().getFullYear();

const ProfileSetup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Common fields
    profileImage: "",
    bio: "",
    gender: "",
    dateOfBirth: "",
    currentAddress: "",
    permanentAddress: "",
    collegeStatus: "",
    linkedin: "",
    github: "",
    twitter: "",
    portfolioWebsite: "",
    technicalSkills: [],
    softSkills: [],
    interests: [],
    domainExpertise: [],
    // ... rest of fields


    // Student fields
    rollNumber: "",
    department: "",
    course: "",
    specialization: "",
    yearOfAdmission: "",
    expectedGraduationYear: "",
    currentYear: "",
    semester: "",
    section: "",
    batch: "",
    hostelDayScholar: "",
    cgpa: "",
    internshipExperience: "",
    lookingFor: [],
    emergencyContactName: "",
    emergencyContactNumber: "",
    emergencyContactRelation: "",

    // Alumni fields
    yearOfPassout: "",
    achievementsDuringCollege: "",
    currentJobStatus: "",
    currentCompanyName: "",
    jobTitle: "",
    industry: "",
    yearsOfExperience: "",
    officeLocation: "",
    employmentType: "",
    startupName: "",
    startupRole: "",
    startupWebsite: "",
    startupDomain: "",
    universityName: "",
    country: "",
    courseProgram: "",
    thesisResearchArea: "",
    availableFor: [],
    professionalSummary: "",
  });

  const [errors, setErrors] = useState({});
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [setupSuccess, setSetupSuccess] = useState(false);
  const [tempSkillInput, setTempSkillInput] = useState({ type: "", value: "" });
  const [syncAddresses, setSyncAddresses] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/");
      return;
    }

    // Always fetch initial data to populate form fields (especially collegeStatus for step count)
    // The checkProfileCompletion function handles both validation and data population

    // Otherwise, check if profile is already complete and fetch initial data
    const checkProfileCompletion = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_USER_API_URL}/user/dashboard`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const userData = response.data?.user;

        if (userData?.profileSetupComplete) {
          navigate("/home");
        } else {
          // Pre-fill data from user account (populated from invitation)
          if (userData) {
            setFormData(prev => ({
              ...prev,
              collegeStatus: userData.collegeStatus || prev.collegeStatus,
              // Map startingYear and yearOfPassout if available
              yearOfAdmission: userData.startingYear || prev.yearOfAdmission,
              // For student, map yearOfPassout to expectedGraduationYear
              expectedGraduationYear: (userData.collegeStatus === 'student' && userData.yearOfPassout) ? userData.yearOfPassout : prev.expectedGraduationYear,
              // For alumni, map yearOfPassout
              yearOfPassout: (userData.collegeStatus === 'alumni' && userData.yearOfPassout) ? userData.yearOfPassout : prev.yearOfPassout,
              // Pre-fill name and email if needed
              firstName: userData.FirstName,
              lastName: userData.LastName,
              email: userData.Email
            }));
          }
          setCheckingProfile(false);
        }
      } catch (error) {
        // If 401 (Unauthorized) or 404 (User Not Found), clear token and redirect to login
        if (error.response && (error.response.status === 401 || error.response.status === 404)) {
          localStorage.removeItem("authToken");
          navigate("/");
          return;
        }

        console.error("Error checking profile:", error?.response ?? error);
        setCheckingProfile(false);
      }
    };

    checkProfileCompletion();
  }, [navigate, location.state]);

  // Reset to step 1 when college status changes
  useEffect(() => {
    if (formData.collegeStatus && currentStep > 1) {
      // Don't reset, just ensure we're on a valid step
    }
  }, [formData.collegeStatus]);

  // Sync current address when permanent address changes and sync is enabled
  useEffect(() => {
    if (syncAddresses && formData.permanentAddress) {
      setFormData((prev) => ({
        ...prev,
        currentAddress: prev.permanentAddress,
      }));
    }
  }, [formData.permanentAddress, syncAddresses]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      const currentArray = formData[name] || [];
      if (checked) {
        setFormData((prev) => ({
          ...prev,
          [name]: [...currentArray, value],
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          [name]: currentArray.filter((item) => item !== value),
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const addArrayItem = (fieldName, value) => {
    if (value.trim()) {
      setFormData((prev) => ({
        ...prev,
        [fieldName]: [...(prev[fieldName] || []), value.trim()],
      }));
      setTempSkillInput({ type: "", value: "" });
    }
  };

  const removeArrayItem = (fieldName, index) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: prev[fieldName].filter((_, i) => i !== index),
    }));
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.bio.trim()) {
        newErrors.bio = "Bio is required";
      } else if (formData.bio.length < 20) {
        newErrors.bio = "Bio must be at least 20 characters";
      }
      if (!formData.gender) {
        newErrors.gender = "Gender is required";
      }
      if (!formData.dateOfBirth) {
        newErrors.dateOfBirth = "Date of birth is required";
      }
      if (!formData.permanentAddress.trim()) {
        newErrors.permanentAddress = "Permanent address is required";
      }
    }

    if (step === 2) {
      if (formData.collegeStatus === "student") {
        if (!formData.rollNumber?.trim()) newErrors.rollNumber = "Student ID is required";
        if (!formData.course) newErrors.course = "Course is required";
        if (!formData.department?.trim()) newErrors.department = "Department is required";

        if (!formData.currentYear) newErrors.currentYear = "Current year is required";
        if (!formData.semester) newErrors.semester = "Semester is required";
        if (!formData.yearOfAdmission) newErrors.yearOfAdmission = "Year of admission is required";
        if (!formData.expectedGraduationYear) newErrors.expectedGraduationYear = "Expected graduation year is required";
      } else if (formData.collegeStatus === "alumni") {
        if (!formData.yearOfPassout) newErrors.yearOfPassout = "Graduation year is required";
      } else if (formData.collegeStatus === "faculty") {
        if (!formData.employeeId?.trim()) newErrors.employeeId = "Employee ID is required";
        if (!formData.jobTitle) newErrors.jobTitle = "Designation is required";
        if (!formData.department?.trim()) newErrors.department = "Department is required";
        if (!formData.joiningYear) newErrors.joiningYear = "Joining year is required";
      }
    }

    if (step === 3) {
      if (formData.collegeStatus === "student") {
        // Additional details validation if needed (e.g., emergency contact)
        if (!formData.emergencyContactName?.trim()) newErrors.emergencyContactName = "Parent name is required";

        if (!formData.emergencyContactRelation?.trim()) newErrors.emergencyContactRelation = "Relationship is required";
      } else if (formData.collegeStatus === "faculty") {
        if (!formData.highestQualification?.trim()) newErrors.highestQualification = "Highest Qualification is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("File size should be less than 2MB");
      return;
    }

    // Create immediate local preview
    const previewUrl = URL.createObjectURL(file);
    setFormData(prev => ({ ...prev, profileImage: previewUrl }));

    const formDataUpload = new FormData();
    formDataUpload.append("image", file);

    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.post(
        `${import.meta.env.VITE_USER_API_URL}/user/upload`,
        formDataUpload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Handle response structure from Cloudinary controller
      // Backend returns: { message: "...", data: { secureUrl: "...", ... } }
      const uploadedUrl = response.data?.data?.secureUrl || response.data?.imageUrl;

      if (uploadedUrl) {
        setFormData(prev => ({ ...prev, profileImage: uploadedUrl }));
        toast.success("Image uploaded successfully");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image");
    } finally {
      setLoading(false);
    }
  };

  const getTotalSteps = () => {
    if (formData.collegeStatus === "student") return 5;
    if (formData.collegeStatus === "alumni") return 5;
    if (formData.collegeStatus === "faculty") return 5;
    return 1;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      const totalSteps = getTotalSteps();
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
      }
    } else {
      toast.error("Please fill in all required fields correctly");
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(currentStep)) {
      toast.error("Please fill in all required fields correctly");
      return;
    }

    setLoading(true);
    try {
      const endpoint = `${import.meta.env.VITE_USER_API_URL}/user/setup-profile`;
      const token = localStorage.getItem("authToken");

      const response = await axios.post(endpoint, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.status) {
        toast.success("Profile setup completed successfully!");
        if (response.data.token) {
          localStorage.setItem("authToken", response.data.token);
        }
        // Switch to skeleton loader
        setLoading(false);
        setSetupSuccess(true);

        setTimeout(() => {
          navigate("/home");
        }, 3000);
      } else {
        toast.error(response.data.message || "Something went wrong");
        setLoading(false);
      }
    } catch (error) {
      console.error("Profile setup error:", error);
      if (error.response && error.response.status === 401) {
        toast.error("Session expired. Please login again.");
        localStorage.removeItem("authToken");
        navigate("/login");
      } else {
        toast.error(error.response?.data?.msg || "Failed to setup profile");
      }
      setLoading(false);
    }
  };

  const totalSteps = getTotalSteps();
  const progress = (currentStep / totalSteps) * 100;

  if (checkingProfile) {
    return <LoadingScreen />;
  }

  if (setupSuccess) {
    return <ProfileCompletionLoader />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-rose-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="relative bg-white rounded-xl shadow-xl overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-red-500 via-red-600 to-red-700"></div>

          <div className="px-8 pt-12 pb-8">
            <motion.div
              className="flex flex-col items-center mb-6"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="w-16 h-16 rounded-full bg-gradient-to-r from-red-500 via-red-600 to-red-700 flex items-center justify-center mb-4 shadow-lg"
                variants={iconVariants}
                initial="initial"
                animate="animate"
              >
                <User className="h-8 w-8 text-white" />
              </motion.div>
              <h1 className="text-2xl font-bold text-gray-800">
                Complete Your Profile
              </h1>
              <p className="mt-2 text-sm text-gray-600 text-center">
                Step {currentStep} of {totalSteps}
              </p>
            </motion.div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  className="bg-gradient-to-r from-red-500 to-red-600 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            <motion.div
              variants={formVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              <AnimatePresence mode="wait">
                <form key={currentStep} onSubmit={currentStep === totalSteps ? handleSubmit : (e) => { e.preventDefault(); nextStep(); }} className="space-y-4">
                  {/* Step 1: Basic Information */}
                  {currentStep === 1 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >


                      {/* 2. Gender and Date of Birth */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Gender <span className="text-red-500">*</span>
                          </label>
                          <select
                            name="gender"
                            value={formData.gender}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition appearance-none bg-white"
                          >
                            <option value="">Select</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                          </select>
                          {errors.gender && (
                            <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              {errors.gender}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Date of Birth <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="date"
                            name="dateOfBirth"
                            value={formData.dateOfBirth}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                          />
                          {errors.dateOfBirth && (
                            <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              {errors.dateOfBirth}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* 3. Permanent Address and Current Address */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Permanent Address <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          name="permanentAddress"
                          value={formData.permanentAddress}
                          onChange={handleInputChange}
                          placeholder="Enter your permanent address"
                          rows="2"
                          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition resize-none"
                        />
                        {errors.permanentAddress && (
                          <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {errors.permanentAddress}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="flex items-center gap-2 mb-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={syncAddresses}
                            onChange={(e) => {
                              setSyncAddresses(e.target.checked);
                              if (e.target.checked) {
                                setFormData((prev) => ({
                                  ...prev,
                                  currentAddress: prev.permanentAddress,
                                }));
                              } else {
                                setFormData((prev) => ({
                                  ...prev,
                                  currentAddress: "",
                                }));
                              }
                            }}
                            className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                          />
                          <span className="text-sm text-gray-700">Same as permanent address</span>
                        </label>
                        <textarea
                          name="currentAddress"
                          value={formData.currentAddress}
                          onChange={handleInputChange}
                          placeholder="Enter your current address"
                          rows="2"
                          disabled={syncAddresses}
                          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                        />
                      </div>

                      {/* 4. Bio */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Bio / About Me <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          name="bio"
                          value={formData.bio}
                          onChange={handleInputChange}
                          placeholder="Tell us about yourself (minimum 20 characters)"
                          rows="3"
                          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition resize-none"
                        />
                        {errors.bio && (
                          <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {errors.bio}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  )}
                  {/* Step 2: Academic Information (Student) */}
                  {currentStep === 2 && formData.collegeStatus === "student" && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      {/* 1. Student ID */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Student ID <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="rollNumber"
                          value={formData.rollNumber}
                          onChange={handleInputChange}
                          placeholder="Enter Student ID"
                          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                        />
                        {errors.rollNumber && (
                          <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {errors.rollNumber}
                          </p>
                        )}
                      </div>

                      {/* 2. Course */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Course <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <select
                            name="course"
                            value={formData.course}
                            onChange={handleInputChange}
                            disabled={!formData.rollNumber}
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition appearance-none bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                          >
                            <option value="">Select course</option>
                            {courses.map((course) => (
                              <option key={course} value={course}>
                                {course}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-3 top-3 w-5 h-5 text-gray-400 pointer-events-none" />
                        </div>
                        {errors.course && (
                          <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {errors.course}
                          </p>
                        )}
                      </div>

                      {/* 3. Department */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Department <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="department"
                          value={formData.department}
                          onChange={handleInputChange}
                          disabled={!formData.course}
                          placeholder="e.g., Computer Science"
                          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                        />
                        {errors.department && (
                          <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {errors.department}
                          </p>
                        )}
                      </div>

                      {/* 4. Specialization */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Specialization
                        </label>
                        <input
                          type="text"
                          name="specialization"
                          value={formData.specialization}
                          onChange={handleInputChange}
                          placeholder="e.g., AI/ML (Enter 'None' or 'General' if applicable)"
                          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                        />
                        {errors.specialization && (
                          <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {errors.specialization}
                          </p>
                        )}
                      </div>

                      {/* 5. Current Year */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Current Year <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <select
                            name="currentYear"
                            value={formData.currentYear}
                            onChange={handleInputChange}
                            disabled={!formData.department}
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition appearance-none bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                          >
                            <option value="">Select year</option>
                            {[1, 2, 3, 4, 5].map((year) => (
                              <option key={year} value={year}>
                                {year === 1 ? '1st' : year === 2 ? '2nd' : year === 3 ? '3rd' : `${year}th`} Year
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-3 top-3 w-5 h-5 text-gray-400 pointer-events-none" />
                        </div>
                        {errors.currentYear && (
                          <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {errors.currentYear}
                          </p>
                        )}
                      </div>

                      {/* 6. Semester */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Semester <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <select
                            name="semester"
                            value={formData.semester}
                            onChange={handleInputChange}
                            disabled={!formData.currentYear}
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition appearance-none bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                          >
                            <option value="">Select semester</option>
                            {Array.from({ length: 10 }, (_, i) => i + 1).map((sem) => (
                              <option key={sem} value={sem}>
                                Semester {sem}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-3 top-3 w-5 h-5 text-gray-400 pointer-events-none" />
                        </div>
                        {errors.semester && (
                          <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {errors.semester}
                          </p>
                        )}
                      </div>

                      {/* 7. Year of Admission */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Year of Admission <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <select
                            name="yearOfAdmission"
                            value={formData.yearOfAdmission}
                            onChange={handleInputChange}
                            disabled={!formData.semester}
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition appearance-none bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                          >
                            <option value="">Select year</option>
                            {years.map((year) => (
                              <option key={year} value={year}>
                                {year}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-3 top-3 w-5 h-5 text-gray-400 pointer-events-none" />
                        </div>
                        {errors.yearOfAdmission && (
                          <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {errors.yearOfAdmission}
                          </p>
                        )}
                      </div>

                      {/* 8. Expected Graduation */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Expected Graduation <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <select
                            name="expectedGraduationYear"
                            value={formData.expectedGraduationYear}
                            onChange={handleInputChange}
                            disabled={!formData.yearOfAdmission}
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition appearance-none bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                          >
                            <option value="">Select year</option>
                            {Array.from({ length: 2033 - currentYear }, (_, i) => currentYear + i).map((year) => (
                              <option key={year} value={year}>
                                {year}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-3 top-3 w-5 h-5 text-gray-400 pointer-events-none" />
                        </div>
                        {errors.expectedGraduationYear && (
                          <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {errors.expectedGraduationYear}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* Step 2: Education Background (Alumni) */}
                  {currentStep === 2 && formData.collegeStatus === "alumni" && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Roll Number
                          </label>
                          <input
                            type="text"
                            name="rollNumber"
                            value={formData.rollNumber}
                            onChange={handleInputChange}
                            placeholder="Enter roll number"
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Department & Specialization
                          </label>
                          <input
                            type="text"
                            name="department"
                            value={formData.department}
                            onChange={handleInputChange}
                            placeholder="e.g., CSE - AI/ML"
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Course Completed
                          </label>
                          <div className="relative">
                            <select
                              name="course"
                              value={formData.course}
                              onChange={handleInputChange}
                              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition appearance-none bg-white"
                            >
                              <option value="">Select course</option>
                              {courses.map((course) => (
                                <option key={course} value={course}>
                                  {course}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-3 w-5 h-5 text-gray-400 pointer-events-none" />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Year of Admission
                          </label>
                          <div className="relative">
                            <select
                              name="yearOfAdmission"
                              value={formData.yearOfAdmission}
                              onChange={handleInputChange}
                              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition appearance-none bg-white"
                            >
                              <option value="">Select year</option>
                              {years.map((year) => (
                                <option key={year} value={year}>
                                  {year}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-3 w-5 h-5 text-gray-400 pointer-events-none" />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Graduation Year <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <select
                            name="yearOfPassout"
                            value={formData.yearOfPassout}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition appearance-none bg-white"
                          >
                            <option value="">Select year</option>
                            {years.map((year) => (
                              <option key={year} value={year}>
                                {year}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-3 top-3 w-5 h-5 text-gray-400 pointer-events-none" />
                        </div>
                        {errors.yearOfPassout && (
                          <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {errors.yearOfPassout}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Achievements During College
                        </label>
                        <textarea
                          name="achievementsDuringCollege"
                          value={formData.achievementsDuringCollege}
                          onChange={handleInputChange}
                          placeholder="List your achievements during college"
                          rows="3"
                          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition resize-none"
                        />
                      </div>
                    </motion.div>
                  )}

                  {/* Step 3: Additional Details */}
                  {currentStep === 3 && formData.collegeStatus === "student" && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Looking For
                        </label>
                        <div className="flex flex-wrap gap-3">
                          {["internships", "jobs", "mentorship", "networking"].map((option) => (
                            <label key={option} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                name="lookingFor"
                                value={option}
                                checked={formData.lookingFor?.includes(option)}
                                onChange={handleInputChange}
                                className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                              />
                              <span className="text-sm text-gray-700 capitalize">{option}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Internship Experience
                        </label>
                        <textarea
                          name="internshipExperience"
                          value={formData.internshipExperience}
                          onChange={handleInputChange}
                          placeholder="Describe your internship experiences"
                          rows="3"
                          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition resize-none"
                        />
                      </div>

                      <div className="border-t pt-4">
                        <h3 className="text-sm font-semibold text-gray-800 mb-3">Emergency Contact</h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Parent/Guardian Name <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              name="emergencyContactName"
                              value={formData.emergencyContactName}
                              onChange={handleInputChange}
                              placeholder="Enter name"
                              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                            />
                            {errors.emergencyContactName && (
                              <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                {errors.emergencyContactName}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Relationship <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              name="emergencyContactRelation"
                              value={formData.emergencyContactRelation}
                              onChange={handleInputChange}
                              placeholder="e.g., Father, Mother"
                              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                            />
                            {errors.emergencyContactRelation && (
                              <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                {errors.emergencyContactRelation}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 3: Professional Information (Alumni) */}
                  {currentStep === 3 && formData.collegeStatus === "alumni" && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Current Job Status <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <select
                            name="currentJobStatus"
                            value={formData.currentJobStatus}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition appearance-none bg-white"
                          >
                            <option value="">Select job status</option>
                            <option value="employed">Employed</option>
                            <option value="entrepreneur">Entrepreneur</option>
                            <option value="higherStudies">Higher Studies</option>
                            <option value="freelancing">Freelancing</option>
                            <option value="notWorking">Not Working</option>
                          </select>
                          <ChevronDown className="absolute right-3 top-3 w-5 h-5 text-gray-400 pointer-events-none" />
                        </div>
                        {errors.currentJobStatus && (
                          <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {errors.currentJobStatus}
                          </p>
                        )}
                      </div>

                      {formData.currentJobStatus === "employed" && (
                        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Company Name <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                name="currentCompanyName"
                                value={formData.currentCompanyName}
                                onChange={handleInputChange}
                                placeholder="Enter company name"
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                              />
                              {errors.currentCompanyName && (
                                <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3" />
                                  {errors.currentCompanyName}
                                </p>
                              )}
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Job Title <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                name="jobTitle"
                                value={formData.jobTitle}
                                onChange={handleInputChange}
                                placeholder="Enter job title"
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                              />
                              {errors.jobTitle && (
                                <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3" />
                                  {errors.jobTitle}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Industry
                              </label>
                              <input
                                type="text"
                                name="industry"
                                value={formData.industry}
                                onChange={handleInputChange}
                                placeholder="e.g., IT, Finance"
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Years of Experience
                              </label>
                              <input
                                type="number"
                                name="yearsOfExperience"
                                value={formData.yearsOfExperience}
                                onChange={handleInputChange}
                                placeholder="e.g., 5"
                                min="0"
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {formData.currentJobStatus === "entrepreneur" && (
                        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Startup Name <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                name="startupName"
                                value={formData.startupName}
                                onChange={handleInputChange}
                                placeholder="Enter startup name"
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                              />
                              {errors.startupName && (
                                <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3" />
                                  {errors.startupName}
                                </p>
                              )}
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Role <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                name="startupRole"
                                value={formData.startupRole}
                                onChange={handleInputChange}
                                placeholder="e.g., Founder, CEO"
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                              />
                              {errors.startupRole && (
                                <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3" />
                                  {errors.startupRole}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {formData.currentJobStatus === "higherStudies" && (
                        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                University Name <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                name="universityName"
                                value={formData.universityName}
                                onChange={handleInputChange}
                                placeholder="Enter university name"
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                              />
                              {errors.universityName && (
                                <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3" />
                                  {errors.universityName}
                                </p>
                              )}
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Course/Program <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                name="courseProgram"
                                value={formData.courseProgram}
                                onChange={handleInputChange}
                                placeholder="e.g., MS in CS"
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                              />
                              {errors.courseProgram && (
                                <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3" />
                                  {errors.courseProgram}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Available For
                        </label>
                        <div className="flex flex-wrap gap-3">
                          {["mentoring", "webinars", "funding", "industrialVisits", "referrals"].map((option) => (
                            <label key={option} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                name="availableFor"
                                value={option}
                                checked={formData.availableFor?.includes(option)}
                                onChange={handleInputChange}
                                className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                              />
                              <span className="text-sm text-gray-700 capitalize">{option.replace(/([A-Z])/g, ' $1').trim()}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Professional Summary
                        </label>
                        <textarea
                          name="professionalSummary"
                          value={formData.professionalSummary}
                          onChange={handleInputChange}
                          placeholder="Write a brief professional summary"
                          rows="3"
                          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition resize-none"
                        />
                      </div>
                    </motion.div>
                  )}

                  {/* Step 4: Social Media & Skills (Student) OR Step 4: Social Media & Skills (Alumni) */}
                  {currentStep === (formData.collegeStatus === "student" ? 4 : 4) && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      <div>
                        <h3 className="text-sm font-semibold text-gray-800 mb-3">Social Media Links</h3>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              LinkedIn
                            </label>
                            <input
                              type="url"
                              name="linkedin"
                              value={formData.linkedin}
                              onChange={handleInputChange}
                              placeholder="https://linkedin.com/in/yourprofile"
                              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                GitHub
                              </label>
                              <input
                                type="url"
                                name="github"
                                value={formData.github}
                                onChange={handleInputChange}
                                placeholder="https://github.com/..."
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Twitter
                              </label>
                              <input
                                type="url"
                                name="twitter"
                                value={formData.twitter}
                                onChange={handleInputChange}
                                placeholder="https://twitter.com/..."
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Portfolio Website
                            </label>
                            <input
                              type="url"
                              name="portfolioWebsite"
                              value={formData.portfolioWebsite}
                              onChange={handleInputChange}
                              placeholder="https://yourportfolio.com"
                              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="border-t pt-4">
                        <h3 className="text-sm font-semibold text-gray-800 mb-3">Skills & Interests</h3>

                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Technical Skills
                            </label>
                            <div className="flex gap-2 mb-2">
                              <input
                                type="text"
                                value={tempSkillInput.type === "technical" ? tempSkillInput.value : ""}
                                onChange={(e) => setTempSkillInput({ type: "technical", value: e.target.value })}
                                onKeyPress={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    addArrayItem("technicalSkills", tempSkillInput.value);
                                  }
                                }}
                                placeholder="Add skill and press Enter"
                                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition text-sm"
                              />
                              <button
                                type="button"
                                onClick={() => addArrayItem("technicalSkills", tempSkillInput.value)}
                                className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {formData.technicalSkills?.map((skill, index) => (
                                <span key={index} className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs flex items-center gap-1">
                                  {skill}
                                  <button
                                    type="button"
                                    onClick={() => removeArrayItem("technicalSkills", index)}
                                    className="hover:text-red-600"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </span>
                              ))}
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Soft Skills
                            </label>
                            <div className="flex gap-2 mb-2">
                              <input
                                type="text"
                                value={tempSkillInput.type === "soft" ? tempSkillInput.value : ""}
                                onChange={(e) => setTempSkillInput({ type: "soft", value: e.target.value })}
                                onKeyPress={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    addArrayItem("softSkills", tempSkillInput.value);
                                  }
                                }}
                                placeholder="Add skill and press Enter"
                                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition text-sm"
                              />
                              <button
                                type="button"
                                onClick={() => addArrayItem("softSkills", tempSkillInput.value)}
                                className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {formData.softSkills?.map((skill, index) => (
                                <span key={index} className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs flex items-center gap-1">
                                  {skill}
                                  <button
                                    type="button"
                                    onClick={() => removeArrayItem("softSkills", index)}
                                    className="hover:text-red-600"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </span>
                              ))}
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Interests / Hobbies
                            </label>
                            <div className="flex gap-2 mb-2">
                              <input
                                type="text"
                                value={tempSkillInput.type === "interests" ? tempSkillInput.value : ""}
                                onChange={(e) => setTempSkillInput({ type: "interests", value: e.target.value })}
                                onKeyPress={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    addArrayItem("interests", tempSkillInput.value);
                                  }
                                }}
                                placeholder="Add interest and press Enter"
                                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition text-sm"
                              />
                              <button
                                type="button"
                                onClick={() => addArrayItem("interests", tempSkillInput.value)}
                                className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {formData.interests?.map((interest, index) => (
                                <span key={index} className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs flex items-center gap-1">
                                  {interest}
                                  <button
                                    type="button"
                                    onClick={() => removeArrayItem("interests", index)}
                                    className="hover:text-red-600"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </span>
                              ))}
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Domain Expertise
                            </label>
                            <div className="flex gap-2 mb-2">
                              <input
                                type="text"
                                value={tempSkillInput.type === "domain" ? tempSkillInput.value : ""}
                                onChange={(e) => setTempSkillInput({ type: "domain", value: e.target.value })}
                                onKeyPress={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    addArrayItem("domainExpertise", tempSkillInput.value);
                                  }
                                }}
                                placeholder="Add expertise and press Enter"
                                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition text-sm"
                              />
                              <button
                                type="button"
                                onClick={() => addArrayItem("domainExpertise", tempSkillInput.value)}
                                className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {formData.domainExpertise?.map((domain, index) => (
                                <span key={index} className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs flex items-center gap-1">
                                  {domain}
                                  <button
                                    type="button"
                                    onClick={() => removeArrayItem("domainExpertise", index)}
                                    className="hover:text-red-600"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 2 (Faculty): Professional Info */}
                  {currentStep === 2 && formData.collegeStatus === "faculty" && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Employee ID <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="employeeId"
                            value={formData.employeeId || ""}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Designation <span className="text-red-500">*</span>
                          </label>
                          <select
                            name="jobTitle"
                            value={formData.jobTitle || ""}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition bg-white"
                          >
                            <option value="">Select</option>
                            <option value="Assistant Professor">Assistant Professor</option>
                            <option value="Associate Professor">Associate Professor</option>
                            <option value="Professor">Professor</option>
                            <option value="HOD">HOD</option>
                            <option value="Dean">Dean</option>
                            <option value="Lab Instructor">Lab Instructor</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Department
                        </label>
                        <input
                          type="text"
                          name="department"
                          value={formData.department || ""}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Joining Year
                        </label>
                        <select
                          name="joiningYear"
                          value={formData.joiningYear || ""}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition bg-white"
                        >
                          <option value="">Select Year</option>
                          {years.map((year) => (
                            <option key={year} value={year}>{year}</option>
                          ))}
                        </select>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 3 (Faculty): Research & Additional Info */}
                  {currentStep === 3 && formData.collegeStatus === "faculty" && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Highest Qualification
                        </label>
                        <input
                          type="text"
                          name="highestQualification"
                          value={formData.highestQualification || ""}
                          onChange={handleInputChange}
                          placeholder="e.g. Ph.D, M.Tech"
                          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Specialization Area
                        </label>
                        <input
                          type="text"
                          name="specialization"
                          value={formData.specialization || ""}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Publications / Research Work
                        </label>
                        <textarea
                          name="publications"
                          value={formData.publications || ""}
                          onChange={handleInputChange}
                          rows="3"
                          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                        />
                      </div>
                    </motion.div>
                  )}

                  {/* Step 4 (Faculty): Re-use Social Media & Skills Step */}
                  {currentStep === 4 && formData.collegeStatus === "faculty" && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      {/* Same content as student/alumni step 4 */}
                      <div>
                        <h3 className="text-sm font-semibold text-gray-800 mb-3">Social Media Links</h3>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              LinkedIn
                            </label>
                            <input
                              type="url"
                              name="linkedin"
                              value={formData.linkedin}
                              onChange={handleInputChange}
                              placeholder="https://linkedin.com/in/yourprofile"
                              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                GitHub
                              </label>
                              <input
                                type="url"
                                name="github"
                                value={formData.github}
                                onChange={handleInputChange}
                                placeholder="https://github.com/..."
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Twitter
                              </label>
                              <input
                                type="url"
                                name="twitter"
                                value={formData.twitter}
                                onChange={handleInputChange}
                                placeholder="https://twitter.com/..."
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Portfolio Website
                            </label>
                            <input
                              type="url"
                              name="portfolioWebsite"
                              value={formData.portfolioWebsite}
                              onChange={handleInputChange}
                              placeholder="https://yourportfolio.com"
                              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="border-t pt-4">
                        <h3 className="text-sm font-semibold text-gray-800 mb-3">Skills & Interests</h3>
                        <div className="space-y-3">
                          {/* Reusing existing skill inputs logic would be best but for now duplicating the UI structure or we can refactor.
                              Since the original code block was conditional on student/alumni step 4, let's just ensure we use the same structure. 
                              Actually, the previous block I replaced was part of the student/alumni conditional block. 
                              I will reconstruct the student/alumni block AND add the faculty block here.
                           */}

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Technical Skills
                            </label>
                            <div className="flex gap-2 mb-2">
                              <input
                                type="text"
                                value={tempSkillInput.type === "technical" ? tempSkillInput.value : ""}
                                onChange={(e) => setTempSkillInput({ type: "technical", value: e.target.value })}
                                onKeyPress={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    addArrayItem("technicalSkills", tempSkillInput.value);
                                  }
                                }}
                                placeholder="Add skill and press Enter"
                                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition text-sm"
                              />
                              <button
                                type="button"
                                onClick={() => addArrayItem("technicalSkills", tempSkillInput.value)}
                                className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {formData.technicalSkills?.map((skill, index) => (
                                <span key={index} className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs flex items-center gap-1">
                                  {skill}
                                  <button
                                    type="button"
                                    onClick={() => removeArrayItem("technicalSkills", index)}
                                    className="hover:text-red-600"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Soft Skills */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Soft Skills
                            </label>
                            <div className="flex gap-2 mb-2">
                              <input
                                type="text"
                                value={tempSkillInput.type === "soft" ? tempSkillInput.value : ""}
                                onChange={(e) => setTempSkillInput({ type: "soft", value: e.target.value })}
                                onKeyPress={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    addArrayItem("softSkills", tempSkillInput.value);
                                  }
                                }}
                                placeholder="Add skill and press Enter"
                                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition text-sm"
                              />
                              <button
                                type="button"
                                onClick={() => addArrayItem("softSkills", tempSkillInput.value)}
                                className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {formData.softSkills?.map((skill, index) => (
                                <span key={index} className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs flex items-center gap-1">
                                  {skill}
                                  <button
                                    type="button"
                                    onClick={() => removeArrayItem("softSkills", index)}
                                    className="hover:text-red-600"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Interests */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Interests / Hobbies
                            </label>
                            <div className="flex gap-2 mb-2">
                              <input
                                type="text"
                                value={tempSkillInput.type === "interests" ? tempSkillInput.value : ""}
                                onChange={(e) => setTempSkillInput({ type: "interests", value: e.target.value })}
                                onKeyPress={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    addArrayItem("interests", tempSkillInput.value);
                                  }
                                }}
                                placeholder="Add interest and press Enter"
                                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition text-sm"
                              />
                              <button
                                type="button"
                                onClick={() => addArrayItem("interests", tempSkillInput.value)}
                                className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {formData.interests?.map((interest, index) => (
                                <span key={index} className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs flex items-center gap-1">
                                  {interest}
                                  <button
                                    type="button"
                                    onClick={() => removeArrayItem("interests", index)}
                                    className="hover:text-red-600"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 5: Profile Picture */}
                  {currentStep === 5 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6 flex flex-col items-center justify-center text-center"
                    >
                      <div className="w-32 h-32 rounded-full border-4 border-gray-100 shadow-xl overflow-hidden bg-gray-50 flex items-center justify-center relative group">
                        {formData.profileImage ? (
                          <img
                            src={formData.profileImage}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-16 h-16 text-gray-300" />
                        )}
                        <label className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition duration-200 cursor-pointer">
                          <Upload className="w-6 h-6 mb-1" />
                          <span className="text-xs font-medium">Upload</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageUpload}
                            disabled={loading}
                          />
                        </label>
                      </div>

                      <div className="max-w-xs mx-auto">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">
                          Add a Profile Picture
                        </h3>
                        <p className="text-sm text-gray-500 mb-4">
                          Help others recognize you. Upload a clear photo of yourself.
                        </p>

                        <label className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer transition shadow-sm">
                          <Upload className="w-4 h-4" />
                          <span>Choose File</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageUpload}
                            disabled={loading}
                          />
                        </label>
                      </div>
                    </motion.div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex gap-3 pt-4">
                    {currentStep > 1 && (
                      <button
                        type="button"
                        onClick={prevStep}
                        disabled={loading}
                        className={`flex-1 px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-all duration-200 flex items-center justify-center gap-2 ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Previous
                      </button>
                    )}
                    <button
                      type="submit"
                      disabled={loading}
                      className={`flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl cursor-pointer flex items-center justify-center gap-2 ${currentStep === 1 ? "w-full" : ""} ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
                    >
                      {loading ? (
                        "Processing..."
                      ) : currentStep === totalSteps ? (
                        "Complete Setup"
                      ) : (
                        <>
                          Next
                          <ChevronRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </AnimatePresence>
            </motion.div>

            <p className="mt-6 text-center text-xs text-gray-500">
              This information helps us personalize your experience on AlumniConnect
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetup;
