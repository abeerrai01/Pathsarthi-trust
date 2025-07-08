import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../config/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

const VerifyCertificate = () => {
  const { name } = useParams();
  const decodedName = decodeURIComponent(name);
  const [certificates, setCertificates] = useState([]);

  useEffect(() => {
    const fetchCertificates = async () => {
      const certRef = collection(db, "certificates");
      const q = query(certRef, where("name", "==", decodedName));
      const querySnapshot = await getDocs(q);

      const certs = [];
      querySnapshot.forEach((doc) => {
        certs.push({ id: doc.id, ...doc.data() });
      });

      setCertificates(certs);
    };

    fetchCertificates();
  }, [decodedName]);

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <h2 className="text-3xl font-bold mb-4">✅ Verified Certificates</h2>
      <p className="mb-4 text-gray-700">Showing all certificates for: <strong>{decodedName}</strong></p>

      {certificates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certificates.map((cert) => (
            <div key={cert.id} className="bg-white p-4 rounded shadow">
              {cert.imageUrl && <img src={cert.imageUrl} alt="Certificate" className="w-full mb-2" />}
              <p><strong>Type:</strong> {cert.type}</p>
              <p><strong>Date Issued:</strong> {cert.dateIssued}</p>
              <p><strong>Verified:</strong> ✅</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-red-500 mt-4">No certificates found for "{decodedName}"</p>
      )}
    </div>
  );
};

export default VerifyCertificate; 