import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Copy, Check, QrCode, ArrowRight } from "lucide-react";

const UPIPaymentModal = ({ isOpen, onClose, amount, name, onSuccess }) => {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const upiId = "8958421200m@pnb";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(upiId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  const handleComplete = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSuccess();
      onClose();
    } catch (err) {
      console.error("Error completing payment info", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-100 z-10 flex flex-col"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-orange-50 to-indigo-50">
            <div className="flex items-center gap-2">
              <QrCode className="w-5 h-5 text-[#ff7300]" />
              <h3 className="text-lg font-black text-slate-800">Scan & Pay via UPI</h3>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-white transition-colors shadow-sm border border-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <form onSubmit={handleComplete} className="p-6 space-y-4 overflow-y-auto max-h-[80vh]">
            <div className="text-center">
              <p className="text-sm font-semibold text-slate-500">Amount to Pay</p>
              <p className="text-3xl font-black text-[#ff7300] mt-1">₹{amount}</p>
            </div>

            {/* QR Code Display */}
            <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <img
                src="/Qr-code-3.jpg"
                alt="UPI QR Code"
                className="w-48 h-48 object-contain rounded-xl shadow-sm border border-white"
              />
              <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest">Pathsarthi Trust</p>
            </div>

            {/* UPI ID Copy Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">UPI ID</label>
              <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5">
                <span className="font-mono text-sm font-bold text-slate-700">{upiId}</span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="text-[#ff7300] hover:text-[#e06500] p-1.5 rounded-lg hover:bg-orange-50 transition-colors"
                  title="Copy UPI ID"
                >
                  {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3.5 text-xs text-indigo-900 leading-relaxed font-semibold">
              💡 <span className="font-extrabold">Instructions:</span> Open any UPI app (GPay, PhonePe, Paytm, BHIM, etc.), scan the QR code above (or copy UPI ID), and complete the payment of <span className="text-[#ff7300] font-black">₹{amount}</span>. 
              <br /><br />
              Please <span className="font-black text-indigo-700">send the payment screenshot</span> to our trust number: <span className="font-black text-[#ff7300]">8958421200</span>.
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#ff7300] hover:bg-indigo-600 text-white font-bold py-3.5 rounded-xl transition duration-300 shadow-md hover:shadow-indigo-200 hover:-translate-y-0.5 transform active:translate-y-0 flex items-center justify-center gap-2 text-base disabled:opacity-50 mt-4"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </>
              ) : (
                <>
                  I Have Paid & Sent Screenshot
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default UPIPaymentModal;
