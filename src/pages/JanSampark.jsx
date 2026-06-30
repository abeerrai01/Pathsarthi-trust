import React, { useState, useRef, useEffect } from 'react';
import { db } from '../config/firebase';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import { Check, Users } from 'lucide-react';

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
  phone: '',
  dob: '',
  gender: '',
  pincode: '',
  state: '',
  city: '', // This will serve as district
  employment: '',
  reference: '',
};

const JanSampark = () => {
  const [form, setForm] = useState(initialForm);
  const [step, setStep] = useState('form'); // form | payment | done
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [paymentId, setPaymentId] = useState('');
  const [createdDocId, setCreatedDocId] = useState('');
  const [cities, setCities] = useState([]);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const createdDocIdRef = useRef('');
  const formRef = useRef(form);

  useEffect(() => {
    formRef.current = form;
  }, [form]);

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
      amount: 5 * 100, // ₹5 in paise
      currency: "INR",
      name: "Path Sarthi Trust",
      description: "Jan Sampark Registration",
      image: "https://www.pathsarthi.in/logo.png",
      handler: async function (response) {
        setLoading(true);
        try {
          const generatedId = response.razorpay_payment_id;

          const docId = createdDocIdRef.current || createdDocId;
          if (docId) {
            await updateDoc(doc(db, "jan_sampark", docId), {
              paymentId: generatedId,
              status: 'completed',
            });
          } else {
            await addDoc(collection(db, "jan_sampark"), {
              ...formRef.current,
              paymentId: generatedId,
              createdAt: new Date(),
              status: 'completed',
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
        contact: form.phone,
      },
      theme: {
        color: "#ff7300",
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const showToast = (msg, type = 'info') => {
    setToast({ msg, type });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => setToast(null), 3500);
  };

  const handleChange = async e => {
    const { name, value } = e.target;
    let newValue = value;

    if (name === 'pincode') {
      newValue = newValue.replace(/\D/g, '').slice(0, 6);
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

  const validateForm = () => {
    if (!form.fullName || !form.dob || !form.gender || !form.city || !form.state || !form.phone || !form.pincode || !form.employment) {
      showToast('Please fill all required fields.', 'error');
      return false;
    }
    if (!/^\d{10}$/.test(form.phone)) {
      showToast('Enter a valid 10-digit phone number.', 'error');
      return false;
    }
    if (!agreeTerms) {
      showToast('You must agree to the Terms and Conditions to proceed.', 'error');
      return false;
    }
    return true;
  };

  const handleFormSubmit = async e => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Save pending registration in Firestore
      const docRef = await addDoc(collection(db, "jan_sampark"), {
        ...form,
        paymentId: '',
        createdAt: new Date(),
        status: 'pending'
      });

      setCreatedDocId(docRef.id);
      createdDocIdRef.current = docRef.id;
      setStep('payment');
    } catch (error) {
      console.error(error);
      showToast('Failed to save application. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 via-slate-50 to-orange-50 py-16 px-4 sm:px-6 overflow-hidden">
      
      <div className={`w-full relative transition-all duration-500 bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl px-8 pb-8 pt-20 md:px-10 md:pb-10 md:pt-28 mx-auto border border-indigo-100/50 flex flex-col mt-28 md:mt-32 ${step === 'done' ? 'max-w-3xl' : 'max-w-xl'}`}>
        
        {/* Engaging Overlay Illustration */}
        <div className="absolute -top-32 md:-top-40 left-1/2 transform -translate-x-1/2 w-72 md:w-96 h-auto z-20 drop-shadow-[0_20px_20px_rgba(79,70,229,0.15)] animate-in fade-in slide-in-from-bottom-8 zoom-in-95 duration-1000">
          <img src="/Team spirit-cuate.png" alt="Team Spirit" className="w-full h-full object-contain hover:-translate-y-2 hover:scale-105 transition-all duration-500" />
        </div>

        {step !== 'done' && (
          <div className="flex flex-col items-center mb-8 relative z-10">
            <img src="/Logo-2.png" alt="PathSarthi Logo" className="w-16 h-auto mb-4 object-contain opacity-90" />
            <h2 className="text-2xl md:text-3xl font-black text-center text-indigo-700 tracking-tight">Jan Sampark Abhiyan</h2>
            <p className="text-xs text-gray-500 font-bold mt-1.5 uppercase tracking-widest">Connect • Grow • Impact</p>
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
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">Personal Details</label>
                <input name="fullName" value={form.fullName} onChange={handleChange} required placeholder="Full Name*" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all placeholder:text-slate-400 bg-slate-50/50 hover:bg-slate-50 focus:bg-white text-slate-800 font-semibold text-sm" />
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="flex flex-col gap-1 w-full">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Mobile Number*</label>
                    <input name="phone" value={form.phone} onChange={handleChange} required placeholder="Phone Number*" type="tel" maxLength="10" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all placeholder:text-slate-400 bg-slate-50/50 hover:bg-slate-50 focus:bg-white text-slate-800 font-semibold text-sm" />
                  </div>
                  <div className="flex flex-col gap-1 w-full">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Date of Birth*</label>
                    <input name="dob" value={form.dob} onChange={handleChange} required type="date" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-slate-800 font-semibold text-sm bg-slate-50/50 hover:bg-slate-50 focus:bg-white" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="flex flex-col gap-1 w-full">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Gender*</label>
                    <select name="gender" value={form.gender} onChange={handleChange} required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-slate-800 font-semibold text-sm bg-slate-50/50 hover:bg-slate-50 focus:bg-white h-[46px]">
                      <option value="">Select Gender*</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1 w-full">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Employment Status*</label>
                    <select name="employment" value={form.employment} onChange={handleChange} required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-slate-800 font-semibold text-sm bg-slate-50/50 hover:bg-slate-50 focus:bg-white h-[46px]">
                      <option value="">Select Employment*</option>
                      <option value="Student">Student</option>
                      <option value="Job">Job</option>
                      <option value="Business">Business</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Location Details Group */}
              <div className="space-y-3 pt-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">Location Details</label>
                <div className="flex flex-col gap-1 w-full">
                  <input name="pincode" value={form.pincode} onChange={handleChange} required placeholder="Pincode*" maxLength="6" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all placeholder:text-slate-400 bg-slate-50/50 hover:bg-slate-50 focus:bg-white text-slate-800 font-semibold text-sm" />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="flex flex-col gap-1 w-full">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">State*</label>
                    <select 
                      name="state" 
                      value={form.state} 
                      onChange={handleChange} 
                      required 
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-slate-800 font-semibold text-sm bg-slate-50/50 hover:bg-slate-50 focus:bg-white h-[46px]"
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
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">District/City*</label>
                    {cities.length > 0 ? (
                      <select 
                        name="city" 
                        value={form.city} 
                        onChange={handleChange} 
                        required 
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-slate-800 font-semibold text-sm bg-slate-50/50 hover:bg-slate-50 focus:bg-white h-[46px]"
                      >
                        <option value="">Select District</option>
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
                        placeholder="District/City*" 
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all placeholder:text-slate-400 bg-slate-50/50 hover:bg-slate-50 focus:bg-white text-slate-800 font-semibold text-sm h-[46px]" 
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Reference Group */}
              <div className="space-y-3 pt-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">Reference</label>
                <input name="reference" value={form.reference} onChange={handleChange} placeholder="Referred By (Optional)" type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all placeholder:text-slate-400 bg-slate-50/50 hover:bg-slate-50 focus:bg-white text-slate-800 font-semibold text-sm" />
              </div>

            </div>

            {/* Terms and Conditions Checkbox */}
            <div className="flex items-start gap-2.5 pt-2 mb-4">
              <input
                id="agreeTerms"
                type="checkbox"
                checked={agreeTerms}
                onChange={e => setAgreeTerms(e.target.checked)}
                className="mt-1 w-4.5 h-4.5 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer accent-indigo-600"
                required
              />
              <label htmlFor="agreeTerms" className="text-xs text-slate-500 font-semibold cursor-pointer select-none leading-relaxed">
                I agree to the Terms & Conditions of PathSarthi Trust's Jan Sampark program.
              </label>
            </div>

            <button type="submit" className="w-full bg-indigo-600 hover:bg-[#ff7300] text-white font-bold py-3.5 rounded-xl transition duration-300 shadow-md hover:shadow-orange-200 hover:-translate-y-0.5 transform active:translate-y-0 disabled:opacity-50 flex items-center justify-center gap-2 text-base" disabled={loading}>
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </>
              ) : 'Proceed to Payment'}
            </button>
          </form>
        )}

        {step === 'payment' && (
          <div className="flex flex-col items-center gap-6">
            <div className="text-center text-lg font-semibold text-indigo-700">Please complete the payment to finalize your registration.</div>
            
            <div className="w-full bg-slate-50 border border-slate-100 rounded-xl p-5 space-y-3">
              <div className="flex justify-between border-b pb-2.5 text-sm text-gray-600">
                <span>Applicant Name</span>
                <span className="font-semibold text-gray-900">{form.fullName}</span>
              </div>
              <div className="flex justify-between border-b pb-2.5 text-sm text-gray-600">
                <span>Mobile Number</span>
                <span className="font-semibold text-gray-900">{form.phone}</span>
              </div>
              <div className="flex justify-between border-b pb-2.5 text-sm text-gray-600">
                <span>Location</span>
                <span className="font-semibold text-gray-900">{form.city}, {form.state}</span>
              </div>
              <div className="flex justify-between pt-2.5 text-base font-bold text-gray-800">
                <span>Registration Fee</span>
                <span className="text-indigo-600 text-lg">₹5</span>
              </div>
            </div>

            <button 
              className="w-full bg-indigo-600 hover:bg-[#ff7300] text-white font-bold py-3.5 rounded-xl transition duration-300 shadow-md hover:shadow-orange-200 hover:-translate-y-0.5 transform active:translate-y-0 flex items-center justify-center gap-2 disabled:opacity-50 text-base" 
              disabled={loading} 
              onClick={handlePayWithRazorpay}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </>
              ) : 'Pay ₹5 & Complete Registration'}
            </button>
          </div>
        )}

        {step === 'done' && (
          <div className="flex flex-col gap-6 py-4 items-center justify-center text-center animate-in fade-in duration-500">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-2 shadow-inner">
              <Check className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-2xl font-black text-slate-800">Registration Successful!</h3>
            <p className="text-slate-600 font-medium">Thank you for joining the Jan Sampark Abhiyan.</p>
            
            <div className="bg-slate-50 w-full p-4 rounded-xl border border-slate-100 text-sm flex flex-col gap-2 mt-4 text-left">
              <div className="flex justify-between">
                <span className="text-slate-500">Name:</span>
                <span className="font-semibold text-slate-800">{form.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Phone:</span>
                <span className="font-semibold text-slate-800">{form.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment ID:</span>
                <span className="font-mono text-xs font-bold text-indigo-600">{paymentId}</span>
              </div>
            </div>

            <button
              onClick={() => window.location.href = '/'}
              className="mt-6 px-8 py-3 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl transition-all shadow-md"
            >
              Return Home
            </button>
          </div>
        )}
      </div>

      {/* Community Redirect Button */}
      {step !== 'done' && (
        <div className="mt-8 text-center animate-in slide-in-from-bottom-4 duration-500">
          <p className="text-slate-500 mb-3 font-medium text-sm">Already connected or want to see who joined?</p>
          <a href="/jan-sampark-network" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-indigo-700 font-bold rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all border border-indigo-100">
            <Users size={18} /> View Our Community
          </a>
        </div>
      )}
    </div>
  );
};

export default JanSampark;
