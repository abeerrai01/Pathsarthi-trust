import React, { useState, useRef } from 'react';
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
    <div className="min-h-screen flex items-center justify-center bg-[#fffaf8] py-8 px-2">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-8 mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 text-[#ff7300]">Become a Pathsarthi Member</h2>
        {toast && (
          <div className={`mb-4 px-4 py-2 rounded text-center text-white ${toast.type === 'error' ? 'bg-red-500' : toast.type === 'success' ? 'bg-green-600' : 'bg-indigo-500'}`}>{toast.msg}</div>
        )}
        {step === 'form' && (
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="flex flex-col md:flex-row gap-2">
              <input name="firstName" value={form.firstName} onChange={handleChange} required placeholder="First Name*" className="input input-bordered w-full px-4 py-2 rounded border border-gray-300 focus:border-orange-400" />
              <input name="middleName" value={form.middleName} onChange={handleChange} placeholder="Middle Name" className="input input-bordered w-full px-4 py-2 rounded border border-gray-300 focus:border-orange-400" />
              <input name="lastName" value={form.lastName} onChange={handleChange} required placeholder="Last Name*" className="input input-bordered w-full px-4 py-2 rounded border border-gray-300 focus:border-orange-400" />
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

            {/* Profile Photo Upload Field */}
            <div className="flex flex-col gap-1.5">
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

            <button type="submit" className="w-full bg-[#ff7300] text-white font-semibold py-2 rounded-lg hover:bg-orange-600 transition disabled:opacity-50" disabled={loading}>
              {loading ? (photoFile ? 'Uploading photo...' : 'Processing...') : 'Proceed to Payment'}
            </button>
          </form>
        )}
        {step === 'payment' && (
          <div className="flex flex-col items-center gap-6">
            <div className="text-center text-lg font-semibold text-green-700">Please pay the membership fee to complete your application.</div>
            {/* Optionally, add GooglePayManualFlow or payment instructions here */}
            <p className="text-center text-sm text-gray-700">
              Payment Instructions:
              <br />
              - You can pay via Google Pay or UPI.
              <br />
              - For Google Pay, scan the QR code or enter the UPI ID.
              <br />
              - For UPI, you can use any UPI app (like BHIM, PhonePe, Google Pay, etc.) and enter the UPI ID: <span className="font-mono text-blue-700">your_upi_id@bank</span>
              <br />
              - The amount to pay is ₹500.
              <br />
              - Please ensure you enter the correct UPI ID and amount.
              <br />
              - Once payment is successful, please click the "Complete Payment" button below.
            </p>
            <button className="w-full bg-[#ff7300] text-white font-semibold py-2 rounded-lg hover:bg-orange-600 transition disabled:opacity-50" disabled={loading} onClick={async () => {
              setLoading(true);
              try {
                const generatedId = 'MEMB-' + Math.floor(Math.random() * 1000000);
                await addDoc(collection(db, "memberships"), {
                  ...form,
                  paymentId: generatedId,
                  createdAt: new Date(),
                  status: 'pending'
                });
                setPaymentId(generatedId);
                setStep('done');
              } catch (error) {
                console.error(error);
                showToast('Failed to process. Please try again.', 'error');
              } finally {
                setLoading(false);
              }
            }}>{loading ? 'Reconciling...' : 'Complete Payment'}</button>
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