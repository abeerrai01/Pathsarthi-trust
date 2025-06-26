import React from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';

const CheckoutNotebooks = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { quantity = 1 } = location.state || {};
  const pricePerNotebook = 25;
  const totalAmount = quantity * pricePerNotebook;

  const handlePayment = () => {
    const upiLink = `upi://pay?pa=pathsarthi2022-1@okaxis&pn=Path Sarthi%20Trust&cu=INR&am=${totalAmount}`;
    window.location.href = upiLink;
  };

  return (
    <div className="min-h-screen py-12 bg-gradient-to-b from-orange-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto"
        >
          {/* Order Summary Card */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h1>

              {/* Order Details */}
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center py-3 border-b">
                  <span className="text-gray-600">Notebooks</span>
                  <span className="font-semibold">{quantity} units</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b">
                  <span className="text-gray-600">Price per notebook</span>
                  <span className="font-semibold">₹{pricePerNotebook}</span>
                </div>
                <div className="flex justify-between items-center py-3 text-lg font-bold">
                  <span>Total Amount</span>
                  <span>₹{totalAmount}</span>
                </div>
              </div>

              {/* Impact Message */}
              <div className="bg-orange-50 rounded-lg p-4 mb-8">
                <p className="text-sm text-gray-600">
                  Your sponsorship of {quantity} notebook{quantity > 1 ? 's' : ''} will help {quantity} {quantity > 1 ? 'children' : 'child'} get the tools they need for education.
                </p>
              </div>

              {/* Payment Buttons */}
              <div className="space-y-4">
                <button
                  onClick={handlePayment}
                  className="w-full bg-green-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <span>Pay ₹{totalAmount} with UPI</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </button>
                
                <button
                  onClick={() => navigate('/sponsor-notebooks')}
                  className="w-full bg-gray-100 text-gray-600 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                >
                  Modify Order
                </button>
              </div>

              {/* Security Note */}
              <div className="mt-6 text-center text-sm text-gray-500">
                <p>Secure payment powered by UPI</p>
                <p className="mt-1">You'll be redirected to your preferred UPI app to complete the payment</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CheckoutNotebooks; 