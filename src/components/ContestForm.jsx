import React, { useState } from 'react';
import emailjs from '@emailjs/browser';

const ContestForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({ name: '', age: '', parentEmail: '', message: '' });

  const sendEmail = (e) => {
    e.preventDefault();
    emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', formData, 'YOUR_PUBLIC_KEY')
      .then(() => {
        alert("🎉 Registration successful! Check your email soon.");
        if (onSuccess) onSuccess();
      })
      .catch(() => alert("❌ Something went wrong!"));
    setFormData({ name: '', age: '', parentEmail: '', message: '' });
  };

  return (
    <form onSubmit={sendEmail} className="bg-white rounded-xl p-6 shadow-md max-w-xl mx-auto mt-8 space-y-4">
      <h3 className="text-2xl font-bold mb-2 text-center font-bubblegum">📝 Register Now</h3>

      <input
        type="text"
        placeholder="Child's Name"
        required
        className="w-full p-2 border rounded"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
      />
      <input
        type="number"
        placeholder="Age"
        required
        className="w-full p-2 border rounded"
        value={formData.age}
        onChange={(e) => setFormData({ ...formData, age: e.target.value })}
      />
      <input
        type="email"
        placeholder="Parent's Email"
        required
        className="w-full p-2 border rounded"
        value={formData.parentEmail}
        onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
      />
      <textarea
        placeholder="Any message (optional)"
        className="w-full p-2 border rounded"
        value={formData.message}
        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
      />

      <button
        type="submit"
        className="bg-green-600 hover:bg-green-700 text-white w-full p-2 rounded"
      >
        🎯 Submit Entry
      </button>
    </form>
  );
};

export default ContestForm; 