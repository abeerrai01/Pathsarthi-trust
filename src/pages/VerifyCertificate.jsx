import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import { useEffect, useState } from "react";

export default function VerifyCertificate() {
  const { id } = useParams();
  const [cert, setCert] = useState(null);

  useEffect(() => {
    const fetchCert = async () => {
      const docRef = doc(db, "certificates", id);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        setCert(snapshot.data());
      }
    };
    fetchCert();
  }, [id]);

  return (
    <div className="p-5">
      {cert ? (
        <div className="bg-white shadow p-4 rounded">
          <h1 className="text-2xl font-bold text-green-600">✅ Certificate Verified</h1>
          <p><strong>Name:</strong> {cert.name}</p>
          <p><strong>Type:</strong> {cert.type}</p>
          <p><strong>Date Issued:</strong> {cert.dateIssued}</p>
        </div>
      ) : (
        <h2 className="text-red-500">❌ Certificate Not Found</h2>
      )}
    </div>
  );
} 