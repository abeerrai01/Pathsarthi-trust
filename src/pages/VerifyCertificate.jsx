import { useParams } from "react-router-dom";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../config/firebase";
import { useEffect, useState } from "react";

export default function VerifyCertificate() {
  const { name } = useParams();
  const [cert, setCert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCert = async () => {
      if (!name) {
        setError("No name provided for verification");
        setLoading(false);
        return;
      }

      try {
        const q = query(
          collection(db, "certificates"),
          where("name", "==", decodeURIComponent(name))
        );
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const certData = querySnapshot.docs[0].data();
          setCert(certData);
        } else {
          setError("Certificate not found");
        }
      } catch (err) {
        setError("Error verifying certificate");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCert();
  }, [name]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying certificate...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {cert ? (
          <div className="bg-white shadow-lg rounded-lg p-6 text-center">
            <div className="mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-green-600 mb-2">✅ Certificate Verified</h1>
              <p className="text-gray-600">This certificate is authentic and has been issued by PathSarthi</p>
            </div>
            
            <div className="border-t pt-4">
              <div className="space-y-3 text-left">
                <div>
                  <span className="font-semibold text-gray-700">Name:</span>
                  <p className="text-lg font-medium">{cert.name}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Certificate Type:</span>
                  <p className="text-lg font-medium">{cert.type}</p>
                </div>
                {cert.type === 'Recognition' && cert.field && (
                  <div>
                    <span className="font-semibold text-gray-700">Field:</span>
                    <p className="text-lg font-medium">{cert.field}</p>
                  </div>
                )}
                <div>
                  <span className="font-semibold text-gray-700">Date Issued:</span>
                  <p className="text-lg font-medium">{cert.dateIssued}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Status:</span>
                  <p className="text-lg font-medium text-green-600">✓ Verified</p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t">
              <p className="text-sm text-gray-500">
                Verified on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow-lg rounded-lg p-6 text-center">
            <div className="mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-red-600 mb-2">❌ Certificate Not Found</h1>
              <p className="text-gray-600">{error || "This certificate could not be verified"}</p>
            </div>
            
            <div className="mt-6 pt-4 border-t">
              <p className="text-sm text-gray-500">
                If you believe this is an error, please contact PathSarthi support
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 