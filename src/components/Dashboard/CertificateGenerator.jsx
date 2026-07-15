import React, { useState, useEffect } from "react";
import { collection, addDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";
import { db } from "../../config/firebase";
import { useNavigate } from "react-router-dom";
import { uploadToCloudinary } from '../../utils/cloudinary';
import { jsPDF } from "jspdf";

const CertificateGenerator = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [type, setType] = useState("Appreciation");
  const [field, setField] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [appreciationDate, setAppreciationDate] = useState("");
  const [title, setTitle] = useState("");
  const [position, setPosition] = useState("");
  const [positionLeftOffset, setPositionLeftOffset] = useState(130);
  const [exportFormat, setExportFormat] = useState("png");
  const [html2canvas, setHtml2canvas] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const navigate = useNavigate();

  const handleNameBlur = async () => {
    if (!name || name.trim().length < 3) return;
    try {
      const cleanName = name.trim().toLowerCase();
      let foundEmail = "";

      // 1. Check memberships (fullName field)
      const memQ = query(collection(db, "memberships"));
      const memSnap = await getDocs(memQ);
      memSnap.forEach((doc) => {
        const data = doc.data();
        const fullName = (data.fullName || "").trim().toLowerCase();
        if (fullName === cleanName || fullName.includes(cleanName) || cleanName.includes(fullName)) {
          if (data.email) foundEmail = data.email;
        }
      });

      // 2. Check applications (firstName, middleName, lastName)
      if (!foundEmail) {
        const appQ = query(collection(db, "applications"));
        const appSnap = await getDocs(appQ);
        appSnap.forEach((doc) => {
          const data = doc.data();
          const fullName = `${data.firstName || ""} ${data.middleName || ""} ${data.lastName || ""}`.trim().toLowerCase();
          if (fullName === cleanName || fullName.includes(cleanName) || cleanName.includes(fullName)) {
            if (data.email) foundEmail = data.email;
          }
        });
      }

      // 3. Check internship applications (name field)
      if (!foundEmail) {
        const intQ = query(collection(db, "internship_applications"));
        const intSnap = await getDocs(intQ);
        intSnap.forEach((doc) => {
          const data = doc.data();
          const fullName = (data.name || "").trim().toLowerCase();
          if (fullName === cleanName || fullName.includes(cleanName) || cleanName.includes(fullName)) {
            if (data.email) foundEmail = data.email;
          }
        });
      }

      if (foundEmail) {
        setEmail(foundEmail);
        console.log(`[Fuzzy Lookup] Email found: ${foundEmail}`);
      }
    } catch (err) {
      console.error("Error fuzzy looking up email by name:", err);
    }
  };

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
    if (!email.trim() || !email.includes("@")) {
      alert("Please enter a valid recipient email address to send the certificate.");
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
    if (type === "Appointment") {
      if (!position.trim() || !appreciationDate) {
        alert("Please fill all appointment details");
        return;
      }
    }

    if (!html2canvas || typeof window === "undefined") {
      alert("Please wait for the page to load completely");
      return;
    }

    setIsGenerating(true);

    try {
      const cert = document.getElementById("cert-template");
      if (!cert) {
        alert("Certificate template not found");
        setIsGenerating(false);
        return;
      }

      // Wait for all images (QR code) to load
      await waitForImagesToLoad(cert);

      const canvas = await html2canvas(cert, {
        useCORS: true,
        scale: 2,
      });

      let certificateUrl = "";
      
      if (exportFormat === "pdf") {
        const pdfImgData = canvas.toDataURL("image/jpeg", 1.0);
        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "px",
          format: [1086, 1536]
        });
        pdf.addImage(pdfImgData, "JPEG", 0, 0, 1086, 1536);
        pdf.save(`${name}_${type.toLowerCase()}_certificate.pdf`);
      } else {
        const mimeType = exportFormat === "jpg" ? "image/jpeg" : "image/png";
        const fileExt = exportFormat === "jpg" ? "jpg" : "png";
        const imgData = canvas.toDataURL(mimeType, 1.0);

        const link = document.createElement("a");
        link.href = imgData;
        link.download = `${name}_${type.toLowerCase()}_certificate.${fileExt}`;
        link.click();
      }

      // Upload a PNG preview to Cloudinary for database storage
      const previewImgData = canvas.toDataURL("image/png");
      const res = await fetch(previewImgData);
      const blob = await res.blob();
      const file = new File([blob], `${name}_${type.toLowerCase()}_certificate.png`, { type: "image/png" });
      const uploadResult = await uploadToCloudinary(file);
      certificateUrl = uploadResult.imageUrl;

      // Save data to Firebase
      const certificateData = {
        name,
        email,
        type,
        dateIssued:
          type === "Appreciation"
            ? appreciationDate
            : type === "Recognition"
            ? appreciationDate
            : type === "Political"
            ? appreciationDate
            : type === "Appointment"
            ? appreciationDate
            : new Date().toISOString().split("T")[0],
        verified: true,
        certificateUrl: certificateUrl,
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
      if (type === "Appointment") {
        certificateData.position = position;
      }

      await addDoc(collection(db, "certificates"), certificateData);
      console.log("Certificate saved to Firebase");
    } catch (error) {
      console.error("Error saving to Firebase:", error);
      alert("Failed to save certificate. " + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const getBackgroundImage = () => {
    if (type === "Appreciation") return "/certs/appreciation.jpg";
    if (type === "Internship") return "/certs/internship.jpg";
    if (type === "Recognition") return "/certs/recognition.jpg";
    if (type === "Political") return "/certs/political.jpg";
    if (type === "Appointment") return "/certs/Appointment Certificate.jpg";
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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
              <option value="Appointment">Appointment Certificate</option>
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
              onBlur={handleNameBlur}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recipient Email ID
            </label>
            <input
              type="email"
              placeholder="Enter email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
        {type === "Appointment" && (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Position
              </label>
              <input
                type="text"
                placeholder="e.g., President, Secretary"
                value={position}
                onChange={e => setPosition(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Issue Date
              </label>
              <input
                type="date"
                value={appreciationDate}
                onChange={e => setAppreciationDate(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Position Left Offset (px)
              </label>
              <input
                type="number"
                value={positionLeftOffset}
                onChange={e => setPositionLeftOffset(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </>
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

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Export Format
          </label>
          <select
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="png">PNG Image</option>
            <option value="jpg">JPG Image</option>
            <option value="pdf">PDF Document</option>
          </select>
        </div>

        <button 
          onClick={generateImage} 
          disabled={!html2canvas || isGenerating}
          className={`block mx-auto px-6 py-3 rounded-md font-medium transition-colors ${
            html2canvas && !isGenerating
              ? "bg-green-600 text-white hover:bg-green-700" 
              : "bg-gray-400 text-gray-200 cursor-not-allowed"
          }`}
        >
          {isGenerating ? "Generating & Saving..." : html2canvas ? `Generate ${type} Certificate` : "Loading..."}
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
            top: type === "Political" ? "700px" : type === "Appointment" ? "690px" : "750px",
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
        {type === "Appointment" && position && (
          <div
            style={{
              position: "absolute",
              top: "891px",
              left: `${positionLeftOffset}px`,
              width: "100%",
              textAlign: "center",
              fontSize: "30px",
              fontFamily: "'Playfair Display', Georgia, serif",
              fontWeight: 500,
              color: "#6b4f2a",
              letterSpacing: "0.5px",
            }}
          >
            {position}
          </div>
        )}
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
        {type === "Appointment" && appreciationDate && (
          <div
            style={{
              position: "absolute",
              bottom: "465px",
              left: "642px",
              transform: "translateX(-50%)",
              fontSize: "26px",
              fontWeight: 600,
              fontFamily: "'Playfair Display', serif",
              color: "#000000",
            }}
          >
            {appreciationDate.split('-').reverse().join('-')}
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