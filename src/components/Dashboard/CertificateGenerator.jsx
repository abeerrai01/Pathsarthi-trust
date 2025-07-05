import React, { useState } from "react";
import html2canvas from "html2canvas";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../config/firebase";

const CertificateGenerator = () => {
  const [name, setName] = useState("");

  const waitForImagesToLoad = (element) => {
    const images = element.querySelectorAll("img");
    const promises = Array.from(images).map((img) => {
      if (img.complete) return Promise.resolve();
      return new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = resolve;
      });
    });
    return Promise.all(promises);
  };

  const generateImage = async () => {
    if (!name.trim()) {
      alert("Please enter a name");
      return;
    }

    const cert = document.getElementById("cert-template");

    // Wait for all images (QR code) to load
    await waitForImagesToLoad(cert);

    const canvas = await html2canvas(cert, {
      useCORS: true,
      scale: 2,
    });

    const imgData = canvas.toDataURL("image/png");

    // Download PNG
    const link = document.createElement("a");
    link.href = imgData;
    link.download = `${name}_certificate.png`;
    link.click();

    // Save data to Firebase
    try {
      await addDoc(collection(db, "certificates"), {
        name,
        type: "Appreciation",
        dateIssued: new Date().toISOString().split("T")[0],
        verified: true,
        createdAt: serverTimestamp(),
      });
      console.log("Certificate saved to Firebase");
    } catch (error) {
      console.error("Error saving to Firebase:", error);
    }
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
          fontFamily: "'Playfair Display', Georgia, serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "700px",
            left: "0",
            width: "100%",
            textAlign: "center",
            fontSize: "30px",
            fontFamily: "'Playfair Display', Georgia, serif",
            fontWeight: 600,
            color: "#6b4f2a",
            letterSpacing: "0.5px",
            textTransform: "capitalize",
          }}
        >
          {name}
        </div>
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