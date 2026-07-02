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
  
  const fillDummyData = () => {
    setForm({
      fullName: 'Test User',
      dob: '2000-01-01',
      age: '26',
      gender: 'Male',
      city: 'Delhi',
      state: 'Delhi',
      pincode: '110001',
      email: 'test@example.com',
      phone: '9999999999',
      reference: 'Self',
      profilePhotoUrl: '',
      image: '',
    });
    setAgreeTerms(true);
  };

  // No OTP, no recaptcha
  const [toast, setToast] = useState(null);
  const [paymentId, setPaymentId] = useState('');
  const [createdDocId, setCreatedDocId] = useState('');

  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [cities, setCities] = useState([]);
  const [members, setMembers] = useState([]);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const createdDocIdRef = useRef('');
  const formRef = useRef(form);
  const logoClickCount = useRef(0);

  const handleLogoClick = () => {
    logoClickCount.current += 1;
    if (logoClickCount.current >= 5) {
      fillDummyData();
      logoClickCount.current = 0;
    }
  };

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

  // Fetch approved members and their JanSampark referral count
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        // Fetch JanSampark references count
        const janSnap = await getDocs(collection(db, "jan_sampark"));
        const refCounts = {};
        janSnap.forEach(doc => {
          const data = doc.data();
          const s = (data.status || '').trim().toLowerCase();
          if ((s === 'completed' || s === 'paid') && data.reference && data.reference !== "Self") {
            const refTrimmed = data.reference.trim();
            refCounts[refTrimmed] = (refCounts[refTrimmed] || 0) + 1;
          }
        });

        // Fetch valid memberships (including both 'completed' and 'Paid')
        const snapshot = await getDocs(collection(db, "memberships"));
        const membersList = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          const s = (data.status || '').trim().toLowerCase();
          
          let memberName = data.fullName;
          if (!memberName && data.firstName) {
            memberName = data.firstName + (data.lastName ? " " + data.lastName : "");
          }
          
          if ((s === 'completed' || s === 'paid') && memberName) {
            membersList.push(memberName.trim());
          }
        });
        
        // Remove duplicates and attach counts
        const uniqueMembers = [...new Set(membersList)].sort();
        const membersWithCounts = uniqueMembers.map(name => ({
          name,
          count: refCounts[name] || 0
        }));
        
        setMembers(membersWithCounts);
      } catch (error) {
        console.error("Error fetching members:", error);
      }
    };
    fetchMembers();
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-geom-light py-16 px-4 sm:px-6 overflow-hidden font-jakarta relative">
      
      {/* Background Dots */}
      <div className="absolute inset-0 bg-dot-pattern opacity-50 pointer-events-none"></div>

      {/* Hero Header & Image */}
      {step !== 'done' && (
        <div className="relative z-20 flex flex-col items-center text-center mb-8 animate-in slide-in-from-bottom-8 duration-700">
          <img src="/Forms-bro.png" alt="Membership Form" className="w-64 md:w-80 h-auto object-contain drop-shadow-xl hover:-translate-y-2 transition-transform duration-300 mb-4" />
          <div className="flex flex-col items-center bg-white border-2 border-[#1E293B] shadow-geom-soft rounded-2xl px-8 py-6 max-w-lg">
            <img 
              src="/Logo-2.png" 
              alt="PathSarthi Logo" 
              className="w-16 h-auto mb-3 object-contain cursor-pointer" 
              onClick={handleLogoClick}
            />
            <h2 className="text-3xl md:text-4xl font-outfit font-extrabold text-geom-foreground mb-2 tracking-tight">Become a Member</h2>
            <p className="text-sm font-medium text-slate-500 uppercase tracking-widest border-b-2 border-dashed border-slate-200 pb-3 mb-2">Join PathSarthi Trust</p>
            <p className="text-base text-slate-600 font-medium">Be a catalyst for hope. Registration fee: <span className="font-outfit font-bold text-[#8B5CF6] text-xl">₹100</span></p>
          </div>
        </div>
      )}

      <div className={`w-full relative transition-all duration-500 bg-white shadow-geom px-6 pb-8 pt-8 md:px-10 md:pb-10 mx-auto border-2 border-[#1E293B] rounded-2xl flex flex-col z-20 ${step === 'done' ? 'max-w-4xl' : 'max-w-xl'}`}>

        {toast && (
          <div className={`mb-6 px-4 py-3 rounded-xl text-center text-sm font-semibold text-white shadow-md ${toast.type === 'error' ? 'bg-red-500' : toast.type === 'success' ? 'bg-green-600' : 'bg-indigo-500'}`}>
            {toast.msg}
          </div>
        )}

        {step === 'form' && (
          <form onSubmit={handleFormSubmit} className="space-y-6">
            <div className="space-y-4">
              {/* Personal Details Group */}
              <div className="space-y-4">
                <label className="text-sm font-outfit font-bold text-geom-foreground uppercase tracking-wide block mb-1">Personal Details</label>
                <input name="fullName" value={form.fullName} onChange={handleChange} required placeholder="Full Name*" className="w-full px-4 py-3 geom-input" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1 w-full min-w-0 overflow-hidden">
                    <label className="text-xs font-outfit font-bold text-slate-500 uppercase tracking-wide px-1">Date of Birth*</label>
                    <input name="dob" value={form.dob} onChange={handleChange} required type="date" className="w-full px-4 py-3 geom-input h-[50px] min-w-0" />
                  </div>
                  <div className="flex flex-col gap-1 w-full">
                    <label className="text-xs font-outfit font-bold text-slate-500 uppercase tracking-wide px-1">Gender*</label>
                    <select name="gender" value={form.gender} onChange={handleChange} required className="w-full px-4 py-3 geom-input h-[50px]">
                      <option value="">Gender*</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Contact & Verification Group */}
              <div className="space-y-4 pt-4 border-t-2 border-dashed border-slate-200">
                <label className="text-sm font-outfit font-bold text-geom-foreground uppercase tracking-wide block mb-1">Contact & Verification</label>
                <input name="email" value={form.email} onChange={handleChange} required placeholder="Email ID*" type="email" className="w-full px-4 py-3 geom-input" />
                <input name="phone" value={form.phone} onChange={handleChange} required placeholder="Phone Number*" type="tel" className="w-full px-4 py-3 geom-input" />
                <input name="pincode" value={form.pincode} onChange={handleChange} required placeholder="Pincode*" maxLength="6" className="w-full px-4 py-3 geom-input" />
              </div>

              {/* Reference Group */}
              <div className="space-y-4 pt-4 border-t-2 border-dashed border-slate-200">
                <label className="text-sm font-outfit font-bold text-geom-foreground uppercase tracking-wide block mb-1">Reference</label>
                <select name="reference" value={form.reference} onChange={handleChange} className="w-full px-4 py-3 geom-input h-[50px]">
                  <option value="">Select Reference (Optional)</option>
                  <option value="Self">Self</option>
                  {members.map((member, idx) => (
                    <option key={idx} value={member.name}>
                      {member.name} ({member.count})
                    </option>
                  ))}
                </select>
              </div>

              {/* Location Details Group */}
              <div className="space-y-4 pt-4 border-t-2 border-dashed border-slate-200">
                <label className="text-sm font-outfit font-bold text-geom-foreground uppercase tracking-wide block mb-1">Location Details</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1 w-full">
                    <label className="text-xs font-outfit font-bold text-slate-500 uppercase tracking-wide px-1">State*</label>
                    <select 
                      name="state" 
                      value={form.state} 
                      onChange={handleChange} 
                      required 
                      className="w-full px-4 py-3 geom-input h-[50px]"
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
                    <label className="text-xs font-outfit font-bold text-slate-500 uppercase tracking-wide px-1">City/District*</label>
                    {cities.length > 0 ? (
                      <select 
                        name="city" 
                        value={form.city} 
                        onChange={handleChange} 
                        required 
                        className="w-full px-4 py-3 geom-input h-[50px]"
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
                        className="w-full px-4 py-3 geom-input h-[50px]" 
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Membership Validity Display */}
              {(() => {
                const { from, to } = calculateValidityDates();
                return (
                  <div className="p-4 bg-[#FBBF24] border-2 border-[#1E293B] rounded-xl text-[#1E293B] shadow-geom-soft flex flex-col gap-1 my-4">
                    <span className="font-outfit font-bold text-[#1E293B] text-lg uppercase tracking-wide">📅 Membership Validity</span>
                    <p className="font-jakarta text-sm font-medium">
                      Your membership will be active from <span className="font-bold">{from}</span> to <span className="font-bold">{to}</span> (Valid for 1 year).
                    </p>
                  </div>
                );
              })()}

              {/* Profile Photo Upload Field */}
              <div className="flex flex-col gap-1.5 pt-4 border-t-2 border-dashed border-slate-200">
                <label className="text-sm font-outfit font-bold text-geom-foreground uppercase tracking-wide flex items-center gap-2 mb-1">
                  <div className="bg-[#34D399] rounded-full p-1 border-2 border-[#1E293B] shadow-sm"><User className="w-4 h-4 text-[#1E293B]" strokeWidth={3} /></div>
                  Profile Photo (Optional)
                </label>
                <div className="relative border-2 border-dashed border-[#1E293B] rounded-xl p-4 text-center hover:bg-[#F1F5F9] transition-colors bg-white flex flex-col items-center justify-center cursor-pointer shadow-geom-soft">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <UploadCloud className="w-8 h-8 text-[#1E293B] mb-2" />
                  {photoPreview ? (
                    <div className="flex items-center gap-2 mt-1 z-10">
                      <img src={photoPreview} alt="Preview" className="w-12 h-12 rounded-full object-cover border-2 border-[#1E293B] shadow-geom" />
                      <span className="text-sm text-[#1E293B] font-jakarta font-semibold truncate max-w-[200px]">{photoFile?.name}</span>
                    </div>
                  ) : (
                    <>
                      <span className="text-base text-[#1E293B] font-jakarta font-bold">Click to upload your profile photo</span>
                      <span className="text-xs font-jakarta text-slate-500 font-semibold uppercase tracking-wide mt-1">PNG, JPG, WEBP</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Terms and Conditions Checkbox */}
            <div className="flex items-start gap-3 pt-4 mb-6">
              <input
                id="agreeTerms"
                type="checkbox"
                checked={agreeTerms}
                onChange={e => setAgreeTerms(e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-2 border-[#1E293B] text-[#8B5CF6] focus:ring-0 cursor-pointer accent-[#8B5CF6] shadow-sm"
                required
              />
              <label htmlFor="agreeTerms" className="text-sm text-[#1E293B] font-jakarta font-semibold cursor-pointer select-none leading-tight">
                I agree to the{" "}
                <button
                  type="button"
                  onClick={() => setShowTermsModal(true)}
                  className="text-[#8B5CF6] hover:text-[#F472B6] underline font-bold focus:outline-none transition-colors"
                >
                  Membership Terms & Conditions
                </button>{" "}
                of PathSarthi Trust.
              </label>
            </div>

            <button type="submit" className="w-full candy-btn candy-btn-primary py-4 text-xl flex items-center justify-center gap-2" disabled={loading}>
              {loading ? (
                <>
                  <div className="w-5 h-5 border-[3px] border-white border-t-transparent rounded-full animate-spin"></div>
                  {photoFile ? 'Uploading...' : 'Processing...'}
                </>
              ) : 'Proceed to Payment'}
            </button>
          </form>
        )}

        {step === 'payment' && (
          <div className="flex flex-col items-center gap-6 font-jakarta">
            <div className="text-center text-2xl font-outfit font-extrabold text-[#1E293B]">Complete Payment to Activate</div>
            
            <div className="w-full sticker-card p-6 space-y-4">
              <div className="flex justify-between items-start gap-4 border-b-2 border-dashed border-slate-200 pb-3 text-base text-[#1E293B]">
                <span className="font-semibold text-slate-500 uppercase tracking-wide shrink-0">Applicant</span>
                <span className="font-bold text-right break-words">{form.fullName}</span>
              </div>
              <div className="flex justify-between items-start gap-4 border-b-2 border-dashed border-slate-200 pb-3 text-base text-[#1E293B]">
                <span className="font-semibold text-slate-500 uppercase tracking-wide shrink-0">Email</span>
                <span className="font-bold text-right break-all">{form.email}</span>
              </div>
              <div className="flex justify-between items-start gap-4 border-b-2 border-dashed border-slate-200 pb-3 text-base text-[#1E293B]">
                <span className="font-semibold text-slate-500 uppercase tracking-wide shrink-0">Phone</span>
                <span className="font-bold text-right break-words">{form.phone}</span>
              </div>
              <div className="flex justify-between pt-2 text-lg font-bold text-[#1E293B] items-center">
                <span className="font-outfit uppercase tracking-wide">Membership Fee</span>
                <span className="text-[#8B5CF6] text-3xl font-outfit font-extrabold">₹100</span>
              </div>
            </div>

            {/* Payment Flow */}
            {paymentMethod === 'razorpay' ? (
              <div className="w-full flex flex-col gap-4 mt-2">
                <div className="bg-green-50 border-2 border-green-600 rounded-xl p-6 shadow-sm relative">
                  <div className="absolute -top-3 left-4 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1 shadow-sm">
                    Recommended
                  </div>
                  
                  <h3 className="text-xl font-bold text-green-900 mb-4 font-outfit mt-2">Pay Securely (Instant Verification)</h3>
                  
                  <ul className="space-y-2 mb-6 text-green-800 font-jakarta font-medium text-sm">
                    <li className="flex items-center gap-2">Instant Confirmation</li>
                    <li className="flex items-center gap-2">Auto Verification</li>
                    <li className="flex items-center gap-2">No Screenshot Required</li>
                  </ul>

                  <button 
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-lg text-xl transition-colors flex items-center justify-center gap-2 shadow-md" 
                    disabled={loading} 
                    onClick={handlePayWithRazorpay}
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-[3px] border-white border-t-transparent rounded-full animate-spin"></div>
                        Processing...
                      </>
                    ) : 'Pay ₹100 Securely'}
                  </button>
                  <div className="flex items-center justify-center gap-4 mt-4 text-xs font-bold text-green-700/70 uppercase tracking-wide">
                    <span className="flex items-center gap-1">Secure</span>
                    <span className="flex items-center gap-1">Instant</span>
                    <span className="flex items-center gap-1">Razorpay</span>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-2 mt-4">
                  <span className="text-sm font-jakarta font-semibold text-slate-500">Having trouble with Razorpay?</span>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('upi_qr')}
                    className="text-slate-500 hover:text-slate-800 text-sm font-bold underline decoration-dashed underline-offset-4 transition-colors"
                  >
                    Use Manual UPI (Requires Screenshot)
                  </button>
                </div>
              </div>
            ) : (
              <div className="w-full flex flex-col gap-4 mt-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('razorpay')}
                  className="text-green-600 hover:text-green-700 text-sm font-bold flex items-center gap-1 w-fit"
                >
                  ← Back to Secure Payment
                </button>

                <div className="bg-orange-50 border-2 border-orange-200 text-orange-800 text-xs p-3 rounded-xl font-jakarta">
                  <span className="font-bold">Notice:</span> We strongly recommend using Razorpay for instant payment verification. Manual QR payments require screenshot verification and may take additional time.
                </div>

                <form onSubmit={handlePayManualUPI} className="w-full space-y-4">
                <div className="flex flex-col items-center justify-center p-6 bg-white border-2 border-[#1E293B] rounded-xl shadow-geom-soft relative">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-[#F472B6] rounded-bl-full mix-blend-multiply opacity-20 pointer-events-none"></div>
                  <img
                    src="/Qr-code-3.jpg"
                    alt="UPI QR Code"
                    className="w-48 h-48 object-contain rounded-lg shadow-sm border-2 border-[#1E293B] mb-4"
                  />
                  <p className="text-xs font-outfit font-bold text-slate-500 uppercase tracking-wide">Pathsarthi Trust</p>
                </div>

                <div className="space-y-1 mt-4">
                  <label className="text-sm font-outfit font-bold text-geom-foreground uppercase tracking-wide block mb-1">UPI ID</label>
                  <div className="flex items-center justify-between bg-white geom-input px-4 py-2">
                    <span className="font-jakarta text-lg font-bold text-[#1E293B]">8958421200m@pnb</span>
                    <button
                      type="button"
                      onClick={handleCopyUPI}
                      className="text-[#8B5CF6] p-2 hover:bg-[#F1F5F9] rounded-full transition-colors"
                    >
                      {copied ? <Check className="w-5 h-5 text-[#1E293B]" /> : <Copy className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="bg-[#E0F2FE] border-2 border-[#1E293B] rounded-xl shadow-geom-soft p-4 text-sm text-[#1E293B] font-jakarta font-medium leading-relaxed my-2">
                  <span className="font-bold">Scan QR or copy UPI ID to pay ₹100.</span>
                  <br /><br />
                  Please <span className="font-bold underline decoration-dashed text-[#8B5CF6]">send the payment screenshot</span> to our trust number: <span className="font-outfit font-extrabold text-[#1E293B]">8958421200</span>.
                </div>

                {/* Payment Screenshot Upload Field */}
                <div className="flex flex-col gap-1.5 pt-4 border-t-2 border-dashed border-slate-200">
                  <label className="text-sm font-outfit font-bold text-geom-foreground uppercase tracking-wide block mb-1">
                    Upload Payment Screenshot*
                  </label>
                  <div className="relative border-2 border-dashed border-[#1E293B] rounded-xl p-4 text-center hover:bg-[#F1F5F9] transition-colors bg-white flex flex-col items-center justify-center cursor-pointer shadow-geom-soft">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleScreenshotChange}
                      required
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <UploadCloud className="w-8 h-8 text-[#1E293B] mb-2" />
                    {screenshotPreview ? (
                      <div className="flex items-center gap-2 mt-1 z-10">
                        <img src={screenshotPreview} alt="Screenshot Preview" className="w-12 h-12 rounded object-cover border-2 border-[#1E293B] shadow-sm" />
                        <span className="text-sm font-jakarta font-semibold text-[#1E293B] truncate max-w-[200px]">{screenshotFile?.name}</span>
                      </div>
                    ) : (
                      <>
                        <span className="text-base font-jakarta font-bold text-[#1E293B]">Click to upload payment screenshot</span>
                        <span className="text-xs font-jakarta font-semibold uppercase tracking-wide text-slate-500 mt-1">PNG, JPG, WEBP</span>
                      </>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full candy-btn candy-btn-primary py-4 text-xl flex items-center justify-center gap-2 mt-4"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-[3px] border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </>
                  ) : 'I Have Paid & Sent Screenshot'}
                </button>
              </form>
              </div>
            )}
          </div>
        )}

        {step === 'done' && (() => {
          const { from: fromStr, to: toStr } = calculateValidityDates();

          return (
            <div className="flex flex-col gap-8 py-4 animate-in fade-in duration-500">
              
              {/* Header inside the Success Screen */}
              <div className="flex flex-col md:flex-row items-center justify-between border-b-2 border-dashed border-slate-200 pb-6 gap-4">
                <div className="flex items-center gap-4">
                  <img src="/Logo-2.png" alt="PathSarthi Logo" className="w-16 h-auto object-contain" />
                  <div>
                    <h2 className="text-3xl font-outfit font-extrabold text-[#1E293B] tracking-tight">PathSarthi Trust</h2>
                    <p className="text-sm font-jakarta font-bold text-[#8B5CF6] uppercase tracking-wider">Hope • Heal • Humanity</p>
                  </div>
                </div>
                <div>
                  {isQRPayment ? (
                    <span className="px-4 py-2 bg-[#FBBF24] text-[#1E293B] font-jakarta font-bold rounded-full border-2 border-[#1E293B] shadow-geom flex items-center gap-2 text-sm uppercase tracking-wide">
                      <span className="w-3 h-3 rounded-full bg-[#1E293B] animate-pulse"></span>
                      Registration Staged
                    </span>
                  ) : (
                    <span className="px-4 py-2 bg-[#34D399] text-[#1E293B] font-jakarta font-bold rounded-full border-2 border-[#1E293B] shadow-geom flex items-center gap-2 text-sm uppercase tracking-wide">
                      <span className="w-3 h-3 rounded-full bg-[#1E293B] animate-pulse"></span>
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
                  <div className="relative rounded-2xl overflow-hidden shadow-geom-soft border-2 border-[#1E293B] bg-black aspect-video flex items-center justify-center group hover:-translate-y-1 transition-all duration-300">
                    <video 
                      src="/IMG_7027.MP4" 
                      className="w-full h-full object-cover pointer-events-none" 
                      autoPlay 
                      playsInline 
                    />
                  </div>

                  {/* Real World Impact of 100rs */}
                  <div className="sticker-card p-6 space-y-4">
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-[#1E293B] text-2xl font-outfit tracking-tight">How ₹100 Drives Real Change</h3>
                    </div>
                    
                    <p className="text-base font-medium font-jakarta text-slate-600 leading-relaxed">
                      In a developing nation like India, small contributions compile to solve mammoth-sized challenges. Non-Governmental Organizations (NGOs) and community groups work on-ground to bridge crucial gaps. Your ₹100 membership fee does not just verify your account—it funds immediate local relief:
                    </p>

                    <div className="grid grid-cols-1 gap-4 pt-2">
                      <div className="flex items-start gap-3 bg-[#F1F5F9] p-4 rounded-xl border-2 border-transparent hover:border-[#F472B6] transition-colors">
                        <span className="text-2xl pt-1">🎒</span>
                        <div className="space-y-1">
                          <h4 className="text-lg font-outfit font-bold text-[#1E293B]">Childhood Education</h4>
                          <p className="text-sm font-jakarta font-medium text-slate-600">Buys 5 school notebooks & stationery kits for underprivileged children to prevent them from dropping out.</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 bg-[#F1F5F9] p-4 rounded-xl border-2 border-transparent hover:border-[#34D399] transition-colors">
                        <span className="text-2xl pt-1">🍲</span>
                        <div className="space-y-1">
                          <h4 className="text-lg font-outfit font-bold text-[#1E293B]">Zero Hunger Initiative</h4>
                          <p className="text-sm font-jakarta font-medium text-slate-600">Provides 3 wholesome, hot mid-day meals to street kids, securing their basic nutritional needs.</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 bg-[#F1F5F9] p-4 rounded-xl border-2 border-transparent hover:border-[#FBBF24] transition-colors">
                        <span className="text-2xl pt-1">🏥</span>
                        <div className="space-y-1">
                          <h4 className="text-lg font-outfit font-bold text-[#1E293B]">Health & Hygiene</h4>
                          <p className="text-sm font-jakarta font-medium text-slate-600">Supports basic sanitary hygiene pads and clean drinking water kits for families in slum clusters.</p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 text-center">
                      <p className="text-xs font-jakarta font-bold text-slate-400 uppercase tracking-widest border-t-2 border-dashed border-slate-200 pt-4">PathSarthi Trust • Transforming Lives Together</p>
                    </div>
                  </div>
                </div>

                {/* Right Column: User Profile & Details */}
                <div className="space-y-6">
                  
                  {/* Thank You Card */}
                  <div className="flex flex-col items-center text-center p-8 bg-[#8B5CF6] text-white rounded-2xl border-2 border-[#1E293B] shadow-geom-pink relative">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/20 rounded-bl-full pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-16 h-16 bg-[#FBBF24] rounded-tr-full border-t-2 border-r-2 border-[#1E293B] pointer-events-none"></div>
                    
                    {photoPreview || form.profilePhotoUrl ? (
                      <img 
                        src={photoPreview || form.profilePhotoUrl} 
                        alt="Member Profile" 
                        className="w-24 h-24 rounded-full border-4 border-white shadow-geom object-cover mb-4 relative z-10 animate-in zoom-in duration-300"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-white text-[#8B5CF6] flex items-center justify-center font-extrabold text-4xl font-outfit shadow-geom border-4 border-[#1E293B] mb-4 relative z-10 animate-in zoom-in duration-300">
                        {form.fullName ? form.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'PS'}
                      </div>
                    )}
                    <h3 className="text-3xl font-outfit font-extrabold leading-snug relative z-10">Welcome to the Family! ❤️</h3>
                    <p className="text-xl font-bold font-jakarta mt-1 relative z-10 opacity-90">{form.fullName}</p>
                    <p className="text-base font-medium font-jakarta mt-4 leading-relaxed relative z-10 opacity-90">
                      Dear <span className="font-bold bg-white/20 px-1 rounded">{form.fullName}</span>, we are extremely honored to have you as a registered member. You are now a <strong>Pathsarthi</strong>—a charioteer guiding social change.
                    </p>
                  </div>

                  {/* Membership Info Card */}
                  <div className="sticker-card p-6 space-y-4">
                    <h4 className="text-lg font-outfit font-extrabold text-[#1E293B] uppercase tracking-widest border-b-2 border-dashed border-slate-200 pb-3">Membership Details</h4>
                    
                    <div className="flex justify-between text-base font-jakarta font-semibold text-slate-600">
                      <span>Email</span>
                      <span className="text-[#1E293B] font-bold">{form.email}</span>
                    </div>

                    <div className="flex justify-between text-base font-jakarta font-semibold text-slate-600">
                      <span>Phone</span>
                      <span className="text-[#1E293B] font-bold">{form.phone}</span>
                    </div>

                    <div className="flex justify-between text-base font-jakarta font-semibold text-slate-600 items-center">
                      <span>Validity Range</span>
                      <span className="bg-[#E2E8F0] px-2 py-1 rounded-md text-xs font-bold text-[#1E293B]">
                        {fromStr} - {toStr}
                      </span>
                    </div>

                    {isQRPayment ? (
                      <div className="pt-4 border-t-2 border-dashed border-slate-200">
                        <div className="bg-[#FBBF24] border-2 border-[#1E293B] rounded-xl p-4 text-left text-sm font-jakarta font-medium text-[#1E293B] space-y-2 shadow-geom-soft">
                          <p className="font-outfit font-bold text-lg flex items-center gap-2">
                            <span>⚠️</span> Verification Required
                          </p>
                          <p>
                            Your payment screenshot is uploaded. Please ensure you also send it to <span className="font-black underline decoration-dashed">8958421200</span> via WhatsApp to expedite admin activation.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center text-base font-jakarta font-semibold text-slate-600 border-t-2 border-dashed pt-4 border-slate-200">
                        <span>Payment ID</span>
                        <span className="font-mono bg-[#F1F5F9] px-2 py-1 rounded-md border-2 border-slate-300 text-[#8B5CF6] text-xs font-bold select-all max-w-[170px] truncate">
                          {paymentId}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Return Button */}
                  <button 
                    onClick={() => window.location.href = "/"}
                    className="w-full candy-btn candy-btn-secondary py-4 text-lg"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1E293B]/60 p-4 animate-in fade-in duration-300 font-jakarta">
          <div className="bg-white border-2 border-[#1E293B] rounded-2xl shadow-geom-soft max-w-2xl w-full max-h-[80vh] flex flex-col relative animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b-2 border-slate-200 flex items-center justify-between bg-[#F1F5F9] rounded-t-2xl">
              <h3 className="text-2xl font-outfit font-extrabold text-[#1E293B]">Membership Terms & Conditions</h3>
              <button
                onClick={() => setShowTermsModal(false)}
                className="text-slate-500 hover:text-[#F472B6] p-2 bg-white rounded-full border-2 border-slate-300 hover:border-[#1E293B] hover:shadow-geom transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
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
            <div className="px-6 py-4 border-t-2 border-slate-200 flex justify-end gap-3 bg-white rounded-b-2xl">
              <button
                onClick={() => {
                  setAgreeTerms(true);
                  setShowTermsModal(false);
                }}
                className="candy-btn candy-btn-primary px-8 py-3"
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