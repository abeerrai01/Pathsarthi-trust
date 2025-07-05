import { useState } from "react";
import { db } from "../../config/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import QRCode from "qrcode";

export default function CertificateGenerator() {
  const [name, setName] = useState("");
  const [type, setType] = useState("Appreciation");
  const [dateIssued, setDateIssued] = useState("");

  const generate = async () => {
    if (!name || (type === "Internship" && !dateIssued)) {
      alert("Please fill all fields");
      return;
    }

    const certId = `${name.replace(/\s+/g, "_")}_${Date.now()}`;
    const verificationLink = `https://pathsarthi.in/verify/${certId}`;
    const qrCodeUrl = await QRCode.toDataURL(verificationLink);
    document.getElementById("qr-image").src = qrCodeUrl;

    const template = document.getElementById("cert-template");

    // Wait for background image to load before html2canvas
    const bgImage = new window.Image();
    bgImage.src = "/certs/appreciation.jpg";
    bgImage.onload = () => {
      html2canvas(template).then(async (canvas) => {
        const pdf = new jsPDF("landscape", "pt", [canvas.width, canvas.height]);
        const imgData = canvas.toDataURL("image/png");
        pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
        pdf.save(`${name}_${type}_certificate.pdf`);

        await addDoc(collection(db, "certificates"), {
          name,
          type,
          dateIssued: type === "Internship" ? dateIssued : new Date().toISOString().slice(0, 10),
          verified: true,
          id: certId,
          timestamp: serverTimestamp()
        });

        alert("✅ Certificate Generated & Stored!");
      });
    };
    bgImage.onerror = () => {
      console.error("❌ Background image failed to load.");
      alert("Background image failed to load. Please check the file path.");
    };
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-3">Generate PathSarthi Certificate</h2>
      <input className="mb-2 border p-2" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full Name" />
      <select className="mb-2 border p-2" value={type} onChange={(e) => setType(e.target.value)}>
        <option value="Appreciation">Appreciation</option>
        <option value="Internship">Internship</option>
      </select>
      {type === "Internship" && (
        <input className="mb-2 border p-2" value={dateIssued} onChange={(e) => setDateIssued(e.target.value)} placeholder="Date (YYYY-MM-DD)" />
      )}
      <button onClick={generate} className="bg-green-600 text-white px-4 py-2 rounded">Generate</button>

      {/* Hidden Certificate for Rendering */}
      <div
        id="cert-template"
        style={{
          display: "none",
          width: "1086px",
          height: "768px",
          backgroundImage: `url('/certs/appreciation.jpg')`,
          backgroundSize: "cover",
          position: "relative",
          fontFamily: "Georgia, serif",
        }}
      >
        {/* 🎯 The NAME appears right under "presented to:" */}
        <div
          style={{
            position: "absolute",
            top: "375px", // 👌 Adjusted for visual perfection
            left: "0",
            width: "100%",
            textAlign: "center",
            fontSize: "34px",
            fontWeight: "bold",
            color: "#000000",
            letterSpacing: "1px",
          }}
        >
          {name}
        </div>

        {/* 📌 QR Code near signature (bottom right corner) */}
        <img
          id="qr-image"
          style={{
            position: "absolute",
            bottom: "40px",
            right: "60px",
            width: "95px",
          }}
          alt="QR Code"
        />
      </div>
    </div>
  );
} 