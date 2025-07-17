import React, { useState, useRef } from 'react';
import { auth, db } from '../config/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import RazorpayButton from './RazorpayButton';

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
};

const MembershipForm = () => {
  const [form, setForm] = useState(initialForm);
  const [step, setStep] = useState('form'); // form | otp | payment | done
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [toast, setToast] = useState(null);
  const [paymentId, setPaymentId] = useState('');
  const recaptchaRef = useRef(null);

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

  // Send OTP
  const handleSendOtp = async e => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
          callback: () => {},
        });
      }
      const appVerifier = window.recaptchaVerifier;
      const phoneWithCode = '+91' + form.phone;
      const result = await signInWithPhoneNumber(auth, phoneWithCode, appVerifier);
      setConfirmationResult(result);
      setStep('otp');
      showToast('OTP sent to your phone.');
    } catch (err) {
      showToast('Failed to send OTP: ' + err.message, 'error');
    }
    setLoading(false);
  };

  // Verify OTP
  const handleVerifyOtp = async e => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      showToast('Enter the 6-digit OTP.', 'error');
      return;
    }
    setLoading(true);
    try {
      await confirmationResult.confirm(otp);
      setStep('payment');
      showToast('✅ OTP verified! Proceed to payment.','success');
    } catch (err) {
      showToast('Invalid OTP. Please try again.', 'error');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fffaf8] py-8 px-2">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-8 mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 text-[#ff7300]">Become a Pathsarthi Member</h2>
        {toast && (
          <div className={`mb-4 px-4 py-2 rounded text-center text-white ${toast.type === 'error' ? 'bg-red-500' : toast.type === 'success' ? 'bg-green-600' : 'bg-indigo-500'}`}>{toast.msg}</div>
        )}
        {step === 'form' && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div className="flex gap-2">
              <input name="firstName" value={form.firstName} onChange={handleChange} required placeholder="First Name*" className="input input-bordered flex-1 px-4 py-2 rounded border border-gray-300 focus:border-orange-400" />
              <input name="middleName" value={form.middleName} onChange={handleChange} placeholder="Middle Name" className="input input-bordered flex-1 px-4 py-2 rounded border border-gray-300 focus:border-orange-400" />
              <input name="lastName" value={form.lastName} onChange={handleChange} required placeholder="Last Name*" className="input input-bordered flex-1 px-4 py-2 rounded border border-gray-300 focus:border-orange-400" />
            </div>
            <div className="flex gap-2">
              <input name="age" value={form.age} onChange={handleChange} required placeholder="Age*" type="number" min="1" className="input input-bordered flex-1 px-4 py-2 rounded border border-gray-300 focus:border-orange-400" />
              <select name="gender" value={form.gender} onChange={handleChange} required className="input input-bordered flex-1 px-4 py-2 rounded border border-gray-300 focus:border-orange-400">
                <option value="">Gender*</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="flex gap-2">
              <input name="city" value={form.city} onChange={handleChange} required placeholder="City*" className="input input-bordered flex-1 px-4 py-2 rounded border border-gray-300 focus:border-orange-400" />
              <input name="state" value={form.state} onChange={handleChange} required placeholder="State*" className="input input-bordered flex-1 px-4 py-2 rounded border border-gray-300 focus:border-orange-400" />
            </div>
            <input name="email" value={form.email} onChange={handleChange} required placeholder="Email ID*" type="email" className="input input-bordered w-full px-4 py-2 rounded border border-gray-300 focus:border-orange-400" />
            <input name="phone" value={form.phone} onChange={handleChange} required placeholder="Phone Number*" type="tel" className="input input-bordered w-full px-4 py-2 rounded border border-gray-300 focus:border-orange-400" />
            <input name="aadhaar" value={form.aadhaar} onChange={handleChange} required placeholder="Aadhaar Card Number*" className="input input-bordered w-full px-4 py-2 rounded border border-gray-300 focus:border-orange-400" />
            <div id="recaptcha-container" ref={recaptchaRef} />
            <button type="submit" className="w-full bg-[#ff7300] text-white font-semibold py-2 rounded-lg hover:bg-orange-600 transition" disabled={loading}>{loading ? 'Sending OTP...' : 'Send OTP'}</button>
          </form>
        )}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="text-center text-lg mb-2">Enter the OTP sent to <span className="font-bold">+91-{form.phone}</span></div>
            <input value={otp} onChange={e => setOtp(e.target.value)} maxLength={6} minLength={6} required placeholder="Enter OTP" className="input input-bordered w-full px-4 py-2 rounded border border-gray-300 focus:border-orange-400 text-center tracking-widest text-xl" />
            <button type="submit" className="w-full bg-[#ff7300] text-white font-semibold py-2 rounded-lg hover:bg-orange-600 transition" disabled={loading}>{loading ? 'Verifying...' : 'Verify OTP'}</button>
          </form>
        )}
        {step === 'payment' && (
          <div className="flex flex-col items-center gap-6">
            <div className="text-center text-lg font-semibold text-green-700">OTP Verified! Please pay the membership fee to complete your application.</div>
            <RazorpayButton
              amount={1}
              name={form.firstName + ' ' + form.lastName}
              onSuccess={async (payerName, paymentId) => {
                setPaymentId(paymentId);
                showToast('✅ Payment Successful!');
                setStep('done');
                setLoading(true);
                try {
                  await addDoc(collection(db, 'memberships'), {
                    ...form,
                    paymentId,
                    timestamp: serverTimestamp(),
                  });
                } catch (err) {
                  showToast('Failed to save membership: ' + err.message, 'error');
                }
                setLoading(false);
              }}
            />
          </div>
        )}
        {step === 'done' && (
          <div className="flex flex-col items-center gap-6">
            <div className="text-2xl text-green-700 font-bold text-center">✅ Payment Successful!</div>
            <div className="text-center text-lg">Thank you for becoming a Pathsarthi Member.<br />Your Payment ID: <span className="font-mono text-blue-700">{paymentId}</span></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MembershipForm; 