import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc, increment } from "firebase/firestore";
import { db } from "../config/firebase";

const VisitorCounter = () => {
  const [count, setCount] = useState(null);

  useEffect(() => {
    const updateVisitCount = async () => {
      const counterRef = doc(db, "stats", "counter");
      const snap = await getDoc(counterRef);

      if (snap.exists()) {
        // Increment the counter
        await updateDoc(counterRef, {
          visits: increment(1),
        });

        // Fetch the updated count
        const updatedSnap = await getDoc(counterRef);
        setCount(updatedSnap.data().visits);
      } else {
        console.error("Visitor counter document not found.");
      }
    };

    updateVisitCount();
  }, []);

  return (
    <div style={{ textAlign: "center", fontSize: "20px", marginTop: "20px" }}>
      👀 Visitors:
      {count !== null ? (
        <span style={{ display: 'inline-flex', gap: '8px', marginLeft: '10px' }}>
          {String(count).split('').map((digit, idx) => (
            <span
              key={idx}
              style={{
                display: 'inline-block',
                minWidth: '32px',
                minHeight: '40px',
                background: '#23272f',
                color: '#fff',
                fontWeight: 700,
                fontSize: '2rem',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
                textAlign: 'center',
                lineHeight: '40px',
                marginRight: '2px',
                letterSpacing: '2px',
                border: '2px solid #444',
              }}
            >
              {digit}
            </span>
          ))}
        </span>
      ) : (
        <strong>Loading...</strong>
      )}
    </div>
  );
};

export default VisitorCounter; 