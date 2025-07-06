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
      👀 Visitors: <strong>{count !== null ? count : "Loading..."}</strong>
    </div>
  );
};

export default VisitorCounter; 