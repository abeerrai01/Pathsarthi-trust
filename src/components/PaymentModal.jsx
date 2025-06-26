import React from 'react';

const PaymentModal = ({ open, onClose }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl font-bold"
          aria-label="Close"
        >
          &times;
        </button>
        <h2 className="text-lg font-bold mb-4 text-center">Payment Information</h2>
        <p className="mb-4 text-center text-gray-700">
          Please try to contact the administrator on phone number <br />
          <span className="font-semibold">9837004175</span><br />
          or pay with QR code below.
        </p>
        <div className="flex justify-center mb-2">
          <img src="/qr-code-3.jpg" alt="QR Code" className="h-48 w-48 object-contain rounded" />
        </div>
      </div>
    </div>
  );
};

export default PaymentModal; 