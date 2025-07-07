import React, { useState } from 'react';
import PartnerCard from '../components/PartnerCard';

const partners = [
  {
    name: "Sachin Tube Company",
    description: "Supported infrastructure for donation drives",
    since: "2024",
    story: "Sachin Tube Company provided the essential infrastructure that enabled us to organize large-scale donation drives, reaching thousands in need."
  },
  {
    name: "Rastogi Provisional Store",
    description: "Donated weekly food and ration packs",
    since: "2023",
    story: "Rastogi Provisional Store has been a consistent supporter, donating food and ration packs every week to ensure no family goes hungry."
  },
  {
    name: "RJS Associates",
    description: "Provided financial guidance and sponsorship",
    since: "2024",
    story: "RJS Associates offered invaluable financial guidance and sponsored key projects, helping us scale our impact."
  },
];

const Partners = () => {
  const [selectedPartner, setSelectedPartner] = useState(null);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-2">🤝 Our Pillars of Support</h2>
        <p className="text-gray-600 mb-10">We thank our partners for standing with us to bring hope, health, and happiness. 🙏</p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {partners.map((partner, index) => (
            <PartnerCard
              key={index}
              name={partner.name}
              description={partner.description}
              since={partner.since}
              onClick={() => setSelectedPartner(partner)}
            />
          ))}
        </div>

        <div className="mt-12 text-center">
          <h3 className="text-xl font-bold mb-2">Want to collaborate?</h3>
          <p className="text-sm text-gray-500 mb-4">
            We're always looking for more hearts to join our mission.
          </p>
          <a
            href="/join-us"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition"
          >
            Become a Partner 💙
          </a>
        </div>
      </div>
      {/* Modal for partner story */}
      {selectedPartner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl font-bold"
              onClick={() => setSelectedPartner(null)}
              aria-label="Close"
            >
              &times;
            </button>
            <div className="w-20 h-20 flex items-center justify-center bg-gray-200 mx-auto mb-4 rounded-full text-4xl font-bold text-gray-600">
              {selectedPartner.name.charAt(0)}
            </div>
            <h3 className="text-2xl font-bold mb-2 text-gray-800">{selectedPartner.name}</h3>
            <p className="text-gray-600 mb-4">{selectedPartner.description}</p>
            <p className="text-sm text-gray-500 mb-4">{selectedPartner.since && `Partner since ${selectedPartner.since}`}</p>
            <div className="bg-blue-50 rounded p-4 text-blue-800 font-medium">
              {selectedPartner.story}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Partners; 