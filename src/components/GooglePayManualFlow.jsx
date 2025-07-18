import React from "react";

export default function GooglePayManualFlow({ amount = 200 }) {
  const upiID = "8958421200@okbizaxis";

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(upiID);
      alert("UPI ID copied! Now open Google Pay and paste it to donate 💸");
    } catch (err) {
      alert("Failed to copy UPI ID. Please copy manually: " + upiID);
    }
  };

  return (
    <div style={{ background: "#f9f9f9", padding: "20px", borderRadius: "10px", maxWidth: "500px", margin: "auto" }}>
      <h3>Donate via Google Pay</h3>
      <p><strong>UPI ID:</strong> {upiID}</p>
      <button
        onClick={copyToClipboard}
        style={{
          background: "#0f9d58",
          color: "white",
          padding: "10px 20px",
          borderRadius: "6px",
          border: "none",
          cursor: "pointer"
        }}
      >
        Copy UPI ID & Open Google Pay
      </button>
      <p style={{ marginTop: "10px", fontSize: "14px", color: "#555" }}>
        Paste this UPI ID in Google Pay to complete your donation.<br />
        You can also scan the QR code below 👇
      </p>
      <img
        src={`https://upiqr.in/api/qr?name=Pathsarthi&vpa=${upiID}&amount=${amount}&note=Donation+to+Pathsarthi`}
        alt="Scan to Pay"
        style={{ width: "200px", marginTop: "10px", borderRadius: "10px" }}
      />
    </div>
  );
} 