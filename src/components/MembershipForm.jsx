import React, { useState, useRef, useEffect } from 'react';
import { auth, db } from '../config/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { collection, addDoc, doc, updateDoc, query, where, getDocs } from 'firebase/firestore';
import { uploadToCloudinary } from '../utils/cloudinary';
import { UploadCloud, User, QrCode, Copy, Check } from 'lucide-react';
// Remove import RazorpayButton from './RazorpayButton';

const RAZORPAY_KEY = process.env.REACT_APP_RAZORPAY_KEY_ID;

const indianStates = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", 
  "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli", "Daman and Diu", "Delhi", 
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", 
  "Karnataka", "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", 
  "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", 
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", 
  "Uttarakhand", "West Bengal"
];

const initialForm = {
  fullName: '',
  dob: '',
  age: '',
  gender: '',
  city: '',
  state: '',
  pincode: '',
  email: '',
  phone: '',
  reference: '',
  profilePhotoUrl: '',
  image: '',
};

const calculateAge = (dobString) => {
  if (!dobString) return '';
  const today = new Date();
  const birthDate = new Date(dobString);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age >= 0 ? age.toString() : '';
};

const calculateValidityDates = () => {
  const today = new Date();
  const nextYear = new Date();
  nextYear.setFullYear(today.getFullYear() + 1);
  
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  const fromStr = today.toLocaleDateString('en-IN', options);
  const toStr = nextYear.toLocaleDateString('en-IN', options);
  
  return { from: fromStr, to: toStr };
};

