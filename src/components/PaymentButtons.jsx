import React from "react";

export default function PaymentButtons({ amount = 200, name = 'Anonymous', onRazorpay, onShowQR }) {
  const upiID = "8958421200@okbizaxis";
  const upiLink = `upi://pay?pa=${upiID}&pn=Pathsarthi%20Trust&am=${amount}&cu=INR&tn=Support%20Pathsarthi`;

  const handleGooglePay = () => {
    window.location.href = upiLink;
  };

  const handleRazorpay = () => {
    if (onRazorpay) return onRazorpay();
    // fallback
    alert('Razorpay payment not implemented.');
  };

  const handleQRCode = () => {
    if (onShowQR) return onShowQR();
    // fallback
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