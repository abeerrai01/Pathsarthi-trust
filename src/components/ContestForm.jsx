import React, { useRef, useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../config/firebase";

const ContestForm = ({ onSuccess }) => {
  const form = useRef();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sendEmail = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(form.current);
    try {
      await addDoc(collection(db, "contest_entries"), {
        name: formData.get("name"),
        age: formData.get("age"),
        email: formData.get("email"),
        message: formData.get("message"),
        createdAt: new Date(),
        status: 'pending'
      });
      alert("🎉 Submission successful!");
      if (onSuccess) onSuccess();
      form.current.reset();
    } catch (error) {
      console.error(error);
      alert("❌ Submission failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form ref={form} onSubmit={sendEmail} className="bg-white rounded-xl p-6 shadow-md max-w-xl mx-auto mt-8 space-y-4">
      <h3 className="text-2xl font-bold mb-2 text-center font-bubblegum">📝 Register Now</h3>
      <input type="text" name="name" placeholder="Child's Name" required className="w-full p-2 border rounded" />
      <input type="number" name="age" placeholder="Age" required className="w-full p-2 border rounded" />
      <input type="email" name="email" placeholder="Parent's Email" required className="w-full p-2 border rounded" />
      <textarea name="message" placeholder="Any message (optional)" className="w-full p-2 border rounded" />
      <button type="submit" disabled={isSubmitting} className="bg-green-600 hover:bg-green-700 text-white w-full p-2 rounded disabled:opacity-70">
        {isSubmitting ? "Submitting..." : "🎯 Submit Entry"}
      </button>
    </form>
  );
};

export default ContestForm; 