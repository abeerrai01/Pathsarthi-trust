import React, { useState } from "react";
import html2canvas from "html2canvas";

export default function CertificateGenerator() {
  const [name, setName] = useState("");

  const generateImage = async () => {
    const cert = document.getElementById("cert-template");
    setTimeout(async () => {
      const canvas = await html2canvas(cert, {
        useCORS: true,
        scale: 2,
      });
      const imgData = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = imgData;
      link.download = `${name}_certificate.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }, 300);
  };

  return (
    <div className="p-4">
      <input
        type="text"
        placeholder="Enter Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border p-2"
      />
      <button onClick={generateImage} className="bg-green-600 text-white px-4 py-2 rounded ml-2">
        Download Certificate as PNG
      </button>
      {/* Hidden Certificate Template */}
      <div
        id="cert-template"
        style={{
          width: "1086px",
          height: "1536px",
          backgroundImage: `url('/certs/appreciation.jpg')`,
          backgroundSize: "cover",
          position: "relative",
          fontFamily: "Georgia, serif",
        }}
      >
        {/* Name Placement */}
        <div
          style={{
            position: "absolute",
            top: "750px",
            left: "0",
            width: "100%",
            textAlign: "center",
            fontSize: "50px",
            fontFamily: "'Playfair Display', Georgia, serif",
            fontWeight: 600,
            color: "#6b4f2a",
            letterSpacing: "0.5px",
            textTransform: "capitalize",
          }}
        >
          {name}
        </div>
        {/* QR Code near Chairman signature */}
        <img
          src={`https://api.qrserver.com/v1/create-qr-code/?data=https://pathsarthi.in/verify/${encodeURIComponent(name)}&size=120x120`}
          alt="QR Code"
          style={{
            position: "absolute",
            bottom: "65px",
            right: "75px",
            width: "100px",
            height: "100px",
          }}
        />
      </div>
    </div>
  );
} 