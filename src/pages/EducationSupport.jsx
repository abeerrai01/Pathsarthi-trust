import React, { useState } from 'react';
import { motion } from 'framer-motion';

const EducationSupport = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    fatherName: '',
    motherName: '',
    email: '',
    phone: '',
    qualification: '',
    address: '',
    photo: null,
    supportType: '',
    educationDetails: '',
    agreeTerms: false,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // SVG Icons
  const UserIcon = () => (
    <svg className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
  );
  
  const MailIcon = () => (
    <svg className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
  );

  const PhoneIcon = () => (
    <svg className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
  );

  const AcademicIcon = () => (
    <svg className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"></path></svg>
  );

  const HomeIcon = () => (
    <svg className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
  );

  const UploadIcon = () => (
    <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
  );

  const BriefcaseIcon = () => (
    <svg className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
  );

  const DetailsIcon = () => (
    <svg className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
  );

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'checkbox') {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (type === 'file') {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First Name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last Name is required';
    if (!formData.fatherName.trim()) newErrors.fatherName = "Father's Name is required";
    if (!formData.motherName.trim()) newErrors.motherName = "Mother's Name is required";
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone Number is required';
    } else if (!/^\d{10,15}$/.test(formData.phone)) {
      newErrors.phone = 'Phone Number must be valid digits';
    }
    if (!formData.qualification.trim()) newErrors.qualification = 'Highest Qualification is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.supportType) newErrors.supportType = 'Support Type is required';
    if (!formData.educationDetails.trim()) newErrors.educationDetails = 'Details are required';
    if (!formData.agreeTerms) newErrors.agreeTerms = 'You must agree to the Terms and Conditions';
    if (!formData.photo) newErrors.photo = 'Passport size photograph is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      setIsSubmitting(true);
      // Simulate API call
      setTimeout(() => {
        setIsSubmitting(false);
        setIsSuccess(true);
        // Optional: clear form
        setFormData({
          firstName: '',
          middleName: '',
          lastName: '',
          fatherName: '',
          motherName: '',
          email: '',
          phone: '',
          qualification: '',
          address: '',
          photo: null,
          supportType: '',
          educationDetails: '',
          agreeTerms: false,
        });
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Banner / Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-teal-500 py-12 px-4 mt-0">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between">
          <div className="text-center md:text-left md:w-1/2 mb-8 md:mb-0">
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight"
            >
              Empowering Education for Every Student
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-blue-100 max-w-xl mx-auto md:mx-0"
            >
              Apply for financial, legal, or specialized educational support through Pathsarthi Trust.
            </motion.p>
          </div>
          <motion.div 
             initial={{ opacity: 0, scale: 0.8 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ duration: 0.6, delay: 0.3 }}
             className="md:w-1/2 flex justify-center md:justify-end"
          >
             <img src="/Forms.gif" alt="Educational Support Form" className="w-64 md:w-80 md:h-auto rounded-2xl drop-shadow-2xl object-cover mix-blend-multiply" style={{ mixBlendMode: 'luminosity' }} />
             {/* Note: if the gif has a background, it might show. Adjust mix-blend-mode or styling as suitable. Keeping it simple first. */}
          </motion.div>
        </div>
      </div>

      {/* Main Form Section */}
      <div className="max-w-4xl mx-auto px-4 py-12 w-full -mt-10 relative z-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white rounded-2xl shadow-xl p-8 md:p-10 border border-gray-100"
        >
          {isSuccess ? (
            <div className="text-center py-16">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
              </motion.div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Application Submitted Successfully!</h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">Our team will review your application and contact you soon. Thank you for reaching out to Pathsarthi Trust.</p>
              <button 
                onClick={() => setIsSuccess(false)}
                className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition shadow-md"
              >
                Submit Another Application
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Personal Details Section */}
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-gray-100 flex items-center">
                  <span className="bg-blue-100 text-blue-600 p-2 rounded-lg mr-3">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                  </span>
                  Personal Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* First Name */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                    <div className="relative">
                      <UserIcon />
                      <input 
                        type="text" 
                        name="firstName" 
                        value={formData.firstName} 
                        onChange={handleChange}
                        className={`w-full pl-10 pr-4 py-3 rounded-lg border ${errors.firstName ? 'border-red-500 bg-red-50 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'} focus:outline-none focus:ring-2 transition-colors`}
                        placeholder="John" 
                      />
                    </div>
                    {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                  </div>
                  {/* Middle Name */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Middle Name</label>
                    <div className="relative">
                      <UserIcon />
                      <input 
                        type="text" 
                        name="middleName" 
                        value={formData.middleName} 
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                        placeholder="Edward" 
                      />
                    </div>
                  </div>
                  {/* Last Name */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                    <div className="relative">
                      <UserIcon />
                      <input 
                        type="text" 
                        name="lastName" 
                        value={formData.lastName} 
                        onChange={handleChange}
                        className={`w-full pl-10 pr-4 py-3 rounded-lg border ${errors.lastName ? 'border-red-500 bg-red-50 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'} focus:outline-none focus:ring-2 transition-colors`}
                        placeholder="Doe" 
                      />
                    </div>
                    {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                  </div>
                  {/* Father's Name */}
                  <div className="relative md:col-span-1 border-t-0 md:border-t-0">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Father's Name *</label>
                    <div className="relative">
                      <UserIcon />
                      <input 
                        type="text" 
                        name="fatherName" 
                        value={formData.fatherName} 
                        onChange={handleChange}
                        className={`w-full pl-10 pr-4 py-3 rounded-lg border ${errors.fatherName ? 'border-red-500 bg-red-50 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'} focus:outline-none focus:ring-2 transition-colors`}
                        placeholder="Father's Name" 
                      />
                    </div>
                    {errors.fatherName && <p className="text-red-500 text-xs mt-1">{errors.fatherName}</p>}
                  </div>
                  {/* Mother's Name */}
                  <div className="relative md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mother's Name *</label>
                    <div className="relative">
                      <UserIcon />
                      <input 
                        type="text" 
                        name="motherName" 
                        value={formData.motherName} 
                        onChange={handleChange}
                        className={`w-full pl-10 pr-4 py-3 rounded-lg border ${errors.motherName ? 'border-red-500 bg-red-50 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'} focus:outline-none focus:ring-2 transition-colors`}
                        placeholder="Mother's Name" 
                      />
                    </div>
                    {errors.motherName && <p className="text-red-500 text-xs mt-1">{errors.motherName}</p>}
                  </div>
                </div>
              </div>

              {/* Contact Information Section */}
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-gray-100 flex items-center">
                  <span className="bg-teal-100 text-teal-600 p-2 rounded-lg mr-3">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                  </span>
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                    <div className="relative">
                      <MailIcon />
                      <input 
                        type="email" 
                        name="email" 
                        value={formData.email} 
                        onChange={handleChange}
                        className={`w-full pl-10 pr-4 py-3 rounded-lg border ${errors.email ? 'border-red-500 bg-red-50 focus:ring-red-500' : 'border-gray-300 focus:ring-teal-500'} focus:outline-none focus:ring-2 transition-colors`}
                        placeholder="john.doe@example.com" 
                      />
                    </div>
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  </div>
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                    <div className="relative">
                      <PhoneIcon />
                      <input 
                        type="tel" 
                        name="phone" 
                        value={formData.phone} 
                        onChange={handleChange}
                        className={`w-full pl-10 pr-4 py-3 rounded-lg border ${errors.phone ? 'border-red-500 bg-red-50 focus:ring-red-500' : 'border-gray-300 focus:ring-teal-500'} focus:outline-none focus:ring-2 transition-colors`}
                        placeholder="+91 9876543210" 
                      />
                    </div>
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                  </div>
                </div>
              </div>

              {/* Academic & Upload Section */}
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-gray-100 flex items-center">
                  <span className="bg-purple-100 text-purple-600 p-2 rounded-lg mr-3">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 14l9-5-9-5-9 5 9 5z"></path></svg>
                  </span>
                  Academic & Document Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Highest Qualification *</label>
                      <div className="relative">
                        <AcademicIcon />
                        <select 
                          name="qualification" 
                          value={formData.qualification} 
                          onChange={handleChange}
                          className={`w-full pl-10 pr-10 py-3 rounded-lg border appearance-none ${errors.qualification ? 'border-red-500 bg-red-50 focus:ring-red-500' : 'border-gray-300 focus:ring-purple-500'} focus:outline-none focus:ring-2 transition-colors`}
                        >
                          <option value="">Select Qualification</option>
                          <option value="High School">High School (10th)</option>
                          <option value="Higher Secondary">Higher Secondary (12th)</option>
                          <option value="Undergraduate">Undergraduate</option>
                          <option value="Postgraduate">Postgraduate</option>
                          <option value="Other">Other</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                      </div>
                      {errors.qualification && <p className="text-red-500 text-xs mt-1">{errors.qualification}</p>}
                    </div>

                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Residential Address *</label>
                      <div className="relative">
                        <HomeIcon />
                        <textarea 
                          name="address" 
                          value={formData.address} 
                          onChange={handleChange}
                          rows="3"
                          className={`w-full pl-10 pr-4 py-3 rounded-lg border resize-none ${errors.address ? 'border-red-500 bg-red-50 focus:ring-red-500' : 'border-gray-300 focus:ring-purple-500'} focus:outline-none focus:ring-2 transition-colors`}
                          placeholder="Your full address here..." 
                        ></textarea>
                      </div>
                      {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                    </div>
                  </div>

                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Passport Size Photograph *</label>
                    <div className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-lg transition-colors ${errors.photo ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:bg-gray-50'} bg-white`}>
                      <div className="space-y-1 text-center">
                        <UploadIcon />
                        <div className="flex text-sm text-gray-600 justify-center">
                          <label className="relative cursor-pointer bg-white rounded-md font-medium text-purple-600 hover:text-purple-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-purple-500">
                            <span>Upload a file</span>
                            <input type="file" name="photo" accept="image/*" onChange={handleChange} className="sr-only" />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                        {formData.photo && (
                          <p className="text-sm font-semibold text-green-600 mt-2">
                            Selected file: {formData.photo.name}
                          </p>
                        )}
                      </div>
                    </div>
                    {errors.photo && <p className="text-red-500 text-xs mt-1">{errors.photo}</p>}
                  </div>
                </div>
              </div>

              {/* Education Support Requirement */}
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-gray-100 flex items-center">
                  <span className="bg-indigo-100 text-indigo-600 p-2 rounded-lg mr-3">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                  </span>
                  Support Request Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Education Support Type *</label>
                    <div className="relative">
                      <BriefcaseIcon />
                      <select 
                        name="supportType" 
                        value={formData.supportType} 
                        onChange={handleChange}
                        className={`w-full pl-10 pr-10 py-3 rounded-lg border appearance-none ${errors.supportType ? 'border-red-500 bg-red-50 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'} focus:outline-none focus:ring-2 transition-colors`}
                      >
                        <option value="">Select Support Type</option>
                        <option value="Financial">Financial Support</option>
                        <option value="Law">Law/Legal Education</option>
                        <option value="Other">Other Specific Support</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                    </div>
                    {errors.supportType && <p className="text-red-500 text-xs mt-1">{errors.supportType}</p>}
                  </div>

                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Desired Education Details *</label>
                    <div className="relative">
                      <DetailsIcon />
                      <input 
                        type="text" 
                        name="educationDetails" 
                        value={formData.educationDetails} 
                        onChange={handleChange}
                        className={`w-full pl-10 pr-4 py-3 rounded-lg border ${errors.educationDetails ? 'border-red-500 bg-red-50 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'} focus:outline-none focus:ring-2 transition-colors`}
                        placeholder="e.g., Financial -> CA, Law -> Corporate Law" 
                      />
                    </div>
                    {errors.educationDetails && <p className="text-red-500 text-xs mt-1">{errors.educationDetails}</p>}
                  </div>
                </div>
              </div>

              {/* Terms and Submit */}
              <div className="pt-4 border-t border-gray-100">
                <div className="flex items-start mb-6">
                  <div className="flex items-center h-5">
                    <input 
                      id="agreeTerms" 
                      name="agreeTerms" 
                      type="checkbox" 
                      checked={formData.agreeTerms}
                      onChange={handleChange}
                      className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-blue-300"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="agreeTerms" className={`font-medium ${errors.agreeTerms ? 'text-red-500' : 'text-gray-700'}`}>I agree to the terms and conditions of Pathsarthi Trust *</label>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full relative py-4 px-6 bg-gradient-to-r from-blue-600 to-teal-500 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 overflow-hidden"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting Application...
                    </div>
                  ) : (
                    <span>Submit Application</span>
                  )}
                </button>
              </div>
            </form>
          )}
        </motion.div>

        {/* Credibility Section */}
        <div className="mt-12 text-center text-gray-500 flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-12">
          <div className="flex items-center">
            <svg className="w-8 h-8 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
            <span className="font-semibold text-gray-700">1000+ students supported</span>
          </div>
          <div className="w-1.5 h-1.5 bg-gray-300 rounded-full hidden md:block"></div>
          <div className="flex items-center">
            <svg className="w-8 h-8 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
            <span className="font-semibold text-gray-700">Trusted by community</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EducationSupport;
