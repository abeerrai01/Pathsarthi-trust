import React, { useState } from 'react';
import { motion } from 'framer-motion';
import RazorpayButton from '../components/RazorpayButton';
import UPIPaymentModal from '../components/UPIPaymentModal';

const SponsorNotebooks = () => {
  const [quantity, setQuantity] = useState(1);
  const [name, setName] = useState('');
  const [thankYou, setThankYou] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [isQrSponsorship, setIsQrSponsorship] = useState(false);
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

  const handleQRSuccess = async () => {
    setIsQrSponsorship(true);
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
                <div className="mt-6 space-y-4">
                  <RazorpayButton amount={quantity * pricePerNotebook} name={name || 'Anonymous'} onSuccess={handleSuccess} />
                  
                  <details className="group border-2 border-slate-200 rounded-xl bg-white mt-2">
                    <summary className="flex items-center justify-between p-4 font-jakarta font-semibold text-slate-600 cursor-pointer hover:bg-slate-50 transition-colors">
                      Having trouble with Razorpay?
                      <span className="text-sm text-slate-500 group-open:hidden underline decoration-dashed underline-offset-4">Use Manual UPI</span>
                      <span className="text-sm text-slate-500 hidden group-open:block">Close</span>
                    </summary>
                    
                    <div className="p-4 pt-0 border-t-2 border-slate-100 mt-2">
                      <div className="bg-orange-50 border-2 border-orange-200 text-orange-800 text-xs p-3 rounded-xl font-jakarta mb-4 mt-2">
                        <span className="font-bold">Notice:</span> We strongly recommend using Razorpay for instant verification. Manual payments take extra time.
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => setShowQRModal(true)}
                        className="w-full bg-slate-100 text-slate-700 border-2 border-slate-300 px-6 py-3.5 rounded-lg font-semibold hover:bg-slate-200 transition-all duration-300 flex items-center justify-center gap-2"
                      >
                        Show QR Code
                      </button>
                    </div>
                  </details>
                </div>
              </>
            ) : (
              <div className="bg-green-50 p-6 rounded shadow text-center">
                <h2 className="text-xl font-semibold text-green-800 mb-4">Thank You, {name || 'Donor'}! 🙏</h2>
                {isQrSponsorship ? (
                  <p className="text-orange-700 bg-orange-50 border border-orange-100 rounded-lg p-3 text-sm font-semibold mb-4 text-left">
                    ⚠️ Please ensure you have sent your payment screenshot to <span className="font-black text-[#ff7300]">8958421200</span> so our administrators can verify and process it shortly.
                  </p>
                ) : (
                  <p className="text-gray-700 mb-2">
                    Your sponsorship has been received. Thank you for helping children get the tools they need to learn and grow!
                  </p>
                )}
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
      <UPIPaymentModal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        amount={quantity * pricePerNotebook}
        name={name || 'Anonymous'}
        onSuccess={handleQRSuccess}
      />
    </div>
  );
};

export default SponsorNotebooks; 