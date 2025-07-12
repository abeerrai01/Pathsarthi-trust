import React from "react";
// Import db from the correct config path
import { db } from "../config/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const RazorpayButton = ({ amount, name = "Anonymous", onSuccess }) => {
  const payNow = () => {
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
    <button onClick={payNow} className="bg-green-600 text-white px-5 py-2 rounded-md">
      Pay ₹{amount}
    </button>
  );
};

export default RazorpayButton; 