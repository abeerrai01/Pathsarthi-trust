import React, { useState, useEffect } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../config/firebase";
import { useNavigate } from "react-router-dom";

const CertificateGenerator = () => {
  const [name, setName] = useState("");
  const [type, setType] = useState("Appreciation");
  const [field, setField] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [appreciationDate, setAppreciationDate] = useState("");
  const [title, setTitle] = useState("");
  const [html2canvas, setHtml2canvas] = useState(null);

  const navigate = useNavigate();

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
    if (type === "Recognition") {
      if (!field.trim() || !appreciationDate) {
        alert("Please fill all recognition details");
        return;
      }
    }
    if (type === "Political") {
      if (!appreciationDate || !title.trim()) {
        alert("Please fill all political details");
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
        dateIssued:
          type === "Appreciation"
            ? appreciationDate
            : type === "Recognition"
            ? appreciationDate
            : type === "Political"
            ? appreciationDate
            : new Date().toISOString().split("T")[0],
        verified: true,
        createdAt: serverTimestamp(),
      };

      if (type === "Internship") {
        certificateData.field = field;
        certificateData.startDate = startDate;
        certificateData.endDate = endDate;
      }
      if (type === "Recognition") {
        certificateData.field = field;
      }
      if (type === "Political") {
        certificateData.title = title;
      }

      await addDoc(collection(db, "certificates"), certificateData);
      console.log("Certificate saved to Firebase");
    } catch (error) {
      console.error("Error saving to Firebase:", error);
    }
  };

  const getBackgroundImage = () => {
    if (type === "Appreciation") return "/certs/appreciation.jpg";
    if (type === "Internship") return "/certs/internship.jpg";
    if (type === "Recognition") return "/certs/recognition.jpg";
    if (type === "Political") return "/certs/political.jpg";
    return "/certs/appreciation.jpg";
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <button
        onClick={() => navigate('/admin-dashboard')}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
      >
        ← Back to Admin Dashboard
      </button>
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
              <option value="Recognition">Recognition Certificate</option>
              <option value="Political">Political Certificate</option>
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
        {type === "Recognition" && (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Field
              </label>
              <input
                type="text"
                placeholder="e.g., Social Work, Leadership"
                value={field}
                onChange={(e) => setField(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
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
          </>
        )}
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
        {type === "Political" && (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                placeholder="e.g., Chief Guest, Speaker"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
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
          </>
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
          className={`block mx-auto px-6 py-3 rounded-md font-medium transition-colors ${
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
            top: type === "Political" ? "700px" : "750px",
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
        {type === "Political" && title && (
          <div
            style={{
              position: "absolute",
              top: "760px",
              left: "0",
              width: "100%",
              textAlign: "center",
              fontSize: "32px",
              fontFamily: "'Playfair Display', Georgia, serif",
              fontWeight: 500,
              color: "#6b4f2a",
              letterSpacing: "0.5px",
            }}
          >
            {title}
          </div>
        )}
        {type === "Recognition" && field && (
          <div
            style={{
              position: "absolute",
              top: "895px",
              left: "0",
              width: "100%",
              textAlign: "center",
              fontSize: "32px",
              fontFamily: "'Playfair Display', Georgia, serif",
              fontWeight: 500,
              color: "#6b4f2a",
              letterSpacing: "0.5px",
            }}
          >
            {field}
          </div>
        )}
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
        {type === "Recognition" && appreciationDate && (
          <div
            style={{
              position: "absolute",
              bottom: "125px",
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
        {type === "Political" && appreciationDate && (
          <div
            style={{
              position: "absolute",
              bottom: "125px",
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
                top: "908px",
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
                top: "908px",
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
                top: "976px",
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