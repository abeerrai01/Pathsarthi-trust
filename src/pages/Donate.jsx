import React, { useState } from 'react';
import { motion } from 'framer-motion';
import RazorpayButton from '../components/RazorpayButton';
import UPIPaymentModal from '../components/UPIPaymentModal';

const Donate = () => {
  const [selectedAmount, setSelectedAmount] = useState('500');
  const [customAmount, setCustomAmount] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [thankYou, setThankYou] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [isQrDonation, setIsQrDonation] = useState(false);

  const donationAmounts = [
    { value: '500', label: '₹500' },
    { value: '1000', label: '₹1,000' },
    { value: '2500', label: '₹2,500' },
    { value: '5000', label: '₹5,000' },
  ];

  const impactMetrics = [
    {
      amount: '₹500',
      description: 'Provides educational materials for one child for a month',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
    },
    {
      amount: '₹1,000',
      description: 'Supports healthcare checkup for a family',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
    },
    {
      amount: '₹2,500',
      description: 'Funds skill development training for one woman',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
    },
    {
      amount: '₹5,000',
      description: 'Enables community development project for a month',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
  ];

  const getAmount = () => {
    if (customAmount) return Number(customAmount);
    return Number(selectedAmount);
  };

  const handleSuccess = () => {
    setThankYou(true);
  };

  const handleQRSuccess = async () => {
    setIsQrDonation(true);
    setThankYou(true);
  };

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl font-bold mb-6">Support Our Cause</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Your generous donation helps us continue our mission of empowering communities and creating lasting positive change.
          </p>
        </motion.div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-semibold mb-6">Make a Donation</h2>
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
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Email ID</label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="Enter your email ID"
                      className="w-full border-2 border-gray-200 rounded-lg p-2"
                    />
                  </div>
                  <div className="mb-6">
                    <label className="block text-gray-700 mb-4">Select Amount</label>
                    <div className="grid grid-cols-2 gap-4">
                      {donationAmounts.map((amount) => (
                        <button
                          key={amount.value}
                          type="button"
                          onClick={() => {
                            setSelectedAmount(amount.value);
                            setCustomAmount('');
                          }}
                          className={`py-3 px-4 rounded-lg border-2 font-medium transition-colors ${
                            selectedAmount === amount.value
                              ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
                              : 'border-gray-200 hover:border-indigo-600 hover:bg-indigo-50'
                          }`}
                        >
                          {amount.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mb-6">
                    <label className="block text-gray-700 mb-2">Custom Amount</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                      <input
                        type="number"
                        value={customAmount}
                        onChange={e => {
                          setCustomAmount(e.target.value);
                          setSelectedAmount('');
                        }}
                        placeholder="Enter amount"
                        className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-600 focus:ring-0"
                      />
                    </div>
                  </div>
                  <div className="mt-6 space-y-4">
                    <RazorpayButton amount={getAmount()} name={name || 'Anonymous'} email={email} onSuccess={handleSuccess} />
                    
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
                  {isQrDonation ? (
                    <p className="text-orange-700 bg-orange-50 border border-orange-100 rounded-lg p-3 text-sm font-semibold mb-4 text-left">
                      ⚠️ Please ensure you have sent your payment screenshot to <span className="font-black text-[#ff7300]">8958421200</span> so our administrators can verify and process it shortly.
                    </p>
                  ) : (
                    <p className="text-gray-700 mb-2">
                      Your generous donation has been successfully received. We are deeply grateful for your support towards Path Sarthi Trust and our mission to bring positive change in society.
                    </p>
                  )}
                  <p className="text-gray-700 mb-4">
                    With your contribution, we can reach more children, uplift more families, and create a better future.
                  </p>
                  <p className="text-sm text-gray-600">📧 pathsarthi2022@gmail.com</p>
                  <p className="text-sm text-gray-600">🌐 www.pathsarthi.in</p>
                  <p className="text-sm text-gray-600">📱 Instagram: @pathsarthi</p>
                  <p className="text-sm text-gray-600">📞 8958421200</p>
                </div>
              )}
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="bg-gray-50 rounded-lg p-8">
              <h2 className="text-2xl font-semibold mb-6">Your Impact</h2>
              <div className="space-y-6">
                {impactMetrics.map((metric, index) => (
                  <motion.div
                    key={metric.amount}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                    className="flex items-start space-x-4 bg-white p-4 rounded-lg"
                  >
                    <div className="text-indigo-600">{metric.icon}</div>
                    <div>
                      <div className="font-semibold text-lg">{metric.amount}</div>
                      <div className="text-gray-600">{metric.description}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="mt-8 p-6 bg-indigo-50 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Why Donate to Path Sarthi Trust?</h3>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start">
                    <svg className="w-6 h-6 text-indigo-600 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>100% of your donation goes directly to our programs</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-6 h-6 text-indigo-600 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Regular updates on the impact of your contribution</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-6 h-6 text-indigo-600 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Tax benefits under Section 80G</span>
                  </li>
                </ul>
              </div>
              <div className="mt-8 text-center">
                <p className="text-xl text-gray-600 italic">
                  "It's not how much we give, but how much love we put into giving." — Mother Teresa
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      <UPIPaymentModal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        amount={getAmount()}
        name={name || 'Anonymous'}
        email={email}
        onSuccess={handleQRSuccess}
      />
    </div>
  );
};

export default Donate; 