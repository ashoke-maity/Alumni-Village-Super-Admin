import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, MailCheck, Shield, CheckCircle, Sparkles, LogIn, User, ChevronDown, AlertCircle, Upload, Plus, X, Mail, Phone, MapPin, Calendar, Briefcase, GraduationCap, Award, FileText } from "lucide-react";
import LoadingScreen from "../common/LoadingScreen";
import ComprehensiveProfileForm from "../profile/ComprehensiveProfileForm";


function Onboarding() {
  const navigate = useNavigate();

  // UI State
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // 1: account, 2: verify, 3: profile setup
  const totalSteps = 3;

  // Registration form
  const [FirstName, setFirstName] = useState("");
  const [LastName, setLastName] = useState("");
  const [Password, setPassword] = useState("");

  // Verification state
  const [emailVerified, setEmailVerified] = useState(false);
  const [autoVerifyOnLoad, setAutoVerifyOnLoad] = useState(false);

  const [verifiedEmail, setVerifiedEmail] = useState("");

  // Profile setup form - Comprehensive structure
  const [formData, setFormData] = useState({
    // Common fields
    fullName: "",
    profilePhoto: "",
    gender: "",
    dateOfBirth: "",
    contactNumber: "",
    emailAddress: "",
    alternateEmail: "",
    currentAddress: "",
    permanentAddress: "",
    collegeStatus: "",
    bio: "",
    linkedIn: "",
    github: "",
    twitter: "",
    portfolio: "",
    technicalSkills: [],
    softSkills: [],
    interests: "",
    domainExpertise: "",
    
    // Common academic fields
    collegeName: "",
    department: "",
    
    // Student-specific fields
    rollNumber: "",
    course: "",
    specialization: "",
    startingYear: "",
    yearOfPassout: "",
    currentYear: "",
    section: "",
    accommodation: "",
    cgpa: "",
    certifications: [],
    workshops: "",
    projects: "",
    researchPapers: "",
    hackathons: "",
    resume: "",
    internshipExperience: "",
    lookingFor: [],
    emergencyContactName: "",
    emergencyContactNumber: "",
    emergencyContactRelationship: "",
    
    // Alumni-specific fields
    graduationYear: "",
    currentJobStatus: "",
    companyName: "",
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
    universityCountry: "",
    higherStudiesCourse: "",
    thesisArea: "",
    availableFor: [],
    professionalSummary: "",
    publications: "",
    patents: "",
    awards: "",
    collegeAchievements: "",
    
    // Faculty-specific fields
    employeeId: "",
    designation: "",
    dateOfJoining: "",
    dateOfRetirement: "",
    currentlyWorking: false,
    yearsOfExperienceFaculty: "",
    joiningYear: "",
    highestQualification: "",
    officeRoomNumber: "",
    consultationHours: "",
    subjectsTaught: [],
    areasOfExpertise: "",
    researchPublications: "",
    booksAuthored: "",
    projectsGuided: "",
    fundedProjects: "",
    researchInterests: "",
    professionalMemberships: "",
  });

  const [errors, setErrors] = useState({});
  const [profileStep, setProfileStep] = useState(1); // Step within profile setup form

  // Get total steps based on user type
  const getTotalProfileSteps = () => {
    let steps = 4; // Basic Info, Contact Info, Platform Info, Skills & Interests
    
    if (formData.collegeStatus === "student") {
      steps += 4; // Academic Info, Academic Achievements, Career Info, Emergency Contact
    } else if (formData.collegeStatus === "alumni") {
      steps += 4; // Education Background, Professional Info, Contribution & Engagement, Additional Info
    } else if (formData.collegeStatus === "faculty") {
      steps += 2; // Professional Info, Academic & Research
    }
    
    return steps;
  };

  const nextProfileStep = () => {
    const totalSteps = getTotalProfileSteps();
    if (profileStep < totalSteps) {
      setProfileStep(profileStep + 1);
    }
  };

  const prevProfileStep = () => {
    if (profileStep > 1) {
      setProfileStep(profileStep - 1);
    }
  };

  // Reset profile step when entering profile setup
  useEffect(() => {
    if (currentStep === 3) {
      setProfileStep(1);
    }
  }, [currentStep]);


  // Initial check: if token exists, determine next step
  useEffect(() => {
    const checkStatus = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) return; // no token, show onboarding
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_USER_API_URL}/user/dashboard`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const user = res?.data?.user;
        if (!user) return;

        if (user.profileSetupComplete) {
          navigate("/home");
          return;
        }

        setEmailVerified(!!user.emailVerified);
        setVerifiedEmail(user.Email || "");
        if (user.emailVerified && !user.profileSetupComplete) {
          setCurrentStep(3); // Go to profile setup if email is verified but profile not complete
        } else if (user.emailVerified && user.profileSetupComplete) {
          navigate("/home");
        } else {
          setCurrentStep(2); // Go to verification if not verified
        }
      } catch (err) {
        // stay on onboarding
      }
    };
    checkStatus();
  }, [navigate]);

  // Load phone.email script for verification step
  useEffect(() => {
    if (currentStep !== 2) return;



    const emailContainer = document.querySelector(".pe_verify_email");
    if (emailContainer) {
      const emailHasScript = !!emailContainer.querySelector("script[src*='phone.email']");
      if (!emailHasScript) {
        const emailScript = document.createElement("script");
        emailScript.src = "https://www.phone.email/verify_email_v1.js";
        emailScript.async = true;
        emailContainer.appendChild(emailScript);
      }
    }

    // Try auto-start OTP flow
    const tryAutoStart = () => {
      const container = document.querySelector(".pe_verify_email");
      if (!container) return false;
      // Attempt to click a send/start button in widget
      const sendBtn = container.querySelector("button, [role='button']");
      if (sendBtn) {
        try { sendBtn.click(); } catch (_) {}
        return true;
      }
      return false;
    };

    if (autoVerifyOnLoad) {
      let attempts = 0;
      const iv = setInterval(() => {
        attempts++;
        const started = tryAutoStart();
        if (started || attempts > 30) {
          clearInterval(iv);
        }
      }, 300);
    }

    window.phoneEmailListener = async function (userObj) {
      const user_json_url = userObj.user_json_url;
      // Show alert per provided snippet
      alert('Email Verification Successfull !!\nPlease fetch authenticated email id from following JSON file URL.\n ' + user_json_url + '');

      setLoading(true);
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          toast.error("Session expired. Please register or login again.");
          setLoading(false);
          return;
        }
        const response = await axios.post(
          `${import.meta.env.VITE_USER_API_URL}/user/phone-email`,
          { user_json_url },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const data = response?.data?.data || {};
        const user = response?.data?.user || {};

        const updatedEmail = data.user_email || user.Email || "";

        setVerifiedEmail(updatedEmail);
        setEmailVerified(!!(user.emailVerified || updatedEmail));

        toast.success("Verification successful!");
        setCurrentStep(3); // Go directly to profile setup
      } catch (error) {
        console.error("Verification error:", error);
        toast.error(error.response?.data?.msg || "Verification failed. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    window.phoneEmailReceiver = window.phoneEmailListener;

    return () => {
      window.phoneEmailListener = null;
      window.phoneEmailReceiver = null;
    };
  }, [currentStep, autoVerifyOnLoad]);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!FirstName || !LastName || !Password) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_USER_API_URL}/user/register`, {
        FirstName,
        LastName,
        Password,
      });
      if (res.status === 201 && res.data?.token) {
        localStorage.setItem("authToken", res.data.token);
        toast.success("Registration successful!");
        // Next step: verification (email)
        setAutoVerifyOnLoad(true);
        setCurrentStep(2);
      } else {
        toast.error(res.data?.msg || "Registration failed");
      }
    } catch (err) {
      console.error("Registration error:", err);
      toast.error(err.response?.data?.msg || "Registration failed");
    } finally {
      setLoading(false);
    }
  };




  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    
    if (type === "file") {
      // Handle file uploads
      const file = files[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData((prev) => ({
            ...prev,
            [name]: reader.result,
            [`${name}File`]: file,
          }));
        };
        reader.readAsDataURL(file);
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


  const addArrayItem = (fieldName) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: [...(prev[fieldName] || []), ""]
    }));
  };

  const removeArrayItem = (fieldName, index) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: prev[fieldName].filter((_, i) => i !== index)
    }));
  };

  const updateArrayItem = (fieldName, index, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: prev[fieldName].map((item, i) => i === index ? value : item)
    }));
  };

  const validateProfileForm = () => {
    const newErrors = {};

    if (!formData.bio.trim()) {
      newErrors.bio = "Bio is required";
    } else if (formData.bio.length < 20) {
      newErrors.bio = "Bio must be at least 20 characters";
    }

    if (!formData.collegeName.trim()) {
      newErrors.collegeName = "College name is required";
    }

    if (!formData.collegeStatus) {
      newErrors.collegeStatus = "College status is required";
    }

    if (formData.collegeStatus !== "faculty" && !formData.yearOfPassout) {
      newErrors.yearOfPassout = "Year of passout is required";
    }

    if (formData.collegeStatus === "student") {
      if (!formData.rollNumber || !formData.rollNumber.trim()) {
        newErrors.rollNumber = "Roll Number is required";
      }
      if (!formData.startingYear) {
        newErrors.startingYear = "Starting year is required";
      }
      if (!formData.department.trim()) {
        newErrors.department = "Department is required";
      }
    }

    if (formData.collegeStatus === "faculty") {
      if (!formData.employeeId || !formData.employeeId.trim()) {
        newErrors.employeeId = "Employee ID is required";
      }
      if (!formData.joiningYear) {
        newErrors.joiningYear = "Joining year is required";
      }
      if (!formData.highestQualification || !formData.highestQualification.trim()) {
        newErrors.highestQualification = "Highest qualification is required";
      }
      if (!formData.specialization || !formData.specialization.trim()) {
        newErrors.specialization = "Specialization is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isProfileFormComplete = () => {
    if (!formData.bio.trim() || formData.bio.length < 20) return false;
    if (!formData.collegeName.trim()) return false;
    if (!formData.collegeStatus) return false;

    if (formData.collegeStatus === "student") {
      return formData.rollNumber && formData.rollNumber.trim() && formData.startingYear && formData.department.trim() && formData.yearOfPassout;
    }
    if (formData.collegeStatus === "alumni") {
      return formData.yearOfPassout;
    }
    if (formData.collegeStatus === "faculty") {
      return formData.employeeId && formData.employeeId.trim() && formData.joiningYear && formData.highestQualification && formData.highestQualification.trim() && formData.specialization && formData.specialization.trim();
    }

    return false;
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    if (!validateProfileForm()) {
      toast.error("Please fill in all required fields correctly");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("authToken");
      let uploadedUrl = null;
      if (formData.profilePhotoFile) {
        const fd = new FormData();
        fd.append("image", formData.profilePhotoFile);
        const uploadRes = await axios.post(
          `${import.meta.env.VITE_USER_API_URL}/user/upload`,
          fd,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        uploadedUrl = uploadRes?.data?.data?.secureUrl || uploadRes?.data?.secureUrl || null;
        const uploadedPublicId = uploadRes?.data?.data?.publicId || uploadRes?.data?.publicId || null;
        if (uploadedUrl) {
          setFormData((prev) => ({ ...prev, profilePhoto: uploadedUrl }));
        }
      }

      const payload = {
        ...formData,
        emailAddress: formData.emailAddress || verifiedEmail,
        contactNumber: formData.contactNumber || formData.phoneNumber || "",
      };
      if (formData.collegeStatus !== "faculty") {
        payload.yearOfPassout = formData.yearOfPassout;
      }
      if (formData.collegeStatus === "student") {
        payload.startingYear = formData.startingYear;
        payload.department = formData.department;
      } else if (formData.collegeStatus === "faculty") {
        payload.dateOfJoining = formData.dateOfJoining;
      }
      if (uploadedUrl) {
        payload.profileImage = uploadedUrl;
        payload.profileImagePublicId = uploadedPublicId;
      }

      const response = await axios.post(
        `${import.meta.env.VITE_USER_API_URL}/user/setup-profile`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        toast.success("Profile setup completed successfully!");
        navigate("/home");
      }
    } catch (error) {
      console.error("Profile setup error:", error);
      toast.error(
        error.response?.data?.message || "Failed to setup profile. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const currentYear = new Date().getFullYear();
  const maxYear = 2032;
  const startYear = 1970;
  const years = Array.from({ length: maxYear - startYear + 1 }, (_, i) => maxYear - i);

  // Animations
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };
  const iconVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: { scale: 1, rotate: 0, transition: { duration: 0.5, type: "spring", stiffness: 200 } },
  };

  return (
    <>
      {loading && <LoadingScreen />} 
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-emerald-50 to-cyan-50 px-4 py-12">
        <motion.div className="w-full max-w-md" variants={containerVariants} initial="hidden" animate="visible">
          <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-teal-400 via-emerald-500 to-teal-600"></div>

            <div className="px-8 pt-8 pb-8">
              {/* Step Indicators - Always Visible at Top */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  {[1, 2, 3].map((step, index) => (
                    <React.Fragment key={step}>
                      <div className="flex flex-col items-center flex-1">
                        <motion.div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                            currentStep >= step
                              ? "bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-lg"
                              : "bg-gray-200 text-gray-500"
                          }`}
                          animate={{
                            scale: currentStep === step ? 1.2 : 1,
                          }}
                          transition={{ duration: 0.3 }}
                        >
                          {currentStep > step ? (
                            <CheckCircle className="w-5 h-5" />
                          ) : (
                            step
                          )}
                        </motion.div>
                        <span className={`text-xs mt-2 font-medium whitespace-nowrap ${currentStep >= step ? "text-teal-600 font-semibold" : "text-gray-400"}`}>
                          {step === 1 ? "Account" : step === 2 ? "Verify" : "Profile"}
                        </span>
                      </div>
                      {index < 2 && (
                        <motion.div
                          className={`flex-1 h-1.5 mx-3 rounded-full ${
                            currentStep > step
                              ? "bg-gradient-to-r from-teal-500 to-emerald-600"
                              : "bg-gray-200"
                          }`}
                          initial={{ scaleX: 0 }}
                          animate={{
                            scaleX: currentStep > step ? 1 : 0,
                          }}
                          transition={{ duration: 0.5, ease: "easeInOut" }}
                          style={{ transformOrigin: "left" }}
                        />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Header */}
              <AnimatePresence mode="wait">
                <motion.div 
                  key={currentStep}
                  className="flex flex-col items-center mb-8"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div className="relative w-16 h-16 rounded-full bg-gradient-to-r from-teal-400 via-emerald-500 to-teal-600 flex items-center justify-center mb-4 shadow-lg" variants={iconVariants} initial="hidden" animate="visible">
                    {currentStep === 1 && <UserPlus className="h-8 w-8 text-white" />}
                    {currentStep === 2 && <MailCheck className="h-8 w-8 text-white" />}
                    {currentStep === 3 && <User className="h-8 w-8 text-white" />}
                    {currentStep === 1 && (
                      <motion.div className="absolute -top-1 -right-1" animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }}>
                        <Sparkles className="h-5 w-5 text-yellow-400" fill="currentColor" />
                      </motion.div>
                    )}
                  </motion.div>
                  <h1 className="text-2xl font-bold text-gray-800 text-center">
                    {currentStep === 1 && "Create your account"}
                    {currentStep === 2 && "Verify your email"}
                    {currentStep === 3 && "Complete your profile"}
                  </h1>
                  <p className="mt-2 text-sm text-gray-600 text-center max-w-sm">
                    {currentStep === 1 && "Join AlumniConnect and reconnect with your network"}
                    {currentStep === 2 && "Use the secure verification to confirm your identity."}
                    {currentStep === 3 && "This information helps us personalize your experience."}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Step 1: Registration */}
              <AnimatePresence mode="wait">
                {currentStep === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 50, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -50, scale: 0.95 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                  >
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                      <input 
                        type="text" 
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition" 
                        value={FirstName} 
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                        placeholder="Enter your first name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                      <input 
                        type="text" 
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition" 
                        value={LastName} 
                        onChange={(e) => setLastName(e.target.value)}
                        required
                        placeholder="Enter your last name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                      <input 
                        type="password" 
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition" 
                        value={Password} 
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="Create a password"
                        minLength={6}
                      />
                    </div>
                    <button 
                      type="submit" 
                      className="w-full mt-6 px-4 py-3 rounded-lg bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-semibold hover:from-teal-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      Create Account
                    </button>
                  </form>

                  {/* Sign In Link */}
                  <p className="mt-6 text-center text-sm text-gray-600">
                    Already have an account? {" "}
                    <Link to="/" className="font-semibold text-teal-600 hover:text-teal-700">
                      Sign in
                    </Link>
                  </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Step 2: Verification via phone.email */}
              <AnimatePresence mode="wait">
                {currentStep === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 50, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -50, scale: 0.95 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                  >
                  <div className="mb-6 p-5 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <Shield className="w-5 h-5 text-blue-600" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold text-gray-800 mb-1">Secure Verification Process</h3>
                        <p className="text-xs text-gray-600 leading-relaxed">Click the button below to verify your email via a one-time code.</p>
                      </div>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="mb-6 p-4 rounded-lg border border-gray-200 bg-gray-50">
                    <p className="text-sm font-medium text-gray-700 mb-1">Email Verification Status</p>
                    <p className={`text-sm ${emailVerified ? "text-green-600 font-semibold" : "text-gray-500"}`}>
                      {emailVerified ? `✓ Verified: ${verifiedEmail}` : "⏳ Pending verification"}
                    </p>
                  </div>

                  <div className="mt-6">
                    <div className="flex justify-center">
                      {/* Email verification widget */}
                      <div className="pe_verify_email" data-client-id="15633757203393362483"></div>
                    </div>
                  </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Step 3: Profile Setup */}
              <AnimatePresence mode="wait">
                {currentStep === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 50, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -50, scale: 0.95 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                  >
                    <div className="max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                      <form onSubmit={handleProfileSubmit}>
                        <ComprehensiveProfileForm
                          formData={formData}
                          setFormData={setFormData}
                          errors={errors}
                          handleInputChange={handleInputChange}
                          profileStep={profileStep}
                          totalSteps={getTotalProfileSteps()}
                          nextStep={nextProfileStep}
                          prevStep={prevProfileStep}
                          addArrayItem={addArrayItem}
                          removeArrayItem={removeArrayItem}
                          updateArrayItem={updateArrayItem}
                          years={years}
                        />
                        {/* Navigation Buttons */}
                        <div className="flex gap-3 mt-6">
                          {profileStep > 1 && (
                            <button
                              type="button"
                              onClick={prevProfileStep}
                              className="flex-1 px-4 py-3 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-all duration-200"
                            >
                              Previous
                            </button>
                          )}
                          {profileStep < getTotalProfileSteps() ? (
                            <>
                              {(profileStep === 4 || (profileStep === 6 && formData.collegeStatus === "student") || (profileStep === 7 && formData.collegeStatus === "student")) ? (
                                <button
                                  type="button"
                                  onClick={nextProfileStep}
                                  className="flex-1 px-4 py-3 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-all duration-200"
                                >
                                  Skip
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={nextProfileStep}
                                  className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-semibold hover:from-teal-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                                >
                                  Next
                                </button>
                              )}
                            </>
                          ) : (
                            <button
                              type="submit"
                              disabled={loading || !isProfileFormComplete()}
                              className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-semibold hover:from-teal-600 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
                            >
                              {loading ? "Setting up..." : "Complete Profile Setup"}
                            </button>
                          )}
                        </div>
                      </form>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}

export default Onboarding;
