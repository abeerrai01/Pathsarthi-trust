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
      key: "rzp_live_lrTbKMU5YpM6UD",
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
    <div className="flex gap-3 flex-wrap mt-4">
      {/* 🟢 Google Pay Button */}
      <button onClick={handleGooglePay} className="px-5 py-2 rounded bg-green-600 hover:bg-green-700 text-white font-semibold shadow">
        Pay with Google Pay
      </button>
      {/* 🟠 Razorpay Button */}
      <button onClick={handleRazorpay} className="px-5 py-2 rounded bg-orange-500 hover:bg-orange-600 text-white font-semibold shadow">
        Pay with Razorpay
      </button>
      {/* 🔵 QR Code Button */}
      <button onClick={handleQRCode} className="px-5 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow">
        Scan QR Code
      </button>
    </div>
  );
} 