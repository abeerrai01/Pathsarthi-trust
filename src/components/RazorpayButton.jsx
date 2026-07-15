import React, { useEffect } from "react";
// Import db from the correct config path
import { db } from "../config/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const RazorpayButton = ({ amount, name = "Anonymous", email = "", onSuccess }) => {
  useEffect(() => {
    if (!window.Razorpay) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const payNow = () => {
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
          email,
          amount,
          paymentId: response.razorpay_payment_id,
          timestamp: serverTimestamp(),
        });
        onSuccess(name);
      },
      prefill: {
        name,
        email,
        contact: "",
      },
      theme: {
        color: "#0E8A16",
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  return (
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
          onClick={payNow} 
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-lg text-lg transition-colors flex items-center justify-center gap-2 shadow-md"
        >
          Pay ₹{amount} Securely
        </button>
        
        <div className="flex items-center justify-center gap-4 mt-4 text-xs font-bold text-green-700/70 uppercase tracking-wide">
          <span className="flex items-center gap-1">Secure Payments</span>
          <span className="flex items-center gap-1">Instant Verification</span>
        </div>
      </div>
    </div>
  );
};

export default RazorpayButton; 