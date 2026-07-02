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
  const [donationAmount, setDonationAmount] = useState(5);
  
  const predefinedAmounts = [5, 10, 50, 100, 250, 500, 1000];

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
      amount: (donationAmount || 5) * 100, // Amount in paise
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
              amount: donationAmount || 5,
              status: 'completed',
            });
          } else {
            await addDoc(collection(db, "jan_sampark"), {
              ...formRef.current,
              amount: donationAmount || 5,
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
    if (!form.fullName || !form.dob || !form.gender || !form.city || !form.state || !form.phone || !form.pincode) {
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-geom-light py-16 px-4 sm:px-6 overflow-hidden font-jakarta relative">
      
      {/* Background Dots */}
      <div className="absolute inset-0 bg-dot-pattern opacity-50 pointer-events-none"></div>

      {/* Hero Header & Image */}
      {step !== 'done' && (
        <div className="relative z-20 flex flex-col items-center text-center mb-8 animate-in slide-in-from-bottom-8 duration-700 mt-12 md:mt-16">
          <img src="/Team spirit-cuate.png" alt="Team Spirit" className="w-64 md:w-80 h-auto object-contain drop-shadow-xl hover:-translate-y-2 transition-transform duration-300 mb-4" />
          <div className="flex flex-col items-center bg-white border-2 border-[#1E293B] shadow-geom-soft rounded-2xl px-8 py-6 max-w-lg">
            <img src="/Logo-2.png" alt="PathSarthi Logo" className="w-16 h-auto mb-3 object-contain" />
            <h2 className="text-3xl md:text-4xl font-outfit font-extrabold text-geom-foreground mb-2 tracking-tight">Jan Sampark Abhiyan</h2>
            <p className="text-sm font-medium text-slate-500 uppercase tracking-widest border-b-2 border-dashed border-slate-200 pb-3 mb-2">Connect • Grow • Impact</p>
            <p className="text-base text-slate-600 font-medium">Join the movement with a contribution starting from: <span className="font-outfit font-bold text-[#8B5CF6] text-xl">₹5</span></p>
          </div>
        </div>
      )}

      <div className={`w-full relative transition-all duration-500 bg-white shadow-geom px-6 pb-8 pt-8 md:px-10 md:pb-10 mx-auto border-2 border-[#1E293B] rounded-2xl flex flex-col z-20 ${step === 'done' ? 'max-w-3xl' : 'max-w-xl'}`}>

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
                  <div className="flex flex-col gap-1 w-full">
                    <label className="text-xs font-outfit font-bold text-slate-500 uppercase tracking-wide px-1">Mobile Number*</label>
                    <input name="phone" value={form.phone} onChange={handleChange} required placeholder="Phone Number*" type="tel" maxLength="10" className="w-full px-4 py-3 geom-input" />
                  </div>
                  <div className="flex flex-col gap-1 w-full min-w-0 overflow-hidden">
                    <label className="text-xs font-outfit font-bold text-slate-500 uppercase tracking-wide px-1">Date of Birth*</label>
                    <input name="dob" value={form.dob} onChange={handleChange} required type="date" className="w-full px-4 py-3 geom-input h-[50px] min-w-0" />
                  </div>
                </div>

                <div className="flex flex-col gap-1 w-full">
                  <label className="text-xs font-outfit font-bold text-slate-500 uppercase tracking-wide px-1">Gender*</label>
                  <select name="gender" value={form.gender} onChange={handleChange} required className="w-full px-4 py-3 geom-input h-[50px]">
                    <option value="">Select Gender*</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Location Details Group */}
              <div className="space-y-4 pt-4 border-t-2 border-dashed border-slate-200">
                <label className="text-sm font-outfit font-bold text-geom-foreground uppercase tracking-wide block mb-1">Location Details</label>
                <div className="flex flex-col gap-1 w-full">
                  <input name="pincode" value={form.pincode} onChange={handleChange} required placeholder="Pincode*" maxLength="6" className="w-full px-4 py-3 geom-input" />
                </div>
                
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
                    <label className="text-xs font-outfit font-bold text-slate-500 uppercase tracking-wide px-1">District/City*</label>
                    {cities.length > 0 ? (
                      <select 
                        name="city" 
                        value={form.city} 
                        onChange={handleChange} 
                        required 
                        className="w-full px-4 py-3 geom-input h-[50px]"
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
                        className="w-full px-4 py-3 geom-input h-[50px]" 
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Reference Group */}
              <div className="space-y-4 pt-4 border-t-2 border-dashed border-slate-200">
                <label className="text-sm font-outfit font-bold text-geom-foreground uppercase tracking-wide block mb-1">Reference</label>
                <input name="reference" value={form.reference} onChange={handleChange} placeholder="Referred By (Optional)" type="text" className="w-full px-4 py-3 geom-input" />
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
                I agree to the Terms & Conditions of PathSarthi Trust's Jan Sampark program.
              </label>
            </div>

            <button type="submit" className="w-full candy-btn candy-btn-primary py-4 text-xl flex items-center justify-center gap-2" disabled={loading}>
              {loading ? (
                <>
                  <div className="w-5 h-5 border-[3px] border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </>
              ) : 'Proceed to Payment'}
            </button>
          </form>
        )}

        {step === 'payment' && (
          <div className="flex flex-col items-center gap-6 font-jakarta">
            <div className="text-center text-2xl font-outfit font-extrabold text-[#1E293B]">Complete Payment to Finalize</div>
            
            <div className="w-full sticker-card p-6 space-y-4">
              <div className="flex justify-between border-b-2 border-dashed border-slate-200 pb-3 text-base text-[#1E293B]">
                <span className="font-semibold text-slate-500 uppercase tracking-wide">Applicant</span>
                <span className="font-bold">{form.fullName}</span>
              </div>
              <div className="flex justify-between border-b-2 border-dashed border-slate-200 pb-3 text-base text-[#1E293B]">
                <span className="font-semibold text-slate-500 uppercase tracking-wide">Mobile Number</span>
                <span className="font-bold">{form.phone}</span>
              </div>
              <div className="flex justify-between border-b-2 border-dashed border-slate-200 pb-3 text-base text-[#1E293B]">
                <span className="font-semibold text-slate-500 uppercase tracking-wide">Location</span>
                <span className="font-bold">{form.city}, {form.state}</span>
              </div>
              <div className="pt-2 border-t-2 border-dashed border-slate-200 mt-2">
                <span className="font-outfit uppercase tracking-wide font-bold text-[#1E293B] block mb-3">Select Contribution Amount</span>
                <div className="grid grid-cols-4 sm:grid-cols-4 gap-2 mb-4">
                  {predefinedAmounts.map(amt => (
                    <button
                      key={amt}
                      onClick={() => setDonationAmount(amt)}
                      className={`py-2 px-1 rounded-xl border-2 font-bold transition-all text-sm ${donationAmount === amt ? 'bg-[#8B5CF6] text-white border-[#1E293B] shadow-geom' : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-[#8B5CF6]'}`}
                    >
                      ₹{amt}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-500">Other: ₹</span>
                  <input
                    type="number"
                    min="1"
                    value={donationAmount}
                    onChange={(e) => setDonationAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    className="flex-1 px-4 py-2 geom-input h-[45px] text-lg font-bold border-2 border-[#1E293B] focus:border-[#8B5CF6]"
                    placeholder="Custom amount"
                  />
                </div>
              </div>
            </div>

            <button 
              className="w-full candy-btn candy-btn-primary py-4 text-xl flex items-center justify-center gap-2" 
              disabled={loading || !donationAmount || donationAmount < 1} 
              onClick={handlePayWithRazorpay}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-[3px] border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </>
              ) : `Pay ₹${donationAmount || 0} & Complete`}
            </button>
          </div>
        )}

        {step === 'done' && (
          <div className="flex flex-col gap-6 py-6 items-center justify-center text-center animate-in fade-in duration-500 font-jakarta">
            <div className="w-24 h-24 bg-[#34D399] rounded-full flex items-center justify-center mb-2 shadow-geom border-4 border-[#1E293B]">
              <Check className="w-12 h-12 text-[#1E293B]" strokeWidth={4} />
            </div>
            <h3 className="text-4xl font-outfit font-extrabold text-[#1E293B] tracking-tight">Registration Successful!</h3>
            <p className="text-lg text-slate-600 font-medium">Thank you for joining the Jan Sampark Abhiyan.</p>
            
            <div className="sticker-card w-full p-6 text-base flex flex-col gap-3 mt-4 text-left">
              <div className="flex justify-between items-start gap-4 border-b-2 border-dashed border-slate-200 pb-2">
                <span className="font-semibold text-slate-500 uppercase tracking-wide shrink-0">Name:</span>
                <span className="font-bold text-[#1E293B] text-right break-words">{form.fullName}</span>
              </div>
              <div className="flex justify-between items-start gap-4 border-b-2 border-dashed border-slate-200 pb-2">
                <span className="font-semibold text-slate-500 uppercase tracking-wide shrink-0">Phone:</span>
                <span className="font-bold text-[#1E293B] text-right break-words">{form.phone}</span>
              </div>
              <div className="flex justify-between items-start gap-4">
                <span className="font-semibold text-slate-500 uppercase tracking-wide shrink-0 pt-1">Payment ID:</span>
                <span className="font-mono text-xs font-bold bg-[#F1F5F9] border-2 border-slate-300 rounded-md px-2 py-1 text-[#8B5CF6] select-all text-right break-all max-w-[200px]">{paymentId}</span>
              </div>
            </div>

            <button
              onClick={() => window.location.href = '/'}
              className="mt-6 w-full candy-btn candy-btn-secondary py-4 text-lg"
            >
              Return Home
            </button>
          </div>
        )}
      </div>

      {/* Community Redirect Button */}
      {step !== 'done' && (
        <div className="mt-8 text-center animate-in slide-in-from-bottom-4 duration-500 z-20 font-jakarta">
          <p className="text-slate-600 mb-3 font-semibold text-base">Already connected or want to see who joined?</p>
          <a href="/jan-sampark-network" className="inline-flex items-center gap-2 candy-btn candy-btn-secondary py-3 px-8 text-lg bg-white border-2 border-[#1E293B]">
            <Users size={22} className="text-[#8B5CF6]" strokeWidth={3} /> <span className="font-outfit font-bold tracking-wide">View Our Community</span>
          </a>
        </div>
      )}
    </div>
  );
};

export default JanSampark;
