import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import emailjs from 'emailjs-com';
import { FaYoutube } from 'react-icons/fa';

const SERVICE_ID = 'service_aj9ohf7';
const TEMPLATE_ID = 'template_cikb2vt';
const PUBLIC_KEY = '0qpshPwH1REx-2KTB';

const JoinUs = () => {
  const [form, setForm] = useState({ name: '', age: '', email: '', phone: '', district: '', state: '', city: '', hearAbout: '', hearAboutDetail: '' });
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [subscribeError, setSubscribeError] = useState("");
  const navigate = useNavigate();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!subscribed) {
      setSubscribeError("You must subscribe to our YouTube channel to submit the form.");
      return;
    } else {
      setSubscribeError("");
    }
    setSubmitting(true);
    try {
      await emailjs.send(
        SERVICE_ID,
        TEMPLATE_ID,
        form,
        PUBLIC_KEY
      );
      setShowModal(true);
    } catch (error) {
      alert('There was an error sending your registration. Please try again.');
    }
    setSubmitting(false);
  };

  const handleOk = () => {
    setShowModal(false);
    navigate('/');
  };

  return (
    <div className="py-12 min-h-screen bg-gray-50 flex items-center justify-center">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Join Us</h1>
        <div className="mb-4">
          <label className="block mb-1 font-medium">Name</label>
          <input name="name" value={form.name} onChange={handleChange} required className="w-full border rounded px-3 py-2" />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-medium">Age</label>
          <input name="age" type="number" value={form.age} onChange={handleChange} required className="w-full border rounded px-3 py-2" />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-medium">Email ID</label>
          <input name="email" type="email" value={form.email} onChange={handleChange} required className="w-full border rounded px-3 py-2" />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-medium">Phone Number</label>
          <input name="phone" type="tel" value={form.phone} onChange={handleChange} required className="w-full border rounded px-3 py-2" />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-medium">District</label>
          <input name="district" value={form.district} onChange={handleChange} required className="w-full border rounded px-3 py-2" />
        </div>
        <div className="mb-6">
          <label className="block mb-1 font-medium">State</label>
          <input name="state" value={form.state} onChange={handleChange} required className="w-full border rounded px-3 py-2" />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-medium">City</label>
          <input name="city" value={form.city || ''} onChange={handleChange} required className="w-full border rounded px-3 py-2" />
        </div>
        {/* How did you hear about us? (optional dropdown) */}
        <div className="mb-4">
          <label className="block mb-1 font-medium">How did you hear about us? <span className="text-gray-400 text-xs">(Optional)</span></label>
          <select
            name="hearAbout"
            value={form.hearAbout || ''}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          >
            <option value="">Select an option</option>
            <option value="Member Referral">Member Referral</option>
            <option value="Instagram">Instagram</option>
            <option value="Facebook">Facebook</option>
            <option value="LinkedIn">LinkedIn</option>
            <option value="WhatsApp Group">WhatsApp Group</option>
            <option value="WhatsApp Status / Story">WhatsApp Status / Story</option>
            <option value="Campus Ambassador">Campus Ambassador</option>
            <option value="Poster / Banner">Poster / Banner</option>
            <option value="YouTube / Shorts">YouTube / Shorts</option>
            <option value="Email / Newsletter">Email / Newsletter</option>
            <option value="Pathsarthi Website">Pathsarthi Website</option>
            <option value="Google Search">Google Search</option>
            <option value="Event">Event</option>
            <option value="Other">Other</option>
          </select>
        </div>
        {(form.hearAbout === 'Member Referral' || form.hearAbout === 'Other') && (
          <div className="mb-4">
            <label className="block mb-1 font-medium">Please specify</label>
            <input
              name="hearAboutDetail"
              value={form.hearAboutDetail}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              placeholder={form.hearAbout === 'Member Referral' ? 'Who referred you?' : 'Please specify'}
              required
            />
          </div>
        )}
        <div className="mb-4 flex items-center">
          <input
            id="youtube-subscribe"
            type="checkbox"
            checked={subscribed}
            onChange={e => setSubscribed(e.target.checked)}
            className="mr-2"
            required
          />
          <label htmlFor="youtube-subscribe" className="flex items-center cursor-pointer">
            <FaYoutube className="text-red-600 text-2xl mr-2" />
            <span>
              I have subscribed to our
              <a
                href="https://www.youtube.com/channel/UCH85rcaMHgCtN2fV8W_51LQ"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline ml-1"
              >
                YouTube channel
              </a>
              .
            </span>
          </label>
        </div>
        {subscribeError && (
          <div className="mb-4 text-red-600 text-sm font-semibold">{subscribeError}</div>
        )}
        <button type="submit" disabled={submitting} className="w-full bg-indigo-600 text-white py-2 rounded font-semibold hover:bg-indigo-700 transition">
          {submitting ? 'Submitting...' : 'Submit'}
        </button>
      </form>
      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-sm w-full">
            <h2 className="text-xl font-bold mb-4">Registration Successful</h2>
            <p className="mb-6">Board of trustee will verify your application and contact you soon.</p>
            <button onClick={handleOk} className="bg-indigo-600 text-white px-6 py-2 rounded font-semibold hover:bg-indigo-700 transition">OK</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default JoinUs; 