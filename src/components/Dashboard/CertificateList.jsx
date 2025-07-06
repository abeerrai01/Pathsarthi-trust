import React, { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../../config/firebase";

const CertificateList = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCertificates = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, "certificates"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        const certs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCertificates(certs);
      } catch (err) {
        console.error("Error fetching certificates:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCertificates();
  }, []);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">All Generated Certificates</h1>
      {loading ? (
        <div className="text-center text-gray-500">Loading certificates...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border rounded-lg bg-white shadow">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 border-b">Name</th>
                <th className="py-2 px-4 border-b">Type</th>
                <th className="py-2 px-4 border-b">Date(s)</th>
                <th className="py-2 px-4 border-b">Field</th>
                <th className="py-2 px-4 border-b">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {certificates.map(cert => (
                <tr key={cert.id} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-4">{cert.name}</td>
                  <td className="py-2 px-4">{cert.type}</td>
                  <td className="py-2 px-4">
                    {cert.type === "Internship"
                      ? `${cert.startDate || "-"} to ${cert.endDate || "-"}`
                      : cert.dateIssued || "-"}
                  </td>
                  <td className="py-2 px-4">{cert.type === "Internship" ? cert.field : "-"}</td>
                  <td className="py-2 px-4 text-xs text-gray-500">
                    {cert.createdAt && cert.createdAt.toDate
                      ? cert.createdAt.toDate().toLocaleString()
                      : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CertificateList; 