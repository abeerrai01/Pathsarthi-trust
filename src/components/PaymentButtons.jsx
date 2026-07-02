import React, { useEffect } from "react";
import { db } from "../config/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function PaymentButtons({ amount = 200, name = 'Anonymous', onSuccess, onShowQR }) {
  const upiID = "8958421200@okbizaxis";
  const upiLink = `upi://pay?pa=${upiID}&pn=Pathsarthi%20Trust&am=${amount}&cu=INR&tn=Support%20Pathsarthi`;

  useEffect(() => {
    if (!window.Razorpay) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const handleGooglePay = () => {
    // Try to open UPI link in a new tab (works on mobile, some desktop browsers)
    window.open(upiLink, '_blank');
  };

  const handleRazorpay = async () => {
    if (!window.Razorpay) {
      alert("Razorpay SDK failed to load. Please try again later.");
      return;
    }
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_live_lrTbKMU5YpM6UD",
      amount: amount * 100,
      currency: "INR",
      name: "Path Sarthi Trust",
      description: "Donation or Sponsorship",
      image: "https://www.pathsarthi.in/logo.png",
      handler: async function (response) {
        await addDoc(collection(db, "donations"), {
          name,
          amount,
          paymentId: response.razorpay_payment_id,
          timestamp: serverTimestamp(),
        });
        if (onSuccess) onSuccess(name);
      },
      prefill: {
        name,
        email: "",
        contact: "",
      },
      theme: {
        color: "#0E8A16",
      },
    };
    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const handleQRCode = () => {
    if (onShowQR) return onShowQR();
    alert('QR code payment not implemented.');
  };

  return (
    <div className="flex flex-col gap-4 mt-4 w-full">
      <div className="bg-green-50 border-2 border-green-600 rounded-xl p-6 shadow-sm relative">
        <div className="absolute -top-3 left-4 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1 shadow-sm">
          <span>⭐</span> Recommended
        </div>
        
        <h3 className="text-xl font-bold text-green-900 mb-4 font-outfit mt-2">🔒 Pay Securely (Instant Verification)</h3>
        
        <ul className="space-y-2 mb-6 text-green-800 font-jakarta font-medium text-sm">
          <li className="flex items-center gap-2"><span>✔</span> Instant Confirmation</li>
          <li className="flex items-center gap-2"><span>✔</span> Auto Verification</li>
          <li className="flex items-center gap-2"><span>✔</span> No Screenshot Required</li>
        </ul>

        <button 
          onClick={handleRazorpay} 
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-lg text-lg transition-colors flex items-center justify-center gap-2 shadow-md"
        >
          Pay Securely with Razorpay
        </button>
        
        <div className="flex items-center justify-center gap-4 mt-4 text-xs font-bold text-green-700/70 uppercase tracking-wide">
          <span className="flex items-center gap-1">🔒 Secure Payments</span>
          <span className="flex items-center gap-1">⚡ Instant Verification</span>
        </div>
      </div>

      <details className="group border-2 border-slate-200 rounded-xl bg-white mt-2">
        <summary className="flex items-center justify-between p-4 font-jakarta font-semibold text-slate-600 cursor-pointer hover:bg-slate-50 transition-colors">
          Having trouble with Razorpay?
          <span className="text-sm text-slate-500 group-open:hidden underline decoration-dashed underline-offset-4">Use Manual UPI (Requires Screenshot)</span>
          <span className="text-sm text-slate-500 hidden group-open:block">Close</span>
        </summary>
        
        <div className="p-4 pt-0 border-t-2 border-slate-100 mt-2">
          <div className="bg-orange-50 border-2 border-orange-200 text-orange-800 text-xs p-3 rounded-xl font-jakarta mb-4 mt-2">
            <span className="font-bold">Notice:</span> We strongly recommend using Razorpay for instant payment verification. Manual payments require verification and may take additional time.
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button onClick={handleGooglePay} className="flex-1 px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold border-2 border-slate-300 transition-colors">
              Pay with Google Pay
            </button>
            <button onClick={handleQRCode} className="flex-1 px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold border-2 border-slate-300 transition-colors">
              Scan QR Code
            </button>
          </div>
        </div>
      </details>
    </div>
  );
} 