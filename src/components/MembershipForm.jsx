import React, { useState, useRef, useEffect } from 'react';
import { auth, db } from '../config/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { uploadToCloudinary } from '../utils/cloudinary';
import { UploadCloud, User } from 'lucide-react';
// Remove import RazorpayButton from './RazorpayButton';

const RAZORPAY_KEY = process.env.REACT_APP_RAZORPAY_KEY_ID;

const initialForm = {
  firstName: '',
  middleName: '',
  lastName: '',
  age: '',
  gender: '',
  city: '',
  state: '',
  email: '',
  phone: '',
  aadhaar: '',
  profilePhotoUrl: '',
  image: '',
};

const MembershipForm = () => {
  const [form, setForm] = useState(initialForm);
  const [step, setStep] = useState('form'); // form | payment | done
  const [loading, setLoading] = useState(false);
  // No OTP, no recaptcha
  const [toast, setToast] = useState(null);
  const [paymentId, setPaymentId] = useState('');

  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  // Load Razorpay script on mount
  useEffect(() => {
    if (!window.Razorpay) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

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
          await addDoc(collection(db, "memberships"), {
            ...form,
            paymentId: generatedId,
            createdAt: new Date(),
            status: 'completed'
          });
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
    setTimeout(() => setToast(null), 3500);
  };

  // Form change handler
  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  // Validate form
  const validateForm = () => {
    if (!form.firstName || !form.lastName || !form.age || !form.gender || !form.city || !form.state || !form.email || !form.phone || !form.aadhaar) {
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
      showToast('Enter a valid age.', 'error');
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
      let uploadedUrl = '';
      if (photoFile) {
        const result = await uploadToCloudinary(photoFile);
        uploadedUrl = result.imageUrl;
      }
      setForm(f => ({ ...f, profilePhotoUrl: uploadedUrl, image: uploadedUrl }));
      setStep('payment');
    } catch (error) {
      console.error(error);
      showToast('Failed to upload profile photo. Please try again.', 'error');
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
                <div className="grid grid-cols-2 gap-2.5">
                  <input name="age" value={form.age} onChange={handleChange} required placeholder="Age*" type="number" min="1" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#ff7300] focus:ring-2 focus:ring-orange-200 outline-none transition-all placeholder:text-slate-400 bg-slate-50/50 hover:bg-slate-50 focus:bg-white text-slate-800 font-semibold text-sm" />
                  <select name="gender" value={form.gender} onChange={handleChange} required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#ff7300] focus:ring-2 focus:ring-orange-200 outline-none transition-all text-slate-800 font-semibold text-sm bg-slate-50/50 hover:bg-slate-50 focus:bg-white">
                    <option value="">Gender*</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Contact & Verification Group */}
              <div className="space-y-3 pt-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">Contact & Verification</label>
                <input name="email" value={form.email} onChange={handleChange} required placeholder="Email ID*" type="email" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#ff7300] focus:ring-2 focus:ring-orange-200 outline-none transition-all placeholder:text-slate-400 bg-slate-50/50 hover:bg-slate-50 focus:bg-white text-slate-800 font-semibold text-sm" />
                <input name="phone" value={form.phone} onChange={handleChange} required placeholder="Phone Number*" type="tel" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#ff7300] focus:ring-2 focus:ring-orange-200 outline-none transition-all placeholder:text-slate-400 bg-slate-50/50 hover:bg-slate-50 focus:bg-white text-slate-800 font-semibold text-sm" />
                <input name="aadhaar" value={form.aadhaar} onChange={handleChange} required placeholder="Aadhaar Card Number*" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#ff7300] focus:ring-2 focus:ring-orange-200 outline-none transition-all placeholder:text-slate-400 bg-slate-50/50 hover:bg-slate-50 focus:bg-white text-slate-800 font-semibold text-sm" />
              </div>

              {/* Location Details Group */}
              <div className="space-y-3 pt-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">Location Details</label>
                <div className="grid grid-cols-2 gap-2.5">
                  <input name="city" value={form.city} onChange={handleChange} required placeholder="City*" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#ff7300] focus:ring-2 focus:ring-orange-200 outline-none transition-all placeholder:text-slate-400 bg-slate-50/50 hover:bg-slate-50 focus:bg-white text-slate-800 font-semibold text-sm" />
                  <input name="state" value={form.state} onChange={handleChange} required placeholder="State*" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#ff7300] focus:ring-2 focus:ring-orange-200 outline-none transition-all placeholder:text-slate-400 bg-slate-50/50 hover:bg-slate-50 focus:bg-white text-slate-800 font-semibold text-sm" />
                </div>
              </div>

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

        {step === 'done' && (
          <div className="flex flex-col items-center gap-6 py-6 text-center">
            <div className="text-3xl text-green-600 font-black animate-bounce-slow">✅ Payment Successful!</div>
            <div className="text-slate-600 font-medium">
              Thank you for becoming a Pathsarthi Member.<br />
              Your Membership Payment ID:
              <div className="font-mono text-indigo-600 font-bold bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-2 mt-3 select-all text-lg shadow-sm">
                {paymentId}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MembershipForm; 