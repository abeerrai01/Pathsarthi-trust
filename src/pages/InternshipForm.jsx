import React, { useState, useEffect } from 'react';
import { addDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../config/firebase";

const departments = [
  'Social Media',
  'Event Organizers',
  'College Ambassador',
  'Tech Support',
  'Content Writers',
  'Media & Photography',
];

const InternshipForm = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', age: '', education: '', city: '', state: '', field: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "internship_applications"), {
        ...form,
        createdAt: new Date(),
        status: "pending"
      });
      setIsSuccess(true);
      setForm({ name: '', email: '', phone: '', age: '', education: '', city: '', state: '', field: '', message: '' });
    } catch (error) {
      alert("Failed to submit application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-orange-50 py-12 px-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-center text-indigo-800 mb-6">Internship Application</h1>
        
        {isSuccess && (
          <div className="mb-6 p-4 bg-green-100 text-green-800 rounded-lg text-center font-medium border border-green-200">
            🎉 Application submitted successfully!<br/>We will contact you soon.
          </div>
        )}

        <div className="mb-4">
          <label className="block mb-1 font-medium">Name</label>
          <input name="name" value={form.name} onChange={handleChange} required placeholder="Full Name" className="w-full border rounded px-3 py-2" />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-medium">Email</label>
          <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="Email" className="w-full border rounded px-3 py-2" />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-medium">Phone</label>
          <input name="phone" value={form.phone} onChange={handleChange} required placeholder="Phone" className="w-full border rounded px-3 py-2" />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-medium">Age</label>
          <input name="age" type="number" value={form.age} onChange={handleChange} required placeholder="Age" className="w-full border rounded px-3 py-2" />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-medium">Education</label>
          <input name="education" value={form.education} onChange={handleChange} required placeholder="Education" className="w-full border rounded px-3 py-2" />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-medium">City</label>
          <input name="city" value={form.city} onChange={handleChange} required placeholder="City" className="w-full border rounded px-3 py-2" />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-medium">State</label>
          <input name="state" value={form.state} onChange={handleChange} required placeholder="State" className="w-full border rounded px-3 py-2" />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-medium">Department</label>
          <select name="field" value={form.field} onChange={handleChange} required className="w-full border rounded px-3 py-2 bg-white">
            <option value="">Select Department</option>
            {departments.map((dep) => (
              <option key={dep} value={dep}>{dep}</option>
            ))}
          </select>
        </div>
        <div className="mb-6">
          <label className="block mb-1 font-medium">Why do you want to join?</label>
          <textarea name="message" value={form.message} onChange={handleChange} placeholder="Share your motivation..." className="w-full border rounded px-3 py-2" rows={4} />
        </div>
        <button type="submit" disabled={isSubmitting} className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold py-3 rounded-full shadow-md hover:shadow-lg transition-all duration-300 border-2 border-transparent hover:border-white/20 disabled:opacity-70">
          {isSubmitting ? "Submitting..." : "Submit Application"}
        </button>
      </form>
    </div>
  );
};

export default InternshipForm; 