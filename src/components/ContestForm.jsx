import React, { useRef } from "react";
import emailjs from "@emailjs/browser";

const ContestForm = ({ onSuccess }) => {
  const form = useRef();

  const sendEmail = (e) => {
    e.preventDefault();
    emailjs.sendForm(
      "service_aj9ohf7",
      "template_szv3iog",
      form.current,
      "0qpshPwH1REx-2KTB"
    )
      .then(
        (result) => {
          alert("🎉 Submission successful!");
          if (onSuccess) onSuccess();
          form.current.reset();
        },
        (error) => {
          alert("❌ Submission failed. Please try again.");
          console.error(error);
        }
      );
  };

  return (
    <form ref={form} onSubmit={sendEmail} className="bg-white rounded-xl p-6 shadow-md max-w-xl mx-auto mt-8 space-y-4">
      <h3 className="text-2xl font-bold mb-2 text-center font-bubblegum">📝 Register Now</h3>
      <input type="text" name="name" placeholder="Child's Name" required className="w-full p-2 border rounded" />
      <input type="number" name="age" placeholder="Age" required className="w-full p-2 border rounded" />
      <input type="email" name="email" placeholder="Parent's Email" required className="w-full p-2 border rounded" />
      <textarea name="message" placeholder="Any message (optional)" className="w-full p-2 border rounded" />
      <button type="submit" className="bg-green-600 hover:bg-green-700 text-white w-full p-2 rounded">
        🎯 Submit Entry
      </button>
    </form>
  );
};

export default ContestForm; 