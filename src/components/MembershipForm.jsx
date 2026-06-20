import React, { useState, useRef, useEffect } from 'react';
import { auth, db } from '../config/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { collection, addDoc, doc, updateDoc, query, where, getDocs } from 'firebase/firestore';
import { uploadToCloudinary } from '../utils/cloudinary';
import { UploadCloud, User } from 'lucide-react';
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
  firstName: '',
  middleName: '',
  lastName: '',
  dob: '',
  age: '',
  gender: '',
  city: '',
  state: '',
  pincode: '',
  email: '',
  phone: '',
  aadhaar: '',
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

          if (createdDocId) {
            await updateDoc(doc(db, "memberships", createdDocId), {
              paymentId: generatedId,
              status: 'completed',
              validFrom: validFrom,
              validTo: validTo
            });
          } else {
            await addDoc(collection(db, "memberships"), {
              ...form,
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
        name: `${form.firstName} ${form.lastName}`,
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
    if (!form.firstName || !form.lastName || !form.dob || !form.gender || !form.city || !form.state || !form.email || !form.phone || !form.aadhaar || !form.pincode) {
      showToast('Please fill all required fields.', 'error');
      return false;
    }
    if (!/^\d{10}$/.test(form.phone)) {
      showToast('Enter a valid 10-digit phone number.', 'error');
      return false;
    }
    if (!/^\d{12}$/.test(form.aadhaar)) {
      showToast('Enter a valid 12-digit Aadhaar number.', 'error');
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

      // Query by aadhaar
      const qAadhaar = query(membershipsRef, where("aadhaar", "==", form.aadhaar));
      const aadhaarSnap = await getDocs(qAadhaar);

      let existingDoc = null;

      if (!emailSnap.empty) {
        existingDoc = { id: emailSnap.docs[0].id, ...emailSnap.docs[0].data() };
      } else if (!phoneSnap.empty) {
        existingDoc = { id: phoneSnap.docs[0].id, ...phoneSnap.docs[0].data() };
      } else if (!aadhaarSnap.empty) {
        existingDoc = { id: aadhaarSnap.docs[0].id, ...aadhaarSnap.docs[0].data() };
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
      setStep('payment');
    } catch (error) {
      console.error(error);
      showToast('Failed to upload profile photo or save application. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-slate-50 to-indigo-50 py-12 px-4 sm:px-6">
      <div className="w-full max-w-xl bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-8 md:p-10 mx-auto border border-orange-100/50 flex flex-col">
        {/* Brand Header with centered Logo-2 */}
        <div className="flex flex-col items-center mb-8">
          <img src="/Logo-2.png" alt="PathSarthi Logo" className="w-24 h-auto mb-4 object-contain" />
          <h2 className="text-2xl md:text-3xl font-black text-center text-[#ff7300] tracking-tight">Become a Pathsarthi Member</h2>
          <p className="text-xs text-gray-400 font-bold mt-1.5 uppercase tracking-widest">Hope • Heal • Humanity</p>
        </div>

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
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">Personal Details</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <input name="firstName" value={form.firstName} onChange={handleChange} required placeholder="First Name*" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#ff7300] focus:ring-2 focus:ring-orange-200 outline-none transition-all placeholder:text-slate-400 bg-slate-50/50 hover:bg-slate-50 focus:bg-white text-slate-800 font-semibold text-sm" />
                  <input name="middleName" value={form.middleName} onChange={handleChange} placeholder="Middle Name" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#ff7300] focus:ring-2 focus:ring-orange-200 outline-none transition-all placeholder:text-slate-400 bg-slate-50/50 hover:bg-slate-50 focus:bg-white text-slate-800 font-semibold text-sm" />
                  <input name="lastName" value={form.lastName} onChange={handleChange} required placeholder="Last Name*" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#ff7300] focus:ring-2 focus:ring-orange-200 outline-none transition-all placeholder:text-slate-400 bg-slate-50/50 hover:bg-slate-50 focus:bg-white text-slate-800 font-semibold text-sm" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="flex flex-col gap-1 w-full">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Date of Birth*</label>
                    <input name="dob" value={form.dob} onChange={handleChange} required type="date" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#ff7300] focus:ring-2 focus:ring-orange-200 outline-none transition-all text-slate-800 font-semibold text-sm bg-slate-50/50 hover:bg-slate-50 focus:bg-white" />
                  </div>
                  <div className="flex flex-col gap-1 w-full">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Gender*</label>
                    <select name="gender" value={form.gender} onChange={handleChange} required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#ff7300] focus:ring-2 focus:ring-orange-200 outline-none transition-all text-slate-800 font-semibold text-sm bg-slate-50/50 hover:bg-slate-50 focus:bg-white h-[46px]">
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
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">Contact & Verification</label>
                <input name="email" value={form.email} onChange={handleChange} required placeholder="Email ID*" type="email" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#ff7300] focus:ring-2 focus:ring-orange-200 outline-none transition-all placeholder:text-slate-400 bg-slate-50/50 hover:bg-slate-50 focus:bg-white text-slate-800 font-semibold text-sm" />
                <input name="phone" value={form.phone} onChange={handleChange} required placeholder="Phone Number*" type="tel" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#ff7300] focus:ring-2 focus:ring-orange-200 outline-none transition-all placeholder:text-slate-400 bg-slate-50/50 hover:bg-slate-50 focus:bg-white text-slate-800 font-semibold text-sm" />
                <input name="aadhaar" value={form.aadhaar} onChange={handleChange} required placeholder="Aadhaar Card Number*" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#ff7300] focus:ring-2 focus:ring-orange-200 outline-none transition-all placeholder:text-slate-400 bg-slate-50/50 hover:bg-slate-50 focus:bg-white text-slate-800 font-semibold text-sm" />
                <input name="pincode" value={form.pincode} onChange={handleChange} required placeholder="Pincode*" maxLength="6" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#ff7300] focus:ring-2 focus:ring-orange-200 outline-none transition-all placeholder:text-slate-400 bg-slate-50/50 hover:bg-slate-50 focus:bg-white text-slate-800 font-semibold text-sm" />
              </div>

              {/* Location Details Group */}
              <div className="space-y-3 pt-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">Location Details</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="flex flex-col gap-1 w-full">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">State*</label>
                    <select 
                      name="state" 
                      value={form.state} 
                      onChange={handleChange} 
                      required 
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#ff7300] focus:ring-2 focus:ring-orange-200 outline-none transition-all text-slate-800 font-semibold text-sm bg-slate-50/50 hover:bg-slate-50 focus:bg-white h-[46px]"
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
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">City/District*</label>
                    {cities.length > 0 ? (
                      <select 
                        name="city" 
                        value={form.city} 
                        onChange={handleChange} 
                        required 
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#ff7300] focus:ring-2 focus:ring-orange-200 outline-none transition-all text-slate-800 font-semibold text-sm bg-slate-50/50 hover:bg-slate-50 focus:bg-white h-[46px]"
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
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#ff7300] focus:ring-2 focus:ring-orange-200 outline-none transition-all placeholder:text-slate-400 bg-slate-50/50 hover:bg-slate-50 focus:bg-white text-slate-800 font-semibold text-sm h-[46px]" 
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Membership Validity Display */}
              {(() => {
                const { from, to } = calculateValidityDates();
                return (
                  <div className="p-4 bg-orange-50/50 border border-orange-100 rounded-xl text-slate-700 text-xs shadow-sm flex flex-col gap-1">
                    <span className="font-black text-[#ff7300] uppercase tracking-wider text-[10px]">📅 Membership Validity Period</span>
                    <p className="font-semibold text-slate-600">
                      Your membership will be active from <span className="font-extrabold text-slate-800">{from}</span> to <span className="font-extrabold text-slate-800">{to}</span> (Valid for 1 year).
                    </p>
                  </div>
                );
              })()}

              {/* Profile Photo Upload Field */}
              <div className="flex flex-col gap-1.5 pt-2">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-[#ff7300]" />
                  Profile Photo (Optional)
                </label>
                <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-orange-400 transition-colors bg-gray-50 flex flex-col items-center justify-center cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <UploadCloud className="w-6 h-6 text-gray-400 mb-1" />
                  {photoPreview ? (
                    <div className="flex items-center gap-2 mt-1">
                      <img src={photoPreview} alt="Preview" className="w-10 h-10 rounded-full object-cover border-2 border-orange-400 shadow-sm" />
                      <span className="text-xs text-gray-600 font-medium truncate max-w-[200px]">{photoFile?.name}</span>
                    </div>
                  ) : (
                    <>
                      <span className="text-xs text-gray-500 font-semibold">Click to upload your profile photo</span>
                      <span className="text-[10px] text-gray-400">PNG, JPG, WEBP</span>
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
                className="mt-1 w-4.5 h-4.5 rounded text-[#ff7300] focus:ring-orange-500 border-slate-300 cursor-pointer accent-[#ff7300]"
                required
              />
              <label htmlFor="agreeTerms" className="text-xs text-slate-500 font-semibold cursor-pointer select-none leading-relaxed">
                I agree to the{" "}
                <button
                  type="button"
                  onClick={() => setShowTermsModal(true)}
                  className="text-[#ff7300] hover:text-indigo-600 underline font-bold focus:outline-none"
                >
                  Membership Terms & Conditions
                </button>{" "}
                of PathSarthi Trust.
              </label>
            </div>

            <button type="submit" className="w-full bg-[#ff7300] hover:bg-indigo-600 text-white font-bold py-3.5 rounded-xl transition duration-300 shadow-md hover:shadow-indigo-200 hover:-translate-y-0.5 transform active:translate-y-0 disabled:opacity-50 flex items-center justify-center gap-2 text-base" disabled={loading}>
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {photoFile ? 'Uploading photo...' : 'Processing...'}
                </>
              ) : 'Proceed to Payment'}
            </button>
          </form>
        )}

        {step === 'payment' && (
          <div className="flex flex-col items-center gap-6">
            <div className="text-center text-lg font-semibold text-green-700">Please complete the payment to activate your membership.</div>
            
            <div className="w-full bg-slate-50 border border-slate-100 rounded-xl p-5 space-y-3">
              <div className="flex justify-between border-b pb-2.5 text-sm text-gray-600">
                <span>Applicant Name</span>
                <span className="font-semibold text-gray-900">{form.firstName} {form.lastName}</span>
              </div>
              <div className="flex justify-between border-b pb-2.5 text-sm text-gray-600">
                <span>Email Address</span>
                <span className="font-semibold text-gray-900">{form.email}</span>
              </div>
              <div className="flex justify-between border-b pb-2.5 text-sm text-gray-600">
                <span>Phone Number</span>
                <span className="font-semibold text-gray-900">{form.phone}</span>
              </div>
              <div className="flex justify-between pt-2.5 text-base font-bold text-gray-800">
                <span>Membership Fee</span>
                <span className="text-[#ff7300] text-lg">₹100</span>
              </div>
            </div>

            <button 
              className="w-full bg-[#ff7300] hover:bg-indigo-600 text-white font-bold py-3.5 rounded-xl transition duration-300 shadow-md hover:shadow-indigo-200 hover:-translate-y-0.5 transform active:translate-y-0 flex items-center justify-center gap-2 disabled:opacity-50 text-base" 
              disabled={loading} 
              onClick={handlePayWithRazorpay}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </>
              ) : 'Pay ₹100 & Complete Registration'}
            </button>
          </div>
        )}

        {step === 'done' && (() => {
          const { from: fromStr, to: toStr } = calculateValidityDates();

          return (
            <div className="flex flex-col items-center gap-6 py-6 text-center">
              <div className="text-3xl text-green-600 font-black animate-bounce-slow">✅ Payment Successful!</div>
              <div className="text-slate-600 font-medium w-full">
                Thank you for becoming a Pathsarthi Member.<br />
                Your Membership Payment ID:
                <div className="font-mono text-indigo-600 font-bold bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-2 mt-3 select-all text-lg shadow-sm mb-6">
                  {paymentId}
                </div>
                
                <div className="p-5 bg-gradient-to-br from-orange-50 to-orange-100/50 border border-orange-100 rounded-2xl text-slate-700 text-sm shadow-sm max-w-sm mx-auto">
                  <p className="font-black text-[#ff7300] mb-2 uppercase tracking-wider text-xs">📅 Membership Validity</p>
                  <div className="flex flex-col gap-1.5 items-center justify-center my-3 bg-white/80 py-3 px-4 rounded-xl border border-orange-100/80">
                    <div className="flex justify-between w-full text-xs text-slate-400 font-bold uppercase tracking-wider">
                      <span>From</span>
                      <span>To</span>
                    </div>
                    <div className="flex justify-between items-center w-full gap-2 text-sm font-bold text-slate-800">
                      <span>{fromStr}</span>
                      <span className="text-[#ff7300]">➔</span>
                      <span>{toStr}</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-1">Valid for exactly 1 year</p>
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Terms and Conditions Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col border border-slate-100 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-800">Membership Terms & Conditions</h3>
              <button
                onClick={() => setShowTermsModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-50 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-6 overflow-y-auto space-y-4 text-sm text-slate-600 leading-relaxed custom-scrollbar">
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
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50 rounded-b-3xl">
              <button
                onClick={() => {
                  setAgreeTerms(true);
                  setShowTermsModal(false);
                }}
                className="px-5 py-2.5 bg-[#ff7300] hover:bg-[#e06500] text-white font-bold rounded-xl text-sm transition-colors"
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