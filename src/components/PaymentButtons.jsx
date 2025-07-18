import React from "react";

export default function PaymentButtons({ amount = 200 }) {
  const upiID = "8958421200@okbizaxis";
  const upiLink = `upi://pay?pa=${upiID}&pn=Pathsarthi%20Trust&am=${amount}&cu=INR&tn=Support%20Pathsarthi`;

  const handleGooglePay = () => {
    window.location.href = upiLink;
  };

  const handleRazorpay = () => {
    // Replace with your Razorpay handler
    console.log("Redirecting to Razorpay...");
  };

  const handleQRCode = () => {
    // Navigate to QR code page OR open modal with QR
    window.open("/donate/qr", "_blank");
  };

  return (
    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "20px" }}>
      {/* 🟢 Google Pay Button */}
      <button onClick={handleGooglePay} style={{ padding: "10px 20px", background: "#0f9d58", color: "#fff", border: "none", borderRadius: "5px" }}>
        Pay with Google Pay
      </button>

      {/* 🟠 Razorpay Button */}
      <button onClick={handleRazorpay} style={{ padding: "10px 20px", background: "#f37254", color: "#fff", border: "none", borderRadius: "5px" }}>
        Pay with Razorpay
      </button>

      {/* 🔵 QR Code Button */}
      <button onClick={handleQRCode} style={{ padding: "10px 20px", background: "#4285f4", color: "#fff", border: "none", borderRadius: "5px" }}>
        Scan QR Code
      </button>
    </div>
  );
} 