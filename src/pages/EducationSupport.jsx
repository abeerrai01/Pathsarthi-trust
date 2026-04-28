import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { addDoc, collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../config/firebase";
import emailjs from '@emailjs/browser';

const indianStates = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", 
  "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli", "Daman and Diu", "Delhi", 
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", 
  "Karnataka", "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", 
  "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", 
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", 
  "Uttarakhand", "West Bengal"
];

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
    houseNumber: '',
    streetName: '',
    completeAddress: '',
    pincode: '',
    state: '',
    city: '',
    nation: 'India',
    photo: null,
    photoUrl: '',
    supportType: '',
    educationDetails: '',
    agreeTerms: false,
  });

  const [cities, setCities] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Cloudinary Upload States
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Carousel States
  const [approvedStudents, setApprovedStudents] = useState([]);
  const [isStudentsLoading, setIsStudentsLoading] = useState(true);
  const carouselRef = useRef(null);

  useEffect(() => {
    const q = query(collection(db, 'applications'), where('status', '==', 'approved'));
    const unsub = onSnapshot(q, (snapshot) => {
      const students = [];
      snapshot.forEach(doc => students.push({ id: doc.id, ...doc.data() }));
      setApprovedStudents(students);
      setIsStudentsLoading(false);
    }, (error) => {
      console.warn("Firestore snapshot listener error (rules may be updating):", error);
      setApprovedStudents([]);
      setIsStudentsLoading(false);
    });
    return () => unsub();
  }, []);

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
    <svg className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"></path></svg>
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

  const MapMarkerIcon = () => (
    <svg className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
  );

  const handleCloudinaryUpload = async (file) => {
    setIsUploadingPhoto(true);
    setUploadError('');
    
    // In production, configure Cloudinary variables in your .env file
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "dgmhz64fs";
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "ml_default";
    
    const uploadData = new FormData();
    uploadData.append("file", file);
    uploadData.append("upload_preset", uploadPreset);
    
    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: uploadData,
      });
      const data = await response.json();
      if (data.secure_url) {
        setFormData(prev => ({ ...prev, photoUrl: data.secure_url }));
      } else {
         setUploadError('Failed to upload image. Please verify your Cloudinary settings.');
      }
    } catch (error) {
      console.error("Cloudinary Upload Error:", error);
      setUploadError('Network error while uploading image.');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const fetchCitiesForState = async (stateName) => {
    try {
      const response = await fetch('https://countriesnow.space/api/v0.1/countries/state/cities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ country: "India", state: stateName })
      });
      const data = await response.json();
      if (!data.error && data.data) {
        setCities(data.data);
      } else {
        setCities([]);
      }
    } catch (err) {
      console.error("Failed to fetch cities", err);
      setCities([]);
    }
  };

  const handleChange = async (e) => {
    const { name, value, type, checked, files } = e.target;
    let newValue = type === 'checkbox' ? checked : (type === 'file' ? files[0] : value);
    
    if (name === 'pincode') {
      newValue = newValue.replace(/\D/g, '').slice(0, 6);
    }

    if (name === 'photo' && type === 'file' && files[0]) {
      const file = files[0];
      setFormData((prev) => ({ ...prev, photo: file }));
      
      const objectUrl = URL.createObjectURL(file);
      setPhotoPreviewUrl(objectUrl);
      
      handleCloudinaryUpload(file);
      return;
    }
    
    setFormData((prev) => ({ ...prev, [name]: newValue }));

    if (name === 'pincode' && newValue.length === 6) {
      try {
        const response = await fetch(`https://api.postalpincode.in/pincode/${newValue}`);
        const data = await response.json();
        if (data && data[0] && data[0].Status === 'Success' && data[0].PostOffice && data[0].PostOffice.length > 0) {
          const postOffice = data[0].PostOffice[0];
          const fetchedState = postOffice.State.trim();
          const fetchedCity = postOffice.District.trim();

          setFormData(prev => ({
            ...prev,
            state: fetchedState,
            city: fetchedCity 
          }));
          fetchCitiesForState(fetchedState);
        } else {
          throw new Error('Invalid or unsupported pincode from postalpincode API');
        }
      } catch (error) {
        // Fallback to Zippopotam API if PostalPincode API fails or returns error
        try {
          const altRes = await fetch(`https://api.zippopotam.us/IN/${newValue}`);
          if (altRes.ok) {
            const altData = await altRes.json();
            if (altData && altData.places && altData.places.length > 0) {
              const place = altData.places[0];
              const fetchedState = place.state.trim();
              const fetchedCity = place['place name'].trim();
              setFormData(prev => ({
                ...prev,
                state: fetchedState,
                city: fetchedCity
              }));
              fetchCitiesForState(fetchedState);
            }
          }
        } catch (e) {
          console.error("Zippopotam fallback failed", e);
        }
      }
      return;
    }

    if (name === 'state') {
      fetchCitiesForState(newValue);
      setFormData(prev => ({ ...prev, city: '' }));
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
    if (!formData.houseNumber.trim()) newErrors.houseNumber = 'House Number is required';
    if (!formData.streetName.trim()) newErrors.streetName = 'Street Name is required';
    if (!formData.completeAddress.trim()) newErrors.completeAddress = 'Complete Address is required';
    if (!formData.pincode.trim() || !/^\d{6}$/.test(formData.pincode)) newErrors.pincode = 'Valid 6-digit Pincode is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.nation.trim()) newErrors.nation = 'Nation is required';
    
    if (!formData.supportType) newErrors.supportType = 'Support Type is required';
    if (!formData.educationDetails.trim()) newErrors.educationDetails = 'Details are required';
    if (!formData.agreeTerms) newErrors.agreeTerms = 'You must agree to the Terms and Conditions';
    if (!formData.photo) newErrors.photo = 'Passport size photograph is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      setIsSubmitting(true);
      try {
        await addDoc(collection(db, "applications"), {
          firstName: formData.firstName,
          middleName: formData.middleName,
          lastName: formData.lastName,
          fatherName: formData.fatherName,
          motherName: formData.motherName,
          email: formData.email,
          phone: formData.phone,
          qualification: formData.qualification,
          houseNumber: formData.houseNumber,
          streetName: formData.streetName,
          completeAddress: formData.completeAddress,
          pincode: formData.pincode,
          state: formData.state,
          city: formData.city,
          nation: formData.nation,
          photoUrl: formData.photoUrl,
          supportType: formData.supportType,
          educationDetails: formData.educationDetails,
          status: "pending", 
          createdAt: new Date(),
        });
        
        const templateParams = {
          first_name: formData.firstName,
          middle_name: formData.middleName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          state: formData.state,
          city: formData.city,
          support_type: formData.supportType,
          education_details: formData.educationDetails
        };

        try {
          await emailjs.send(
            import.meta.env.VITE_EMAILJS_SERVICE_ID || "YOUR_SERVICE_ID",
            import.meta.env.VITE_EMAILJS_TEMPLATE_ID || "YOUR_TEMPLATE_ID",
            templateParams,
            import.meta.env.VITE_EMAILJS_PUBLIC_KEY || "YOUR_PUBLIC_KEY"
          );
        } catch (emailError) {
          console.error("Failed to send email confirmation:", emailError);
        }

        setIsSuccess(true);
        // clear form
        setFormData({
          firstName: '', middleName: '', lastName: '', fatherName: '', motherName: '',
          email: '', phone: '', qualification: '', houseNumber: '', streetName: '',
          completeAddress: '', pincode: '', state: '', city: '', nation: 'India',
          photo: null, photoUrl: '', supportType: '', educationDetails: '', agreeTerms: false
        });
        setPhotoPreviewUrl(null);
      } catch (error) {
        console.error("Error submitting application:", error);
        alert("Failed to submit the application. Please try again later.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Header Section */}
      <div className="py-12 px-4 max-w-6xl mx-auto w-full">
        <div className="flex flex-col md:flex-row items-center justify-between text-center md:text-left">
          <div className="md:w-1/2 mb-8 md:mb-0">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight"
            >
              Empowering Education for Every Dream
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg text-gray-600 max-w-xl mx-auto md:mx-0 mb-4"
            >
              At Pathsarthi Trust, we believe that no student should be held back due to lack of resources or guidance. Whether you aim to build a career in finance, law, or any specialized field, we are here to support your journey.
            </motion.p>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-lg font-semibold text-indigo-600 max-w-xl mx-auto md:mx-0"
            >
              Apply today and take the first step toward your future.
            </motion.p>
          </div>
          <motion.div 
             initial={{ opacity: 0, scale: 0.8 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ duration: 0.6, delay: 0.3 }}
             className="md:w-1/2 flex justify-center md:justify-end"
          >
             <img src="/Forms.gif" alt="Educational Support Form" className="w-56 md:w-72 h-auto mix-blend-multiply" />
          </motion.div>
        </div>
      </div>

      {/* About the Program & What We Offer */}
      <div className="max-w-4xl mx-auto px-4 py-8 w-full z-10">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center md:text-left">What is the Education Support Program?</h2>
          <p className="text-gray-600 mb-4">The Pathsarthi Education Support Program is designed to help deserving students gain access to quality education, mentorship, and financial or legal guidance.</p>
          <p className="text-gray-600 font-semibold mb-2">We aim to:</p>
          <ul className="list-disc pl-5 mb-6 text-gray-600 space-y-2">
            <li>Support students facing financial challenges</li>
            <li>Guide students in choosing the right career path</li>
            <li>Provide access to resources for professional growth</li>
            <li>Encourage talent across all domains</li>
          </ul>
          <p className="text-indigo-600 font-semibold italic border-l-4 border-indigo-600 pl-4 py-2">
            Our mission is simple — your potential should never be limited by your circumstances.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center md:text-left">Our Areas of Support</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-100 flex flex-col h-full">
              <div className="text-indigo-600 mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <h3 className="font-bold text-lg mb-2 text-gray-800">Financial Assistance</h3>
              <p className="text-gray-600 text-sm flex-grow">Support for tuition fees, study materials, and academic expenses.</p>
            </div>
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-100 flex flex-col h-full">
              <div className="text-blue-600 mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"></path></svg>
              </div>
              <h3 className="font-bold text-lg mb-2 text-gray-800">Legal Education Guidance</h3>
              <p className="text-gray-600 text-sm flex-grow">Mentorship and direction for students interested in pursuing law careers.</p>
            </div>
            <div className="bg-teal-50 p-6 rounded-lg border border-teal-100 flex flex-col h-full">
              <div className="text-teal-600 mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
              </div>
              <h3 className="font-bold text-lg mb-2 text-gray-800">Other Specialized Fields</h3>
              <p className="text-gray-600 text-sm flex-grow">Custom support based on your chosen career path and requirements.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Form Section */}
      <div className="max-w-4xl mx-auto px-4 py-4 w-full relative z-10 mb-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white rounded-lg shadow-sm p-8 md:p-10 border border-gray-100"
        >
          {isSuccess ? (
            <div className="text-center py-16">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <span className="text-5xl">🎉</span>
              </motion.div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Application Submitted Successfully!</h2>
              <p className="text-gray-600 mb-2 max-w-md mx-auto text-lg">Thank you for applying to the Pathsarthi Education Support Program.</p>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">Our team will review your application and contact you shortly.</p>
              <p className="text-indigo-600 font-bold text-lg border-t-2 border-indigo-100 pt-6 mb-8 max-w-sm mx-auto">Keep working towards your dreams — we’re with you.</p>
              <button 
                onClick={() => setIsSuccess(false)}
                className="px-8 py-3 bg-[#f06020] text-white font-semibold rounded-lg hover:bg-[#d8551a] transition shadow-md"
              >
                Submit Another Application
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-10">
              {/* Form Intro & Guidelines */}
              <div className="bg-blue-50/50 p-6 md:p-8 rounded-lg border border-blue-100 mb-8">
                 <h2 className="text-2xl font-bold text-gray-800 mb-2">Apply for Support</h2>
                 <p className="text-gray-600 mb-5">Fill out the form below with accurate details. Our team carefully reviews every application to ensure support reaches those who truly need it.</p>
                 <p className="text-indigo-600 font-medium text-sm mb-6 pb-6 border-b border-blue-200">Make sure all information is correct before submitting.</p>
                 
                 <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
                   <svg className="w-5 h-5 text-indigo-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                   Application Guidelines
                 </h3>
                 <ul className="list-disc list-inside text-gray-700 space-y-2 text-sm pl-2">
                   <li>Provide genuine and accurate information</li>
                   <li>Upload a clear passport-size photograph</li>
                   <li>Clearly mention your desired education field</li>
                   <li>Ensure your contact details are active</li>
                   <li className="text-red-500 font-medium list-none flex items-center mt-3"><span className="mr-2">⚠️</span> Applications with incomplete information may not be considered</li>
                 </ul>
              </div>

              {/* Personal Details Section */}
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-6 pb-2 border-b border-gray-200 flex items-center">
                  <span className="text-indigo-600 mr-3">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
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
                        className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${errors.firstName ? 'border-red-500 bg-red-50 focus:ring-red-500' : 'border-gray-200 focus:ring-indigo-600 focus:border-indigo-600'} focus:outline-none focus:ring-1 transition-colors`}
                        placeholder="Rahul" 
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
                        placeholder="Kumar" 
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
                        className={`w-full pl-10 pr-4 py-3 rounded-lg border ${errors.lastName ? 'border-red-500 bg-red-50 focus:ring-red-500' : 'border-gray-200 focus:ring-indigo-600 focus:border-indigo-600'} focus:outline-none focus:ring-2 transition-colors`}
                        placeholder="Sharma" 
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
                        className={`w-full pl-10 pr-4 py-3 rounded-lg border ${errors.fatherName ? 'border-red-500 bg-red-50 focus:ring-red-500' : 'border-gray-200 focus:ring-indigo-600 focus:border-indigo-600'} focus:outline-none focus:ring-2 transition-colors`}
                        placeholder="Satish Sharma" 
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
                        className={`w-full pl-10 pr-4 py-3 rounded-lg border ${errors.motherName ? 'border-red-500 bg-red-50 focus:ring-red-500' : 'border-gray-200 focus:ring-indigo-600 focus:border-indigo-600'} focus:outline-none focus:ring-2 transition-colors`}
                        placeholder="Sunita Sharma" 
                      />
                    </div>
                    {errors.motherName && <p className="text-red-500 text-xs mt-1">{errors.motherName}</p>}
                  </div>
                </div>
              </div>

              {/* Contact Information Section */}
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-6 pb-2 border-b border-gray-200 flex items-center">
                  <span className="text-indigo-600 mr-3">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
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
                        className={`w-full pl-10 pr-4 py-3 rounded-lg border ${errors.email ? 'border-red-500 bg-red-50 focus:ring-red-500' : 'border-gray-200 focus:ring-indigo-600 focus:border-indigo-600'} focus:outline-none focus:ring-2 transition-colors`}
                        placeholder="rahul.sharma@example.com" 
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
                        className={`w-full pl-10 pr-4 py-3 rounded-lg border ${errors.phone ? 'border-red-500 bg-red-50 focus:ring-red-500' : 'border-gray-200 focus:ring-indigo-600 focus:border-indigo-600'} focus:outline-none focus:ring-2 transition-colors`}
                        placeholder="9876543210" 
                      />
                    </div>
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                  </div>
                </div>
              </div>

              {/* Address Section */}
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-6 pb-2 border-b border-gray-200 flex items-center">
                  <span className="text-indigo-600 mr-3">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
                  </span>
                  Residential Address
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* House Number */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">House/Flat Number *</label>
                    <div className="relative">
                      <HomeIcon />
                      <input 
                        type="text" 
                        name="houseNumber" 
                        value={formData.houseNumber} 
                        onChange={handleChange}
                        className={`w-full pl-10 pr-4 py-3 rounded-lg border ${errors.houseNumber ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:ring-indigo-600 focus:border-indigo-600'} focus:outline-none focus:ring-2 transition-colors`}
                        placeholder="Flat 101, B-Wing" 
                      />
                    </div>
                    {errors.houseNumber && <p className="text-red-500 text-xs mt-1">{errors.houseNumber}</p>}
                  </div>
                  {/* Street Name */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Street/Landmark Name *</label>
                    <div className="relative">
                      <MapMarkerIcon />
                      <input 
                        type="text" 
                        name="streetName" 
                        value={formData.streetName} 
                        onChange={handleChange}
                        className={`w-full pl-10 pr-4 py-3 rounded-lg border ${errors.streetName ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:ring-indigo-600 focus:border-indigo-600'} focus:outline-none focus:ring-2 transition-colors`}
                        placeholder="M.G. Road" 
                      />
                    </div>
                    {errors.streetName && <p className="text-red-500 text-xs mt-1">{errors.streetName}</p>}
                  </div>
                </div>

                <div className="relative mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Complete Address *</label>
                    <div className="relative">
                      <MapMarkerIcon />
                      <textarea 
                        name="completeAddress" 
                        value={formData.completeAddress} 
                        onChange={handleChange}
                        rows="2"
                        className={`w-full pl-10 pr-4 py-3 rounded-lg border resize-none ${errors.completeAddress ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:ring-indigo-600 focus:border-indigo-600'} focus:outline-none focus:ring-2 transition-colors`}
                        placeholder="Your full address here..." 
                      ></textarea>
                    </div>
                    {errors.completeAddress && <p className="text-red-500 text-xs mt-1">{errors.completeAddress}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {/* Pincode */}
                  <div className="relative md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pincode *</label>
                    <input 
                      type="text" 
                      name="pincode" 
                      value={formData.pincode} 
                      onChange={handleChange}
                      maxLength="6"
                      className={`w-full px-4 py-3 rounded-lg border ${errors.pincode ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:ring-indigo-600 focus:border-indigo-600'} focus:outline-none focus:ring-2 transition-colors`}
                      placeholder="110001" 
                    />
                    {errors.pincode && <p className="text-red-500 text-xs mt-1">{errors.pincode}</p>}
                    <p className="text-[10px] text-gray-400 mt-1">Auto-fills State & City</p>
                  </div>
                  {/* State */}
                  <div className="relative md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                    <select 
                      name="state" 
                      value={formData.state} 
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-lg border appearance-none ${errors.state ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:ring-indigo-600 focus:border-indigo-600'} focus:outline-none focus:ring-2 transition-colors`}
                    >
                      <option value="">Select State</option>
                      {indianStates.map((s, i) => (
                        <option key={i} value={s}>{s}</option>
                      ))}
                      {/* Fallback option if autofilled state spelling doesn't match list exactly */}
                      {formData.state && !indianStates.includes(formData.state) && (
                        <option value={formData.state}>{formData.state}</option>
                      )}
                    </select>
                    {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
                  </div>
                  {/* City */}
                  <div className="relative md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">City/District *</label>
                    {cities.length > 0 ? (
                      <select 
                        name="city" 
                        value={formData.city} 
                        onChange={handleChange}
                        className={`w-full px-4 py-3 rounded-lg border appearance-none ${errors.city ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:ring-indigo-600 focus:border-indigo-600'} focus:outline-none focus:ring-2 transition-colors`}
                      >
                        <option value="">Select City</option>
                        {cities.map((c, i) => (
                          <option key={i} value={c}>{c}</option>
                        ))}
                        {/* Fallback option if autofilled city isn't in fetched cities dropdown */}
                        {formData.city && !cities.includes(formData.city) && (
                          <option value={formData.city}>{formData.city}</option>
                        )}
                      </select>
                    ) : (
                      <input 
                        type="text" 
                        name="city" 
                        value={formData.city} 
                        onChange={handleChange}
                        className={`w-full px-4 py-3 rounded-lg border ${errors.city ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:ring-indigo-600 focus:border-indigo-600'} focus:outline-none focus:ring-2 transition-colors`}
                        placeholder="City" 
                      />
                    )}
                    {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                  </div>
                  {/* Nation */}
                  <div className="relative md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nation *</label>
                    <input 
                      type="text" 
                      name="nation" 
                      value={formData.nation} 
                      readOnly
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-100 text-gray-600 focus:outline-none cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              {/* Academic Details */}
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-6 pb-2 border-b border-gray-200 flex items-center">
                  <span className="text-indigo-600 mr-3">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"></path></svg>
                  </span>
                  Academic Details
                </h3>
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Highest Qualification *</label>
                    <div className="relative">
                      <AcademicIcon />
                      <select 
                        name="qualification" 
                        value={formData.qualification} 
                        onChange={handleChange}
                        className={`w-full pl-10 pr-10 py-3 rounded-lg border appearance-none ${errors.qualification ? 'border-red-500 bg-red-50 focus:ring-red-500' : 'border-gray-200 focus:ring-indigo-600 focus:border-indigo-600'} focus:outline-none focus:ring-2 transition-colors`}
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
              </div>

              {/* Passport Size Photo - Centered & Separate */}
              <div className="py-6 border-t border-b border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 text-center mb-6">
                  Applicant Photograph
                </h3>
                <div className="max-w-md mx-auto">
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 text-center mb-2">Upload Passport Size Photograph *</label>
                    <div className={`mt-1 flex justify-center px-6 pt-8 pb-8 border-2 border-dashed rounded-xl transition-colors ${errors.photo || uploadError ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:bg-gray-50'} bg-white relative overflow-hidden`}>
                      <div className="space-y-2 text-center flex flex-col items-center z-10">
                        {photoPreviewUrl ? (
                          <div className="relative w-32 h-40 mb-4 rounded-md overflow-hidden border-2 border-indigo-200 shadow-sm">
                            <img src={photoPreviewUrl} alt="Passport Preview" className="w-full h-full object-cover" />
                            {isUploadingPhoto && (
                              <div className="absolute inset-0 bg-white/70 flex items-center justify-center flex-col">
                                <svg className="animate-spin h-6 w-6 text-[#f06020] mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span className="text-xs font-semibold text-gray-800">Uploading...</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <UploadIcon />
                        )}
                        <div className="flex text-sm text-gray-600 justify-center">
                          <label className="relative cursor-pointer bg-transparent rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                            <span>{photoPreviewUrl ? 'Change photo' : 'Upload a file'}</span>
                            <input type="file" name="photo" accept="image/*" onChange={handleChange} className="sr-only" />
                          </label>
                          {!photoPreviewUrl && <p className="pl-1">or drag and drop</p>}
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                        
                        {formData.photoUrl && !isUploadingPhoto && (
                           <div className="mt-2 text-xs font-medium text-green-600 flex items-center justify-center bg-green-50 px-3 py-1 rounded-full border border-green-200">
                             <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                             Upload successful
                           </div>
                        )}
                      </div>
                    </div>
                    {(errors.photo || uploadError) && <p className="text-red-500 text-xs mt-2 text-center">{errors.photo || uploadError}</p>}
                  </div>
                </div>
              </div>

              {/* Education Support Requirement */}
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-6 pb-2 border-b border-gray-200 flex items-center">
                  <span className="text-indigo-600 mr-3">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
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
                        className={`w-full pl-10 pr-10 py-3 rounded-lg border appearance-none ${errors.supportType ? 'border-red-500 bg-red-50 focus:ring-red-500' : 'border-gray-200 focus:ring-indigo-600 focus:border-indigo-600'} focus:outline-none focus:ring-2 transition-colors`}
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
              <div className="pt-8 border-t border-gray-200">
                <div className="mb-8 bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <h4 className="font-bold text-gray-800 mb-3 flex items-center">
                    <span className="text-red-500 mr-2 text-xl">⚠️</span> Terms & Conditions
                  </h4>
                  <p className="text-sm text-gray-600 mb-3 font-medium">By submitting this application:</p>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-2 mb-5 pl-1">
                    <li>You confirm that all provided information is true</li>
                    <li>You agree that the trust may verify your details</li>
                    <li>Selection is based on eligibility and availability of resources</li>
                    <li>The decision of Pathsarthi Trust will be final</li>
                  </ul>

                  <div className="flex items-start mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center h-5 mt-0.5">
                      <input 
                        id="agreeTerms" 
                        name="agreeTerms" 
                        type="checkbox" 
                        checked={formData.agreeTerms}
                        onChange={handleChange}
                        className="w-5 h-5 border border-gray-300 rounded bg-white focus:ring-2 focus:ring-indigo-500 text-indigo-600 cursor-pointer"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="agreeTerms" className={`font-semibold cursor-pointer select-none ${errors.agreeTerms ? 'text-red-500' : 'text-gray-800'}`}>
                        I agree to all the terms and conditions above *
                      </label>
                    </div>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-[#f06020] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[#d8551a] transition-colors shadow-sm"
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
        <div className="mt-4 text-center text-gray-500 flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-12 mb-12">
          <div className="flex items-center">
            <svg className="w-8 h-8 text-yellow-500 mr-2" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
            <span className="font-semibold text-gray-700 tracking-wide uppercase text-sm">100+ students supported</span>
          </div>
          <div className="w-1.5 h-1.5 bg-gray-300 rounded-full hidden md:block"></div>
          <div className="flex items-center">
            <svg className="w-8 h-8 text-indigo-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
            <span className="font-semibold text-gray-700 tracking-wide uppercase text-sm">Trusted by community</span>
          </div>
        </div>

        {/* Students We Support Carousel */}
        <div className="max-w-6xl mx-auto my-16 px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Students We Support</h2>
            <div className="w-24 h-1.5 bg-[#f06020] mx-auto rounded-full mb-4"></div>
            <p className="text-gray-600 max-w-2xl mx-auto">Meet some of the bright minds who have received support from the Pathsarthi Education Support Program.</p>
          </div>
          
          {isStudentsLoading ? (
            <div className="flex justify-center items-center py-12">
              <svg className="animate-spin h-10 w-10 text-[#f06020]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            </div>
          ) : approvedStudents.length === 0 ? (
            <div className="bg-gray-50 rounded-2xl p-12 text-center text-gray-500 border border-gray-100 shadow-inner flex flex-col items-center">
              <svg className="w-16 h-16 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14v6m-3-3l3 3 3-3"></path></svg>
              <p className="mt-4 text-lg font-medium">Be the first to join our supported students gallery!</p>
            </div>
          ) : (
            <div className="relative group">
              <div 
                ref={carouselRef}
                className="flex overflow-x-auto gap-6 pb-8 pt-4 px-4 snap-x snap-mandatory hide-scrollbar justify-center md:justify-start"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {approvedStudents.map(student => (
                  <motion.div 
                    whileHover={{ scale: 1.02, translateY: -4 }}
                    key={student.id} 
                    className="shrink-0 w-72 md:w-80 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden snap-center"
                  >
                    <div className="h-40 bg-gradient-to-br from-indigo-100 to-amber-50 relative">
                      {student.photoUrl ? (
                         <img src={student.photoUrl} alt={student.firstName} className="w-full h-full object-cover" />
                      ) : (
                         <div className="w-full h-full flex items-center justify-center text-indigo-300">
                           <UserIcon />
                         </div>
                      )}
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-[#f06020] shadow-sm">
                        {student.supportType === 'Financial' ? '💸 Financial' : student.supportType === 'Legal' ? '⚖️ Legal' : '🎓 Educational'}
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-1 line-clamp-1">{student.firstName} {student.lastName}</h3>
                      <p className="text-indigo-600 font-semibold text-sm mb-4 line-clamp-1">{student.desiredField || 'Higher Education'}</p>
                      
                      <div className="bg-orange-50 rounded-lg p-3 border border-orange-100">
                        <p className="text-xs text-gray-700 italic flex items-start">
                          <span className="text-[#f06020] mr-1">"</span>
                          Supported by Pathsarthi Trust towards their amazing journey.
                          <span className="text-[#f06020] ml-1">"</span>
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Info Area */}
        <div className="bg-gradient-to-br from-[#f06020] to-[#f5a623] text-white rounded-lg p-8 md:p-12 text-center max-w-4xl mx-auto shadow-sm">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">A Small Step Today, A Big Future Tomorrow</h2>
          <p className="text-white/90 mb-8 max-w-2xl mx-auto text-lg leading-relaxed">Pathsarthi Trust has supported hundreds of students in achieving their dreams. You could be next.</p>
          
          <div className="border-t border-white/20 pt-8 mt-4">
            <h3 className="text-xl font-bold mb-4">Need Help?</h3>
            <p className="text-white/90 mb-8 max-w-xl mx-auto">If you have any questions or face any issues while applying, feel free to reach out to us.</p>
            
            <div className="flex flex-col sm:flex-row justify-center items-center gap-6 sm:gap-12">
              <div className="flex items-center bg-black/10 px-6 py-3 rounded-full">
                <svg className="w-5 h-5 mr-3 text-yellow-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                <span className="font-medium tracking-wide">pathsarthi2022@gmail.com</span>
              </div>
              <div className="flex items-center bg-black/10 px-6 py-3 rounded-full">
                <svg className="w-5 h-5 mr-3 text-yellow-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                <span className="font-medium tracking-wide">+91-8958421200</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EducationSupport;
