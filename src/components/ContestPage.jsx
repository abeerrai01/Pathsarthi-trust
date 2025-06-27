import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ContestForm from './ContestForm';
import contestBanner from '../../assets/images/contest-banner.jpg'; // placeholder path
import prizeImg from '../../assets/images/kit.png'; // placeholder path

const Confetti = ({ show }) => (
  <AnimatePresence>
    {show && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 pointer-events-none flex items-start justify-center"
      >
        <img src="https://cdn.jsdelivr.net/gh/stevenlei/party-js-confetti/confetti.gif" alt="Confetti" className="w-full max-w-2xl mt-10" />
      </motion.div>
    )}
  </AnimatePresence>
);

const ContestPage = () => {
  const [confetti, setConfetti] = useState(false);
  return (
    <div className="min-h-screen bg-[#f9f5ff] text-[#222] font-sans">
      <Confetti show={confetti} />
      {/* 🎉 Hero Section */}
      <div className="text-center bg-[#ffe7cc] p-8 rounded-b-3xl shadow-md">
        <img src={contestBanner} alt="Pathsarthi Contest Banner" className="mx-auto rounded-xl max-h-[400px]" />
        <h1 className="text-4xl md:text-5xl font-bold mt-4 font-bubblegum">🎨 Pathsarthi Kids Creativity Contest</h1>
        <p className="text-lg md:text-xl mt-2">Win amazing kits and certificates! Open to all kids 🧒👧</p>
      </div>

      {/* 📋 Contest Details */}
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <h2 className="text-3xl font-semibold text-center font-bubblegum">What's the Contest About? 🤔</h2>
        <p className="text-lg">
          We're inviting all kids to showcase their creative skills in <b>drawing, painting, storytelling or poem writing</b>. The best 10 entries win exclusive Pathsarthi Kits, and all participants receive official certificates. 🏅
        </p>

        <div className="grid md:grid-cols-2 gap-4 text-lg">
          <div>
            <h3 className="font-semibold text-xl font-bubblegum">📆 Contest Timeline</h3>
            <ul className="list-disc ml-5 mt-2">
              <li>Submission Deadline: July 20th, 2025</li>
              <li>Result Announcement: July 30th, 2025</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-xl font-bubblegum">🏆 Prizes</h3>
            <ul className="list-disc ml-5 mt-2">
              <li>Top 10 Kids: Exclusive Pathsarthi Kit</li>
              <li>All Participants: Digital Certificate</li>
            </ul>
            <img src={prizeImg} alt="Pathsarthi Kit" className="mt-2 rounded-lg shadow-lg" />
          </div>
        </div>

        <div className="text-center mt-8">
          <h2 className="text-2xl font-bold mb-2 font-bubblegum">🎯 How to Participate?</h2>
          <ol className="list-decimal ml-8 text-left max-w-xl mx-auto">
            <li>Fill the form below with your details 👇</li>
            <li>Submit your artwork or story via email (you'll get instructions after registering)</li>
            <li>Wait for the results – every kid gets a reward! 🎁</li>
          </ol>
        </div>

        {/* ✍️ Registration Form */}
        <ContestForm onSuccess={() => setConfetti(true)} />
      </div>
    </div>
  );
};

export default ContestPage; 