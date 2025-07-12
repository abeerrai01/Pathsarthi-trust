import React, { useEffect } from "react";
// Import db from the correct config path
import { db } from "../config/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const RazorpayButton = ({ amount, name = "Anonymous", onSuccess }) => {
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
      key: "rzp_live_lrTbKMU5YpM6UD", // Updated to your live Razorpay key
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
        onSuccess(name);
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

  return (
    <button onClick={payNow} className="w-full bg-green-600 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:bg-green-700 transition-all duration-300 flex flex-col items-center">
      <span>Pay ₹{amount} by Razorpay</span>
      <span className="text-xs font-normal text-green-100 mt-1">(with *extra fees and slower)</span>
    </button>
  );
};

export default RazorpayButton; 