import React, { useState } from 'react';

const departments = [
  'Social Media',
  'Event Organizers',
  'Community Recruiters',
  'Tech Support',
  'Content Writers',
  'Media & Photography',
  'Education Ambassadors',
];

const InternshipForm = () => {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-orange-50">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-green-700 mb-4">Thank you for applying!</h2>
          <p className="text-gray-700 mb-2">You will make a great impact for society.</p>
          <p className="text-gray-500">Our team will contact you soon.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-orange-50 py-12">
      <form
        action="https://formspree.io/f/xnnvypvg"
        method="POST"
        className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full"
        onSubmit={() => setSubmitted(true)}
      >
        <h1 className="text-3xl font-bold text-center text-indigo-800 mb-6">Internship Application</h1>
        <div className="mb-4">
          <label className="block mb-1 font-medium">Name</label>
          <input name="name" required placeholder="Full Name" className="w-full border rounded px-3 py-2" />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-medium">Email</label>
          <input name="email" type="email" required placeholder="Email" className="w-full border rounded px-3 py-2" />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-medium">Phone</label>
          <input name="phone" required placeholder="Phone" className="w-full border rounded px-3 py-2" />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-medium">Age</label>
          <input name="age" required placeholder="Age" className="w-full border rounded px-3 py-2" />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-medium">Education</label>
          <input name="education" required placeholder="Education" className="w-full border rounded px-3 py-2" />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-medium">City</label>
          <input name="city" required placeholder="City" className="w-full border rounded px-3 py-2" />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-medium">Department</label>
          <select name="field" required className="w-full border rounded px-3 py-2">
            <option value="">Select Department</option>
            {departments.map((dep) => (
              <option key={dep} value={dep}>{dep}</option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-medium">Why do you want to join?</label>
          <textarea name="message" placeholder="Why do you want to join?" className="w-full border rounded px-3 py-2" rows={4} />
        </div>
        <button type="submit" className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-white/20">
          Submit Application
        </button>
      </form>
    </div>
  );
};

export default InternshipForm; 