const MembershipForm = () => {
  const [form, setForm] = useState(initialForm);
  const [step, setStep] = useState('form'); // form | payment | done
  const [loading, setLoading] = useState(false);
  // No OTP, no recaptcha
  const [toast, setToast] = useState(null);
  const [paymentId, setPaymentId] = useState('');
  const [createdDocId, setCreatedDocId] = useState('');

  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [cities, setCities] = useState([]);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const createdDocIdRef = useRef('');
  const formRef = useRef(form);

  useEffect(() => {
    formRef.current = form;
  }, [form]);

  const [paymentMethod, setPaymentMethod] = useState('razorpay'); // razorpay | upi_qr
  const [isQRPayment, setIsQRPayment] = useState(false);
  const [copied, setCopied] = useState(false);
  const [screenshotFile, setScreenshotFile] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);

  const handleScreenshotChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setScreenshotFile(file);
      setScreenshotPreview(URL.createObjectURL(file));
    }
  };

  const handlePayManualUPI = async (e) => {
    if (e) e.preventDefault();
    if (!screenshotFile) {
      showToast('Please upload a screenshot of your payment.', 'error');
      return;
    }
    setLoading(true);
    try {
      let uploadedScreenshotUrl = '';
      if (screenshotFile) {
        const uploadRes = await uploadToCloudinary(screenshotFile);
        uploadedScreenshotUrl = uploadRes.imageUrl;
      }

      const manualUpiId = "QR_CODE_MANUAL";
      const docId = createdDocIdRef.current || createdDocId;
      if (docId) {
        await updateDoc(doc(db, "memberships", docId), {
          paymentId: manualUpiId,
          status: 'pending', // remains pending for manual verification
          paymentScreenshotUrl: uploadedScreenshotUrl
        });
      } else {
        await addDoc(collection(db, "memberships"), {
          ...formRef.current,
          paymentId: manualUpiId,
          createdAt: new Date(),
          status: 'pending',
          paymentScreenshotUrl: uploadedScreenshotUrl
        });
      }
      setPaymentId(manualUpiId);
      setIsQRPayment(true);
      setStep('done');
    } catch (error) {
      console.error(error);
      showToast('Failed to save payment details. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyUPI = async () => {
    try {
      await navigator.clipboard.writeText("8958421200m@pnb");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy UPI ID', err);
    }
  };

  // Load Razorpay script on mount
  useEffect(() => {
    if (!window.Razorpay) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  // Scroll to top on step changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

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

  const handlePayWithRazorpay = () => {
    if (!window.Razorpay) {
      showToast("Razorpay payment gateway is loading. Please wait a moment.", "error");
      return;
    }

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_live_lrTbKMU5YpM6UD",
      amount: 100 * 100, // ₹100 in paise
      currency: "INR",
      name: "Path Sarthi Trust",
      description: "Membership Registration",
      image: "https://www.pathsarthi.in/logo.png",
      handler: async function (response) {
        setLoading(true);
        try {
          const generatedId = response.razorpay_payment_id;
          const validFrom = new Date();
          const validTo = new Date();
          validTo.setFullYear(validFrom.getFullYear() + 1);

          const docId = createdDocIdRef.current || createdDocId;
          if (docId) {
            await updateDoc(doc(db, "memberships", docId), {
              paymentId: generatedId,
              status: 'completed',
              validFrom: validFrom,
              validTo: validTo
            });
          } else {
            await addDoc(collection(db, "memberships"), {
              ...formRef.current,
              paymentId: generatedId,
              createdAt: new Date(),
              status: 'completed',
              validFrom: validFrom,
              validTo: validTo
            });
          }
          setPaymentId(generatedId);
          setStep('done');
        } catch (error) {
          console.error(error);
          showToast('Failed to save registration. Please contact support.', 'error');
        } finally {
          setLoading(false);
        }
      },
      prefill: {
        name: form.fullName,
        email: form.email,
        contact: form.phone,
      },
      theme: {
        color: "#ff7300",
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  // Photo change handler
  const handlePhotoChange = e => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  // Toast helper
  const showToast = (msg, type = 'info') => {
    setToast({ msg, type });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => setToast(null), 3500);
  };

  // Form change handler
  const handleChange = async e => {
    const { name, value } = e.target;
    let newValue = value;

    if (name === 'pincode') {
      newValue = newValue.replace(/\D/g, '').slice(0, 6);
    }

    if (name === 'dob') {
      const calculatedAge = calculateAge(newValue);
      setForm(f => ({ ...f, dob: newValue, age: calculatedAge }));
      return;
    }

    setForm(f => ({ ...f, [name]: newValue }));

    if (name === 'pincode' && newValue.length === 6) {
      try {
        const response = await fetch(`https://api.postalpincode.in/pincode/${newValue}`);
        const data = await response.json();
        if (data && data[0] && data[0].Status === 'Success' && data[0].PostOffice && data[0].PostOffice.length > 0) {
          const postOffice = data[0].PostOffice[0];
          const fetchedState = postOffice.State.trim();
          const fetchedCity = postOffice.District.trim();

          setForm(prev => ({
            ...prev,
            state: fetchedState,
            city: fetchedCity 
          }));
          fetchCitiesForState(fetchedState);
        } else {
          throw new Error('Invalid pincode');
        }
      } catch (error) {
        // Fallback to Zippopotam API
        try {
          const altRes = await fetch(`https://api.zippopotam.us/IN/${newValue}`);
          if (altRes.ok) {
            const altData = await altRes.json();
            if (altData && altData.places && altData.places.length > 0) {
              const place = altData.places[0];
              const fetchedState = place.state.trim();
              const fetchedCity = place['place name'].trim();
              setForm(prev => ({
                ...prev,
                state: fetchedState,
                city: fetchedCity
              }));
              fetchCitiesForState(fetchedState);
            }
          }
        } catch (e) {
          console.error("Pincode API failed", e);
        }
      }
      return;
    }

    if (name === 'state') {
      fetchCitiesForState(newValue);
      setForm(prev => ({ ...prev, city: '' }));
    }
  };

  // Validate form
  const validateForm = () => {
    if (!form.fullName || !form.dob || !form.gender || !form.city || !form.state || !form.email || !form.phone || !form.pincode) {
      showToast('Please fill all required fields.', 'error');
      return false;
    }
    if (!/^\d{10}$/.test(form.phone)) {
      showToast('Enter a valid 10-digit phone number.', 'error');
      return false;
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      showToast('Enter a valid email address.', 'error');
      return false;
    }
    if (isNaN(Number(form.age)) || Number(form.age) < 1) {
      showToast('Please select a valid Date of Birth.', 'error');
      return false;
    }
    if (!agreeTerms) {
      showToast('You must agree to the Terms and Conditions to proceed.', 'error');
      return false;
    }
    return true;
  };

  // On form submit, upload photo to Cloudinary if selected, then go to payment step
  const handleFormSubmit = async e => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      // 1. Check if user already exists in memberships
      const membershipsRef = collection(db, "memberships");
      
      // Query by email
      const qEmail = query(membershipsRef, where("email", "==", form.email));
      const emailSnap = await getDocs(qEmail);

      // Query by phone
      const qPhone = query(membershipsRef, where("phone", "==", form.phone));
      const phoneSnap = await getDocs(qPhone);

      let existingDoc = null;

      if (!emailSnap.empty) {
        existingDoc = { id: emailSnap.docs[0].id, ...emailSnap.docs[0].data() };
      } else if (!phoneSnap.empty) {
        existingDoc = { id: phoneSnap.docs[0].id, ...phoneSnap.docs[0].data() };
      }

      if (existingDoc) {
        if (existingDoc.status === 'completed') {
          showToast('This user is already a registered Pathsarthi Member.', 'error');
          setLoading(false);
          return;
        } else {
          // It's a pending application, redirect to payment page
          showToast('Found your pending application. Updating details and redirecting to payment...', 'info');
          
          let uploadedUrl = existingDoc.profilePhotoUrl || '';
          if (photoFile) {
            const result = await uploadToCloudinary(photoFile);
            uploadedUrl = result.imageUrl;
          }

          const updatedForm = {
            ...form,
            profilePhotoUrl: uploadedUrl,
            image: uploadedUrl,
          };

          await updateDoc(doc(db, "memberships", existingDoc.id), {
            ...updatedForm,
            createdAt: new Date() // update timestamp to now
          });

          setForm(updatedForm);
          setCreatedDocId(existingDoc.id);
          createdDocIdRef.current = existingDoc.id;
          setStep('payment');
          setLoading(false);
          return;
        }
      }

      // 2. If user doesn't exist, proceed with new registration
      let uploadedUrl = '';
      if (photoFile) {
        const result = await uploadToCloudinary(photoFile);
        uploadedUrl = result.imageUrl;
      }
      const updatedForm = {
        ...form,
        profilePhotoUrl: uploadedUrl,
        image: uploadedUrl,
      };

      // Save pending registration in Firestore
      const docRef = await addDoc(collection(db, "memberships"), {
        ...updatedForm,
        paymentId: '',
        createdAt: new Date(),
        status: 'pending'
      });

      setForm(updatedForm);
      setCreatedDocId(docRef.id);
      createdDocIdRef.current = docRef.id;
      setStep('payment');
    } catch (error) {
      console.error(error);
      showToast('Failed to upload profile photo or save application. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-paper py-16 px-4 sm:px-6 overflow-hidden font-patrick">
      
      <div className={`w-full relative transition-all duration-500 bg-white wobbly-md shadow-hard px-8 pb-8 pt-20 md:px-10 md:pb-10 md:pt-28 mx-auto border-[3px] border-[#2d2d2d] flex flex-col mt-28 md:mt-32 ${step === 'done' ? 'max-w-4xl' : 'max-w-xl'}`}>
        
        {/* Tape Decoration */}
        <div className="tape-strip"></div>

        {/* Engaging Overlay Illustration */}
        <div className="absolute -top-32 md:-top-40 left-1/2 transform -translate-x-1/2 w-72 md:w-96 h-auto z-20 drop-shadow-[4px_4px_0_#2d2d2d] animate-in fade-in slide-in-from-bottom-8 zoom-in-95 duration-1000 rotate-1">
          <img src="/Forms-bro.png" alt="Membership Form" className="w-full h-full object-contain hover:-translate-y-2 hover:-rotate-1 transition-all duration-500" />
        </div>

        {/* Brand Header with centered Logo-2 */}
        {step !== 'done' && (
          <div className="flex flex-col items-center mb-8 relative z-10">
            <img src="/Logo-2.png" alt="PathSarthi Logo" className="w-16 h-auto mb-4 object-contain opacity-90" />
            <h2 className="text-4xl md:text-5xl font-kalam font-bold text-center text-[#2d2d2d] tracking-tight -rotate-1">Become a Pathsarthi Member</h2>
            <p className="text-sm font-patrick font-bold mt-2 uppercase tracking-widest text-[#2d2d2d] underline decoration-dashed underline-offset-4 decoration-[#ff4d4d] rotate-1">Hope • Heal • Humanity</p>
          </div>
        )}

        {toast && (
          <div className={`mb-6 px-4 py-3 rounded-xl text-center text-sm font-semibold text-white shadow-md ${toast.type === 'error' ? 'bg-red-500' : toast.type === 'success' ? 'bg-green-600' : 'bg-indigo-500'}`}>
            {toast.msg}
          </div>
        )}

        {step === 'form' && (
          <form onSubmit={handleFormSubmit} className="space-y-6">
            <div className="space-y-4">
              {/* Personal Details Group */}
              <div className="space-y-3">
                <label className="text-xl font-kalam font-bold text-[#2d2d2d] block mb-2 rotate-1">Personal Details</label>
                <input name="fullName" value={form.fullName} onChange={handleChange} required placeholder="Full Name*" className="w-full px-4 py-3 wobbly-input border-2 border-[#2d2d2d] shadow-[2px_2px_0_#2d2d2d] focus:border-[#2d5da1] focus:ring-0 outline-none transition-all placeholder:text-[#2d2d2d]/50 bg-white text-[#2d2d2d] font-bold text-lg" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="flex flex-col gap-1 w-full">
                    <label className="text-lg font-patrick font-bold text-[#2d2d2d] px-1">Date of Birth*</label>
                    <input name="dob" value={form.dob} onChange={handleChange} required type="date" className="w-full px-4 py-3 wobbly-input border-2 border-[#2d2d2d] shadow-[2px_2px_0_#2d2d2d] focus:border-[#2d5da1] focus:ring-0 outline-none transition-all text-[#2d2d2d] bg-white font-bold text-lg" />
                  </div>
                  <div className="flex flex-col gap-1 w-full">
                    <label className="text-lg font-patrick font-bold text-[#2d2d2d] px-1">Gender*</label>
                    <select name="gender" value={form.gender} onChange={handleChange} required className="w-full px-4 py-3 wobbly-input border-2 border-[#2d2d2d] shadow-[2px_2px_0_#2d2d2d] focus:border-[#2d5da1] focus:ring-0 outline-none transition-all text-[#2d2d2d] bg-white font-bold text-lg h-[50px]">
                      <option value="">Gender*</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Contact & Verification Group */}
              <div className="space-y-3 pt-2">
                <label className="text-xl font-kalam font-bold text-[#2d2d2d] block mb-2 -rotate-1">Contact & Verification</label>
                <input name="email" value={form.email} onChange={handleChange} required placeholder="Email ID*" type="email" className="w-full px-4 py-3 wobbly-input border-2 border-[#2d2d2d] shadow-[2px_2px_0_#2d2d2d] focus:border-[#2d5da1] focus:ring-0 outline-none transition-all placeholder:text-[#2d2d2d]/50 bg-white text-[#2d2d2d] font-bold text-lg" />
                <input name="phone" value={form.phone} onChange={handleChange} required placeholder="Phone Number*" type="tel" className="w-full px-4 py-3 wobbly-input border-2 border-[#2d2d2d] shadow-[2px_2px_0_#2d2d2d] focus:border-[#2d5da1] focus:ring-0 outline-none transition-all placeholder:text-[#2d2d2d]/50 bg-white text-[#2d2d2d] font-bold text-lg" />
                <input name="pincode" value={form.pincode} onChange={handleChange} required placeholder="Pincode*" maxLength="6" className="w-full px-4 py-3 wobbly-input border-2 border-[#2d2d2d] shadow-[2px_2px_0_#2d2d2d] focus:border-[#2d5da1] focus:ring-0 outline-none transition-all placeholder:text-[#2d2d2d]/50 bg-white text-[#2d2d2d] font-bold text-lg" />
              </div>

              {/* Reference Group */}
              <div className="space-y-3 pt-2">
                <label className="text-xl font-kalam font-bold text-[#2d2d2d] block mb-2 rotate-1">Reference</label>
                <input name="reference" value={form.reference} onChange={handleChange} placeholder="Referred By (Optional)" type="text" className="w-full px-4 py-3 wobbly-input border-2 border-[#2d2d2d] shadow-[2px_2px_0_#2d2d2d] focus:border-[#2d5da1] focus:ring-0 outline-none transition-all placeholder:text-[#2d2d2d]/50 bg-white text-[#2d2d2d] font-bold text-lg" />
              </div>

              {/* Location Details Group */}
              <div className="space-y-3 pt-2">
                <label className="text-xl font-kalam font-bold text-[#2d2d2d] block mb-2 -rotate-1">Location Details</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="flex flex-col gap-1 w-full">
                    <label className="text-lg font-patrick font-bold text-[#2d2d2d] px-1">State*</label>
                    <select 
                      name="state" 
                      value={form.state} 
                      onChange={handleChange} 
                      required 
                      className="w-full px-4 py-3 wobbly-input border-2 border-[#2d2d2d] shadow-[2px_2px_0_#2d2d2d] focus:border-[#2d5da1] focus:ring-0 outline-none transition-all text-[#2d2d2d] bg-white font-bold text-lg h-[50px]"
                    >
                      <option value="">Select State</option>
                      {indianStates.map((s, i) => (
                        <option key={i} value={s}>{s}</option>
                      ))}
                      {form.state && !indianStates.includes(form.state) && (
                        <option value={form.state}>{form.state}</option>
                      )}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1 w-full">
                    <label className="text-lg font-patrick font-bold text-[#2d2d2d] px-1">City/District*</label>
                    {cities.length > 0 ? (
                      <select 
                        name="city" 
                        value={form.city} 
                        onChange={handleChange} 
                        required 
                        className="w-full px-4 py-3 wobbly-input border-2 border-[#2d2d2d] shadow-[2px_2px_0_#2d2d2d] focus:border-[#2d5da1] focus:ring-0 outline-none transition-all text-[#2d2d2d] bg-white font-bold text-lg h-[50px]"
                      >
                        <option value="">Select City</option>
                        {cities.map((c, i) => (
                          <option key={i} value={c}>{c}</option>
                        ))}
                        {form.city && !cities.includes(form.city) && (
                          <option value={form.city}>{form.city}</option>
                        )}
                      </select>
                    ) : (
                      <input 
                        name="city" 
                        value={form.city} 
                        onChange={handleChange} 
                        required 
                        placeholder="City*" 
                        className="w-full px-4 py-3 wobbly-input border-2 border-[#2d2d2d] shadow-[2px_2px_0_#2d2d2d] focus:border-[#2d5da1] focus:ring-0 outline-none transition-all placeholder:text-[#2d2d2d]/50 bg-white text-[#2d2d2d] font-bold text-lg h-[50px]" 
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Membership Validity Display */}
              {(() => {
                const { from, to } = calculateValidityDates();
                return (
                  <div className="p-4 bg-[#fff9c4] border-[3px] border-[#2d2d2d] wobbly-sm text-[#2d2d2d] shadow-[4px_4px_0_rgba(45,45,45,0.1)] flex flex-col gap-1 rotate-1 my-2">
                    <span className="font-kalam font-bold text-[#ff4d4d] text-lg">📅 Membership Validity Period</span>
                    <p className="font-patrick font-bold text-lg">
                      Your membership will be active from <span className="font-black">{from}</span> to <span className="font-black">{to}</span> (Valid for 1 year).
                    </p>
                  </div>
                );
              })()}

              {/* Profile Photo Upload Field */}
              <div className="flex flex-col gap-1.5 pt-2">
                <label className="text-xl font-kalam font-bold text-[#2d2d2d] flex items-center gap-2 mb-2 rotate-1">
                  <User className="w-5 h-5 text-[#ff4d4d]" />
                  Profile Photo (Optional)
                </label>
                <div className="relative border-[3px] border-dashed border-[#2d2d2d] wobbly-input p-4 text-center hover:bg-[#fff9c4] transition-colors bg-white flex flex-col items-center justify-center cursor-pointer shadow-[2px_2px_0_#2d2d2d]">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <UploadCloud className="w-8 h-8 text-[#2d2d2d] mb-2" />
                  {photoPreview ? (
                    <div className="flex items-center gap-2 mt-1">
                      <img src={photoPreview} alt="Preview" className="w-12 h-12 rounded-full object-cover border-2 border-[#2d2d2d] shadow-hard" />
                      <span className="text-sm text-[#2d2d2d] font-patrick font-bold truncate max-w-[200px]">{photoFile?.name}</span>
                    </div>
                  ) : (
                    <>
                      <span className="text-lg text-[#2d2d2d] font-patrick font-bold">Click to upload your profile photo</span>
                      <span className="text-xs font-patrick text-[#2d2d2d]/60 font-bold">PNG, JPG, WEBP</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Terms and Conditions Checkbox */}
            <div className="flex items-start gap-2.5 pt-2 mb-4">
              <input
                id="agreeTerms"
                type="checkbox"
                checked={agreeTerms}
                onChange={e => setAgreeTerms(e.target.checked)}
                className="mt-1.5 w-5 h-5 rounded border-2 border-[#2d2d2d] text-[#ff4d4d] focus:ring-0 cursor-pointer accent-[#ff4d4d]"
                required
              />
              <label htmlFor="agreeTerms" className="text-lg text-[#2d2d2d] font-bold cursor-pointer select-none leading-tight">
                I agree to the{" "}
                <button
                  type="button"
                  onClick={() => setShowTermsModal(true)}
                  className="text-[#ff4d4d] hover:text-[#ff7300] underline font-bold focus:outline-none"
                >
                  Membership Terms & Conditions
                </button>{" "}
                of PathSarthi Trust.
              </label>
            </div>

            <button type="submit" className="w-full wobbly-sm bg-white border-[3px] border-[#2d2d2d] text-[#2d2d2d] font-patrick font-bold text-2xl py-3 shadow-hard shadow-hard-hover shadow-hard-active transition-all disabled:opacity-50 flex items-center justify-center gap-2 hover:bg-[#ff7300] hover:text-white" disabled={loading}>
              {loading ? (
                <>
                  <div className="w-5 h-5 border-[3px] border-[#2d2d2d] border-t-transparent rounded-full animate-spin"></div>
                  {photoFile ? 'Uploading photo...' : 'Processing...'}
                </>
              ) : 'Proceed to Payment'}
            </button>
          </form>
        )}

        {step === 'payment' && (
          <div className="flex flex-col items-center gap-6 font-patrick">
            <div className="text-center text-2xl font-kalam font-bold text-[#2d2d2d] -rotate-1">Please complete the payment to activate your membership.</div>
            
            <div className="w-full bg-[#fff9c4] border-[3px] border-[#2d2d2d] wobbly-sm p-5 space-y-3 shadow-hard rotate-1">
              <div className="thumbtack"></div>
              <div className="flex justify-between border-b-2 border-dashed border-[#2d2d2d]/30 pb-2.5 text-lg text-[#2d2d2d]">
                <span className="font-bold">Applicant Name</span>
                <span className="font-bold">{form.fullName}</span>
              </div>
              <div className="flex justify-between border-b-2 border-dashed border-[#2d2d2d]/30 pb-2.5 text-lg text-[#2d2d2d]">
                <span className="font-bold">Email Address</span>
                <span className="font-bold">{form.email}</span>
              </div>
              <div className="flex justify-between border-b-2 border-dashed border-[#2d2d2d]/30 pb-2.5 text-lg text-[#2d2d2d]">
                <span className="font-bold">Phone Number</span>
                <span className="font-bold">{form.phone}</span>
              </div>
              <div className="flex justify-between pt-2.5 text-xl font-bold text-[#2d2d2d]">
                <span>Membership Fee</span>
                <span className="text-[#ff4d4d] text-2xl font-kalam">₹100</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            {/* Payment Method Selector */}
            <div className="w-full grid grid-cols-2 gap-3 p-2 bg-[#e5e0d8] wobbly-sm border-2 border-[#2d2d2d] shadow-hard -rotate-1">
              <button
                type="button"
                onClick={() => setPaymentMethod('razorpay')}
                className={`py-2 px-3 wobbly-sm text-lg font-bold transition-all border-2 border-transparent ${
                  paymentMethod === 'razorpay'
                    ? 'bg-white text-[#2d2d2d] border-[#2d2d2d] shadow-[2px_2px_0_#2d2d2d]'
                    : 'text-[#2d2d2d]/60 hover:text-[#2d2d2d]'
                }`}
              >
                Razorpay (Instant)
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('upi_qr')}
                className={`py-2 px-3 wobbly-sm text-lg font-bold transition-all border-2 border-transparent ${
                  paymentMethod === 'upi_qr'
                    ? 'bg-white text-[#2d2d2d] border-[#2d2d2d] shadow-[2px_2px_0_#2d2d2d]'
                    : 'text-[#2d2d2d]/60 hover:text-[#2d2d2d]'
                }`}
              >
                UPI QR Code (Manual)
              </button>
            </div>

            {paymentMethod === 'razorpay' ? (
              <button 
                className="w-full wobbly-sm bg-white border-[3px] border-[#2d2d2d] text-[#2d2d2d] font-patrick font-bold text-2xl py-3 shadow-hard shadow-hard-hover shadow-hard-active transition-all disabled:opacity-50 flex items-center justify-center gap-2 hover:bg-[#ff7300] hover:text-white" 
                disabled={loading} 
                onClick={handlePayWithRazorpay}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-[3px] border-[#2d2d2d] border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </>
                ) : 'Pay ₹100 & Complete Registration'}
              </button>
            ) : (
              <form onSubmit={handlePayManualUPI} className="w-full space-y-4">
                <div className="flex flex-col items-center justify-center p-4 bg-white border-[3px] border-[#2d2d2d] shadow-hard wobbly-sm rotate-1">
                  <div className="tape-strip"></div>
                  <img
                    src="/Qr-code-3.jpg"
                    alt="UPI QR Code"
                    className="w-44 h-44 object-contain rounded-xl shadow-sm border-2 border-[#2d2d2d]"
                  />
                  <p className="text-sm font-patrick font-bold text-[#2d2d2d] mt-2 uppercase tracking-widest underline decoration-dashed decoration-[#ff4d4d]">Pathsarthi Trust</p>
                </div>

                <div className="space-y-1 mt-4">
                  <label className="text-xl font-kalam font-bold text-[#2d2d2d] block -rotate-1">UPI ID</label>
                  <div className="flex items-center justify-between bg-white wobbly-input border-[3px] border-[#2d2d2d] shadow-[2px_2px_0_#2d2d2d] px-4 py-2">
                    <span className="font-patrick text-xl font-bold text-[#2d2d2d]">8958421200m@pnb</span>
                    <button
                      type="button"
                      onClick={handleCopyUPI}
                      className="text-[#ff4d4d] p-2 hover:rotate-12 transition-transform"
                    >
                      {copied ? <Check className="w-5 h-5 text-[#2d2d2d]" /> : <Copy className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="bg-[#e5e0d8] border-[3px] border-[#2d2d2d] wobbly-sm shadow-[4px_4px_0_rgba(45,45,45,0.2)] p-4 text-lg text-[#2d2d2d] font-patrick font-bold leading-relaxed rotate-1">
                  Scan QR (or copy UPI ID) to pay ₹100.
                  <br /><br />
                  Please <span className="text-[#ff4d4d] underline decoration-dashed">send the payment screenshot</span> to our trust number: <span className="font-black text-[#2d5da1]">8958421200</span>.
                </div>

                {/* Payment Screenshot Upload Field */}
                <div className="flex flex-col gap-1.5 pt-2">
                  <label className="text-xl font-kalam font-bold text-[#2d2d2d] block -rotate-1">
                    Upload Payment Screenshot*
                  </label>
                  <div className="relative border-[3px] border-dashed border-[#2d2d2d] wobbly-input p-4 text-center hover:bg-[#fff9c4] transition-colors bg-white flex flex-col items-center justify-center cursor-pointer shadow-[2px_2px_0_#2d2d2d]">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleScreenshotChange}
                      required
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <UploadCloud className="w-8 h-8 text-[#2d2d2d] mb-2" />
                    {screenshotPreview ? (
                      <div className="flex items-center gap-2 mt-1">
                        <img src={screenshotPreview} alt="Screenshot Preview" className="w-12 h-12 rounded object-cover border-2 border-[#2d2d2d] shadow-[2px_2px_0_#2d2d2d]" />
                        <span className="text-sm font-patrick font-bold text-[#2d2d2d] truncate max-w-[200px]">{screenshotFile?.name}</span>
                      </div>
                    ) : (
                      <>
                        <span className="text-lg font-patrick font-bold text-[#2d2d2d]">Click to upload payment screenshot</span>
                        <span className="text-xs font-patrick font-bold text-[#2d2d2d]/60">PNG, JPG, WEBP</span>
                      </>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full wobbly-sm bg-white border-[3px] border-[#2d2d2d] text-[#2d2d2d] font-patrick font-bold text-2xl py-3 shadow-hard shadow-hard-hover shadow-hard-active transition-all disabled:opacity-50 flex items-center justify-center gap-2 hover:bg-[#ff7300] hover:text-white"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-[3px] border-[#2d2d2d] border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </>
                  ) : 'I Have Paid & Sent Screenshot'}
                </button>
              </form>
            )}
          </div>
        )}

        {step === 'done' && (() => {
          const { from: fromStr, to: toStr } = calculateValidityDates();

          return (
            <div className="flex flex-col gap-8 py-4 animate-in fade-in duration-500">
              
              {/* Header inside the Success Screen */}
              <div className="flex flex-col md:flex-row items-center justify-between border-b-[3px] border-dashed border-[#2d2d2d] pb-6 gap-4">
                <div className="flex items-center gap-3">
                  <img src="/Logo-2.png" alt="PathSarthi Logo" className="w-16 h-auto object-contain" />
                  <div>
                    <h2 className="text-3xl font-kalam font-bold text-[#2d2d2d] tracking-tight rotate-1">Pathsarthi Trust</h2>
                    <p className="text-sm font-patrick font-bold text-[#ff4d4d] uppercase tracking-wider underline decoration-dashed">Hope • Heal • Humanity</p>
                  </div>
                </div>
                <div>
                  {isQRPayment ? (
                    <span className="px-4 py-2 bg-[#fff9c4] text-[#2d2d2d] font-patrick font-bold wobbly-sm border-[3px] border-[#2d2d2d] shadow-hard flex items-center gap-2 text-lg -rotate-2">
                      <span className="w-3 h-3 rounded-full bg-[#ff4d4d] border-2 border-[#2d2d2d] animate-pulse"></span>
                      Registration Staged
                    </span>
                  ) : (
                    <span className="px-4 py-2 bg-white text-[#2d2d2d] font-patrick font-bold wobbly-sm border-[3px] border-[#2d2d2d] shadow-hard flex items-center gap-2 text-lg rotate-1">
                      <span className="w-3 h-3 rounded-full bg-green-500 border-2 border-[#2d2d2d] animate-pulse"></span>
                      Payment Successful
                    </span>
                  )}
                </div>
              </div>

              {/* Split Content Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                
                {/* Left Column: Video & Real World Stats */}
                <div className="space-y-6">
                  {/* Video Player */}
                  <div className="relative rounded-2xl overflow-hidden shadow-lg border border-slate-100 bg-black aspect-video flex items-center justify-center group hover:shadow-xl transition-all duration-300">
                    <video 
                      src="/IMG_7027.MP4" 
                      className="w-full h-full object-cover pointer-events-none" 
                      autoPlay 
                      playsInline 
                    />
                  </div>

                  {/* Real World Impact of 100rs */}
                  <div className="bg-[#fff9c4] wobbly-sm p-6 border-[3px] border-[#2d2d2d] shadow-hard space-y-4 -rotate-1 relative mt-4">
                    <div className="tape-strip"></div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-[#2d2d2d] text-2xl font-kalam uppercase tracking-wider">How ₹100 Drives Real Change</h3>
                    </div>
                    
                    <p className="text-lg font-bold font-patrick text-[#2d2d2d] leading-relaxed">
                      In a developing nation like India, small contributions compile to solve mammoth-sized challenges. Non-Governmental Organizations (NGOs) and community groups work on-ground to bridge crucial gaps. Your ₹100 membership fee does not just verify your account—it funds immediate local relief:
                    </p>

                    <div className="grid grid-cols-1 gap-4 pt-2">
                      <div className="flex items-start gap-3 bg-white p-3 wobbly-sm border-2 border-[#2d2d2d] shadow-[3px_3px_0_#2d2d2d] rotate-1">
                        <span className="text-2xl pt-1">🎒</span>
                        <div className="space-y-0.5">
                          <h4 className="text-xl font-kalam font-bold text-[#2d2d2d]">Childhood Education</h4>
                          <p className="text-base font-patrick font-bold text-[#2d2d2d]">Buys 5 school notebooks & stationery kits for underprivileged children to prevent them from dropping out.</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 bg-white p-3 wobbly-sm border-2 border-[#2d2d2d] shadow-[3px_3px_0_#2d2d2d] -rotate-1">
                        <span className="text-2xl pt-1">🍲</span>
                        <div className="space-y-0.5">
                          <h4 className="text-xl font-kalam font-bold text-[#2d2d2d]">Zero Hunger Initiative</h4>
                          <p className="text-base font-patrick font-bold text-[#2d2d2d]">Provides 3 wholesome, hot mid-day meals to street kids, securing their basic nutritional needs.</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 bg-white p-3 wobbly-sm border-2 border-[#2d2d2d] shadow-[3px_3px_0_#2d2d2d] rotate-1">
                        <span className="text-2xl pt-1">🏥</span>
                        <div className="space-y-0.5">
                          <h4 className="text-xl font-kalam font-bold text-[#2d2d2d]">Health & Hygiene</h4>
                          <p className="text-base font-patrick font-bold text-[#2d2d2d]">Supports basic sanitary hygiene pads and clean drinking water kits for families in slum clusters.</p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 text-center">
                      <p className="text-sm font-patrick font-bold text-[#2d2d2d] uppercase tracking-widest border-t-2 border-dashed border-[#2d2d2d]/30 pt-2">Pathsarthi Trust • Transforming Lives Together</p>
                    </div>
                  </div>
                </div>

                {/* Right Column: User Profile & Details */}
                <div className="space-y-6">
                  
                  {/* Thank You Card */}
                  <div className="flex flex-col items-center text-center p-6 bg-white wobbly-sm border-[3px] border-[#2d2d2d] shadow-hard rotate-1 relative mt-4">
                    <div className="thumbtack"></div>
                    {photoPreview || form.profilePhotoUrl ? (
                      <img 
                        src={photoPreview || form.profilePhotoUrl} 
                        alt="Member Profile" 
                        className="w-24 h-24 rounded-full border-[3px] border-[#2d2d2d] shadow-[4px_4px_0_#ff7300] object-cover mb-4 animate-in zoom-in duration-300"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-white text-[#2d2d2d] flex items-center justify-center font-bold text-4xl font-kalam shadow-[4px_4px_0_#ff7300] border-[3px] border-[#2d2d2d] mb-4 animate-in zoom-in duration-300">
                        {form.fullName ? form.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'PS'}
                      </div>
                    )}
                    <h3 className="text-4xl font-kalam font-bold text-[#2d2d2d] leading-snug">Welcome to the Family! ❤️</h3>
                    <p className="text-xl font-bold font-patrick text-[#ff4d4d] mt-1 underline decoration-dashed">{form.fullName}</p>
                    <p className="text-lg font-bold font-patrick text-[#2d2d2d] mt-3 leading-relaxed">
                      Dear <span className="font-bold bg-[#fff9c4] px-1">{form.fullName}</span>, we are extremely honored to have you as a registered member of Pathsarthi Trust. You are now a <strong>Pathsarthi</strong>—a charioteer guiding social change. Your contribution helps us sustain on-ground service.
                    </p>
                  </div>

                  {/* Membership Info Card */}
                  <div className="bg-[#e5e0d8] border-[3px] border-[#2d2d2d] wobbly-sm p-5 space-y-3.5 shadow-[4px_4px_0_rgba(45,45,45,0.2)] -rotate-1 mt-6">
                    <h4 className="text-xl font-kalam font-bold text-[#2d2d2d] uppercase tracking-widest border-b-2 border-dashed border-[#2d2d2d]/30 pb-2">Membership Details</h4>
                    
                    <div className="flex justify-between text-lg font-patrick font-bold text-[#2d2d2d]">
                      <span>Email</span>
                      <span className="text-[#2d5da1]">{form.email}</span>
                    </div>

                    <div className="flex justify-between text-lg font-patrick font-bold text-[#2d2d2d]">
                      <span>Phone</span>
                      <span className="text-[#2d5da1]">{form.phone}</span>
                    </div>

                    <div className="flex justify-between text-lg font-patrick font-bold text-[#2d2d2d]">
                      <span>Validity Range</span>
                      <span className="bg-white px-2 py-0.5 border-2 border-[#2d2d2d] shadow-[2px_2px_0_#2d2d2d] rotate-1">
                        {fromStr} - {toStr}
                      </span>
                    </div>

                    {isQRPayment ? (
                      <div className="pt-2">
                        <div className="bg-[#fff9c4] border-2 border-[#2d2d2d] wobbly-sm p-3 text-left text-lg font-patrick font-bold text-[#2d2d2d] space-y-1.5 shadow-[2px_2px_0_#2d2d2d] rotate-1">
                          <p className="font-kalam text-[#ff4d4d] text-xl flex items-center gap-2">
                            <span>⚠️</span> Screenshot Verification Required
                          </p>
                          <p>
                            Your payment screenshot has been uploaded. Please ensure you also send it to our trust number <span className="font-black text-[#2d5da1] underline decoration-dashed">8958421200</span> via WhatsApp to expedite admin activation.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center text-lg font-patrick font-bold text-[#2d2d2d] border-t-2 border-dashed pt-3.5 border-[#2d2d2d]/30">
                        <span>Payment ID</span>
                        <span className="font-mono bg-white px-2 py-0.5 border-2 border-[#2d2d2d] text-[#ff4d4d] select-all max-w-[170px] truncate shadow-[2px_2px_0_#2d2d2d] -rotate-1">
                          {paymentId}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Return Button */}
                  <button 
                    onClick={() => window.location.href = "/"}
                    className="w-full wobbly-sm bg-white border-[3px] border-[#2d2d2d] text-[#2d2d2d] font-patrick font-bold text-2xl py-3 shadow-hard shadow-hard-hover shadow-hard-active transition-all flex items-center justify-center gap-2 hover:bg-[#ff7300] hover:text-white uppercase tracking-wider"
                  >
                    Go Back to Home
                  </button>

                </div>
              </div>

            </div>
          );
        })()}
      </div>

      {/* Terms and Conditions Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2d2d2d]/80 p-4 animate-in fade-in duration-300 font-patrick">
          <div className="bg-paper border-[3px] border-[#2d2d2d] wobbly-md shadow-hard max-w-2xl w-full max-h-[80vh] flex flex-col relative animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b-[3px] border-dashed border-[#2d2d2d] flex items-center justify-between">
              <h3 className="text-3xl font-kalam font-bold text-[#2d2d2d] -rotate-1">Membership Terms & Conditions</h3>
              <button
                onClick={() => setShowTermsModal(false)}
                className="text-[#2d2d2d] hover:text-[#ff4d4d] p-1.5 border-2 border-transparent hover:border-[#2d2d2d] hover:shadow-[2px_2px_0_#2d2d2d] bg-white wobbly-sm transition-all rotate-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-6 overflow-y-auto space-y-4 text-lg text-[#2d2d2d] font-bold leading-relaxed custom-scrollbar bg-white/50">
              <p className="font-bold text-slate-700">Effective Date: June 2026<br />Website: PathSarthi Trust</p>
              <p>Welcome to PathSarthi Trust. By applying for and accepting membership, you agree to the following Terms and Conditions.</p>

              <h4 className="font-black text-slate-800 mt-4 text-base">1. Membership Purpose</h4>
              <p>PathSarthi Trust is a non-profit organization committed to creating positive social impact through initiatives in education, healthcare, child welfare, women empowerment, environmental awareness, and community development.</p>
              <p>Membership is intended for individuals who wish to actively support and participate in the Trust's mission and activities.</p>

              <h4 className="font-black text-slate-800 mt-4 text-base">2. Eligibility</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>Any individual aged 18 years or above may apply for membership.</li>
                <li>Applicants must provide accurate and complete information during registration.</li>
                <li>PathSarthi Trust reserves the right to approve, reject, suspend, or terminate any membership application at its discretion.</li>
              </ul>

              <h4 className="font-black text-slate-800 mt-4 text-base">3. Membership Validity</h4>
              <p className="font-semibold text-slate-700">One-Year Membership</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Membership is valid for one (1) year only from the date of approval.</li>
                <li>Membership will automatically expire after the completion of the one-year period.</li>
                <li>Members may apply for renewal subject to the Trust's policies applicable at that time.</li>
                <li>The Trust is under no obligation to automatically renew membership.</li>
              </ul>

              <h4 className="font-black text-slate-800 mt-4 text-base">4. Membership Benefits</h4>
              <p>Registered members may be eligible for the following benefits:</p>
              
              <p className="font-semibold text-slate-700 mt-2">Official Membership Benefits</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Digital Membership Certificate.</li>
                <li>Unique Membership ID.</li>
                <li>Membership Recognition within the Trust community.</li>
              </ul>

              <p className="font-semibold text-slate-700 mt-2">Community & Networking Benefits</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Exclusive access to the official PathSarthi Members WhatsApp Community.</li>
                <li>Networking opportunities with volunteers, professionals, educators, healthcare workers, and social impact leaders.</li>
                <li>Participation in community discussions and social initiatives.</li>
              </ul>

              <p className="font-semibold text-slate-700 mt-2">Events & Participation</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Priority access to volunteering opportunities.</li>
                <li>Invitations to Trust events, workshops, awareness campaigns, health camps, donation drives, and community outreach programs.</li>
                <li>Eligibility to attend the Annual Members Meet organized by the Trust.</li>
              </ul>

              <p className="font-semibold text-slate-700 mt-2">Leadership & Growth Opportunities</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Opportunity to lead or coordinate Trust initiatives.</li>
                <li>Opportunity to represent PathSarthi Trust in approved activities.</li>
                <li>Eligibility for internship and project opportunities offered by the Trust, subject to availability.</li>
              </ul>

              <p className="font-semibold text-slate-700 mt-2">Recognition & Rewards</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Volunteer Ranking & Rewards Program based on contribution, participation, leadership, and impact.</li>
                <li>Appreciation Certificates for outstanding service.</li>
                <li>Recognition during Trust events and programs.</li>
                <li>Featured Member recognition on the Trust website and social media platforms.</li>
              </ul>

              <p className="font-semibold text-slate-700 mt-2">Career & Academic Support</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Community Service Hours Verification.</li>
                <li>Volunteer Experience Certificate (subject to participation requirements).</li>
                <li>Recommendation Letters for active and exceptional members, subject to evaluation by the Trust.</li>
                <li>Documentation of volunteer contributions for educational and professional purposes.</li>
              </ul>

              <p className="font-semibold text-slate-700 mt-2">Communication & Updates</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Regular newsletters and project updates.</li>
                <li>Information regarding upcoming campaigns, events, and volunteering opportunities.</li>
                <li>Annual impact reports and organizational updates.</li>
              </ul>

              <h4 className="font-black text-slate-800 mt-4 text-base">5. Member Responsibilities</h4>
              <p>Members agree to:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Support the mission and values of PathSarthi Trust.</li>
                <li>Act respectfully toward beneficiaries, volunteers, staff, and fellow members.</li>
                <li>Maintain ethical conduct during all Trust activities.</li>
                <li>Follow all applicable laws and regulations.</li>
                <li>Protect the reputation and interests of the Trust.</li>
                <li>Use membership privileges responsibly.</li>
              </ul>
              <p className="mt-2 font-semibold">Members must not:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Misrepresent themselves as employees, directors, or authorized spokespersons of the Trust unless officially designated.</li>
                <li>Use the Trust's name, logo, or branding without written permission.</li>
                <li>Engage in any activity that may harm the Trust, its beneficiaries, volunteers, partners, or reputation.</li>
              </ul>

              <h4 className="font-black text-slate-800 mt-4 text-base">6. Volunteer Activities</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>Participation in volunteer activities is voluntary.</li>
                <li>The Trust may assign responsibilities based on project requirements and member suitability.</li>
                <li>Participation in any activity does not create an employment relationship with the Trust.</li>
                <li>The Trust may modify, postpone, or cancel activities at any time.</li>
              </ul>

              <h4 className="font-black text-slate-800 mt-4 text-base">7. Membership Fees & Donations</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>Any membership fee, if applicable, is non-refundable unless otherwise specified by the Trust.</li>
                <li>Donations made to the Trust are voluntary and non-refundable.</li>
                <li>Membership does not entitle a member to any financial benefit, profit-sharing, salary, or ownership interest in the Trust.</li>
              </ul>

              <h4 className="font-black text-slate-800 mt-4 text-base">8. Privacy & Data Protection</h4>
              <p>By registering for membership, you consent to the collection and use of your information for:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Membership administration.</li>
                <li>Volunteer management.</li>
                <li>Event participation.</li>
                <li>Communication regarding Trust activities.</li>
                <li>Legal and regulatory compliance.</li>
              </ul>
              <p>PathSarthi Trust will take reasonable measures to protect personal information and will not sell personal data to third parties.</p>

              <h4 className="font-black text-slate-800 mt-4 text-base">9. Communication Consent</h4>
              <p>Members agree to receive:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Membership-related notifications.</li>
                <li>Event invitations.</li>
                <li>Volunteer opportunities.</li>
                <li>Newsletters and impact reports.</li>
                <li>Communications through email, phone, SMS, WhatsApp, or other official channels.</li>
              </ul>
              <p>Members may opt out of non-essential communications at any time.</p>

              <h4 className="font-black text-slate-800 mt-4 text-base">10. Suspension & Termination</h4>
              <p>The Trust may suspend or terminate membership if:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>False information is provided.</li>
                <li>These Terms and Conditions are violated.</li>
                <li>A member engages in misconduct or unethical behavior.</li>
                <li>A member's actions negatively affect the Trust's operations, reputation, beneficiaries, or stakeholders.</li>
              </ul>
              <p>Upon termination or expiry, all membership rights and benefits shall cease immediately.</p>

              <h4 className="font-black text-slate-800 mt-4 text-base">11. Intellectual Property</h4>
              <p>All content, logos, trademarks, photographs, publications, and materials belonging to PathSarthi Trust remain the property of the Trust.</p>
              <p>Members may not reproduce, distribute, or use Trust materials without prior written permission.</p>

              <h4 className="font-black text-slate-800 mt-4 text-base">12. Limitation of Liability</h4>
              <p>PathSarthi Trust shall not be liable for any direct, indirect, incidental, special, or consequential damages arising from participation in Trust activities, except where required by applicable law.</p>
              <p>Members participate in activities at their own discretion and responsibility.</p>

              <h4 className="font-black text-slate-800 mt-4 text-base">13. Amendments</h4>
              <p>PathSarthi Trust reserves the right to amend these Terms and Conditions at any time.</p>
              <p>Updated Terms and Conditions shall become effective immediately upon publication on the Trust website.</p>

              <h4 className="font-black text-slate-800 mt-4 text-base">14. Governing Law</h4>
              <p>These Terms and Conditions shall be governed by and interpreted in accordance with the laws of India.</p>
              <p>Any disputes arising from membership shall be subject to the jurisdiction of the competent courts in India.</p>

              <h4 className="font-black text-slate-800 mt-4 text-base">15. Declaration</h4>
              <p>By submitting the Membership Form, I confirm that:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>I have read and understood these Terms and Conditions.</li>
                <li>I agree to abide by the rules and policies of PathSarthi Trust.</li>
                <li>The information provided by me is accurate and complete.</li>
                <li>I understand that my membership is valid for one (1) year only and may require renewal upon expiry.</li>
                <li>I acknowledge that membership does not guarantee employment, financial benefits, or leadership positions within the Trust.</li>
              </ul>
              <p className="text-center font-bold mt-4 text-slate-800 font-sans">Together, we strive to create a better future through Hope, Heal & Humanity. ❤️🤝🌍</p>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t-[3px] border-dashed border-[#2d2d2d] flex justify-end gap-3 bg-[#e5e0d8]">
              <button
                onClick={() => {
                  setAgreeTerms(true);
                  setShowTermsModal(false);
                }}
                className="px-6 py-3 wobbly-sm bg-white border-[3px] border-[#2d2d2d] text-[#2d2d2d] font-patrick font-bold text-xl shadow-hard shadow-hard-hover shadow-hard-active transition-all hover:bg-[#ff4d4d] hover:text-white"
              >
                Accept & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MembershipForm; 