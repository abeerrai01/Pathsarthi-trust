import React, { useState } from 'react';
import { motion } from 'framer-motion';
import RazorpayButton from '../components/RazorpayButton';
import PaymentModal from '../components/PaymentModal';
import PaymentButtons from '../components/PaymentButtons';
import GooglePayManualFlow from '../components/GooglePayManualFlow';

const SponsorNotebooks = () => {
  const [quantity, setQuantity] = useState(1);
  const [name, setName] = useState('');
  const [thankYou, setThankYou] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const pricePerNotebook = 25;

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 1) {
      setQuantity(value);
    }
  };

  const handleIncrement = () => {
    setQuantity(prev => prev + 1);
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleSuccess = () => {
    setThankYou(true);
  };

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold mb-6">Sponsor Notebooks</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Help provide essential learning tools to children in need. Each notebook you sponsor makes a direct impact on a child's education journey.
          </p>
        </motion.div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex justify-center items-center"
          >
            <img
              src="/notebook.jpg"
              alt="School Notebook"
              className="w-48 h-48 object-contain border-2 border-gray-300 rounded-lg p-2"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-lg shadow-sm p-8"
          >
            {!thankYou ? (
              <>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Your Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full border-2 border-gray-200 rounded-lg p-2"
                  />
                </div>
                <div className="mb-8">
                  <h2 className="text-2xl font-semibold mb-4">Select Quantity</h2>
                  <div className="flex items-center justify-center space-x-4">
                    <button
                      onClick={handleDecrement}
                      className="bg-gray-100 text-gray-600 hover:bg-gray-200 p-2 rounded-lg"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={handleQuantityChange}
                      className="w-20 text-center border-2 border-gray-200 rounded-lg p-2"
                    />
                    <button
                      onClick={handleIncrement}
                      className="bg-gray-100 text-gray-600 hover:bg-gray-200 p-2 rounded-lg"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12M6 12h12" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="text-center mb-8">
                  <p className="text-gray-600 mb-2">Price per notebook: ₹{pricePerNotebook}</p>
                  <p className="text-2xl font-bold text-indigo-600">Total: ₹{quantity * pricePerNotebook}</p>
                </div>
                <GooglePayManualFlow amount={quantity * pricePerNotebook} />
                <button
                  type="button"
                  className="w-full mt-4 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  onClick={() => setShowQRModal(true)}
                >
                  Pay with QR code / Mobile Number (Faster, No Extra Charges)
                </button>
                <PaymentModal open={showQRModal} onClose={() => setShowQRModal(false)}>
                  <div className="flex flex-col items-center">
                    <img src="/Qr-code-3.jpg" alt="QR Code" className="h-48 w-48 object-contain rounded mb-4" />
                    <div className="mb-2 text-center">
                      <div className="font-semibold">UPI ID: <span className="font-mono">8958421200m@pnb</span></div>
                      <div className="font-semibold">Mobile: <span className="font-mono">8958421200</span></div>
                    </div>
                    <ol className="text-left text-gray-700 mb-2 list-decimal pl-5">
                      <li>Scan the QR code above or download and scan using any payment app.</li>
                      <li>Or, copy the mobile number and pay via your UPI/payment app.</li>
                      <li>Complete the payment.</li>
                    </ol>
                    <div className="text-xs text-gray-500 mt-2">No extra charges. Fastest way to pay!</div>
                  </div>
                </PaymentModal>
              </>
            ) : (
              <div className="bg-green-50 p-6 rounded shadow text-center">
                <h2 className="text-xl font-semibold text-green-800 mb-4">Thank You, {name || 'Donor'}! 🙏</h2>
                <p className="text-gray-700 mb-2">
                  Your sponsorship has been received. Thank you for helping children get the tools they need to learn and grow!
                </p>
                <p className="text-gray-700 mb-4">
                  Every notebook you sponsor brings a child closer to their dreams.
                </p>
                <p className="text-sm text-gray-600">📧 pathsarthi2022@gmail.com</p>
                <p className="text-sm text-gray-600">🌐 www.pathsarthi.in</p>
                <p className="text-sm text-gray-600">📱 Instagram: @pathsarthi</p>
                <p className="text-sm text-gray-600">📞 8958421200</p>
              </div>
            )}
          </motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-gray-50 rounded-lg p-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            <div className="md:col-span-2">
              <h2 className="text-2xl font-semibold mb-4">Meet Aarav: A Story of Hope</h2>
              <p className="text-gray-600 mb-4">
                "I want to become a teacher when I grow up," says 9-year-old Aarav, his eyes sparkling with determination. 
                Despite facing financial hardships, Aarav walks 3 kilometers every day to attend school, carrying his dreams 
                and one precious notebook where he carefully writes every lesson.
              </p>
              <p className="text-indigo-600 font-medium">
                Your notebook donation can help children like Aarav turn their dreams into reality. Each notebook is a step 
                towards a brighter future.
              </p>
            </div>
            <div className="md:col-span-1">
              <img
                src="/gettyimages-1502970309-612x612.jpg"
                alt="Student studying"
                className="w-full h-40 object-cover rounded-lg shadow-sm"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SponsorNotebooks; 