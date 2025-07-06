import React, { useState, useEffect } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../config/firebase";

const CertificateGenerator = () => {
  const [name, setName] = useState("");
  const [type, setType] = useState("Appreciation");
  const [field, setField] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [appreciationDate, setAppreciationDate] = useState("");
  const [html2canvas, setHtml2canvas] = useState(null);

  // Lazy load html2canvas only on client side
  useEffect(() => {
    if (typeof window !== "undefined") {
      import("html2canvas").then((module) => {
        setHtml2canvas(() => module.default);
      });
    }
  }, []);

  const waitForImagesToLoad = (element) => {
    if (typeof window === "undefined") return Promise.resolve();
    
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

    if (type === "Internship") {
      if (!field.trim() || !startDate || !endDate) {
        alert("Please fill all internship details");
        return;
      }
    }

    if (!html2canvas || typeof window === "undefined") {
      alert("Please wait for the page to load completely");
      return;
    }

    const cert = document.getElementById("cert-template");
    if (!cert) {
      alert("Certificate template not found");
      return;
    }

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
    link.download = `${name}_${type.toLowerCase()}_certificate.png`;
    link.click();

    // Save data to Firebase
    try {
      const certificateData = {
        name,
        type,
        dateIssued: type === "Appreciation" ? appreciationDate : new Date().toISOString().split("T")[0],
        verified: true,
        createdAt: serverTimestamp(),
      };

      if (type === "Internship") {
        certificateData.field = field;
        certificateData.startDate = startDate;
        certificateData.endDate = endDate;
      }

      await addDoc(collection(db, "certificates"), certificateData);
      console.log("Certificate saved to Firebase");
    } catch (error) {
      console.error("Error saving to Firebase:", error);
    }
  };

  const getBackgroundImage = () => {
    return type === "Appreciation" ? "/certs/appreciation.jpg" : "/certs/internship.jpg";
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Certificate Generator</h1>
      
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Certificate Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="Appreciation">Appreciation Certificate</option>
              <option value="Internship">Internship Certificate</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              placeholder="Enter full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>
        {type === "Appreciation" && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <input
              type="date"
              value={appreciationDate}
              onChange={e => setAppreciationDate(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        )}

        {type === "Internship" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Internship Field
              </label>
              <input
                type="text"
                placeholder="e.g., Web Development, Marketing"
                value={field}
                onChange={(e) => setField(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
        )}

        <button 
          onClick={generateImage} 
          disabled={!html2canvas}
          className={`w-full md:w-auto px-6 py-3 rounded-md font-medium transition-colors ${
            html2canvas 
              ? "bg-green-600 text-white hover:bg-green-700" 
              : "bg-gray-400 text-gray-200 cursor-not-allowed"
          }`}
        >
          {html2canvas ? `Generate ${type} Certificate` : "Loading..."}
        </button>
      </div>

      {/* Hidden Certificate Template */}
      <div
        id="cert-template"
        style={{
          width: "1086px",
          height: "1536px",
          backgroundImage: `url('${getBackgroundImage()}')`,
          backgroundSize: "cover",
          position: "relative",
          fontFamily: "'Playfair Display', Georgia, serif",
        }}
      >
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
        {type === "Appreciation" && appreciationDate && (
          <div
            style={{
              position: "absolute",
              bottom: "145px",
              left: "50%",
              transform: "translateX(-50%)",
              fontSize: "20px",
              fontWeight: 600,
              fontFamily: "'Playfair Display', serif",
              color: "#000000",
            }}
          >
            {`DATE : ${appreciationDate.split('-').reverse().join('-')}`}
          </div>
        )}
        
        {type === "Internship" && (
          <>
            {/* Start Date */}
            <div
              style={{
                position: "absolute",
                top: "899px",
                left: "391px",
                fontSize: "22px",
                fontWeight: 600,
                fontFamily: "'Public Sans', sans-serif",
                color: "#232323",
                textShadow: "0 1px 2px rgba(0,0,0,0.08)",
              }}
            >
              {startDate}
            </div>

            {/* End Date */}
            <div
              style={{
                position: "absolute",
                top: "899px",
                left: "547px",
                fontSize: "22px",
                fontWeight: 600,
                fontFamily: "'Public Sans', sans-serif",
                color: "#232323",
                textShadow: "0 1px 2px rgba(0,0,0,0.08)",
              }}
            >
              {endDate}
            </div>

            {/* Field */}
            <div
              style={{
                position: "absolute",
                top: "969px",
                left: "715px",
                maxWidth: "500px",
                textAlign: "center",
                fontSize: "25px",
                fontWeight: 600,
                fontFamily: "'Public Sans', sans-serif",
                color: "#232323",
                textShadow: "0 1px 2px rgba(0,0,0,0.08)",
              }}
            >
              {field}
            </div>
          </>
        )}
        
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
};

export default CertificateGenerator;