import React, { useState, useEffect } from 'react';
import SupporterCard from '../components/SupporterCard';
import { db } from '../config/firebase';
import { collection, getDocs } from 'firebase/firestore';

const Supporters = () => {
  const [supporters, setSupporters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSupporter, setSelectedSupporter] = useState(null);

  useEffect(() => {
    const fetchSupporters = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'supporters'));
        const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setSupporters(fetched);
      } catch (err) {
        console.error("Error fetching supporters:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSupporters();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-2">🤝 Our Pillars of Support</h2>
        <p className="text-gray-600 mb-10">We thank our supporters for standing with us to bring hope, health, and happiness. 🙏</p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {loading ? (
            <div className="col-span-full text-center text-gray-500 py-10">Loading supporters...</div>
          ) : supporters.length === 0 ? (
            <div className="col-span-full text-center text-gray-500 py-10">No supporters found.</div>
          ) : (
            supporters.map((supporter, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className='w-full max-w-xs h-80 flex items-stretch'>
                  <SupporterCard
                    name={supporter.name}
                    description={supporter.description}
                    since={supporter.since}
                    logo={supporter.image || supporter.logo}
                    onClick={() => setSelectedSupporter(supporter)}
                  />
                </div>
              </div>
            ))
          )}
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
            Become a Supporter 💙
          </a>
        </div>
      </div>
      {/* Modal for supporter story */}
      {selectedSupporter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl font-bold"
              onClick={() => setSelectedSupporter(null)}
              aria-label="Close"
            >
              &times;
            </button>
            {selectedSupporter.image || selectedSupporter.logo ? (
              <img src={selectedSupporter.image || selectedSupporter.logo} alt={selectedSupporter.name} className="w-32 h-32 object-contain mx-auto mb-4" />
            ) : (
              <div className="w-20 h-20 flex items-center justify-center bg-gray-200 mx-auto mb-4 rounded-full text-4xl font-bold text-gray-600">
                {selectedSupporter.name ? selectedSupporter.name.charAt(0) : 'U'}
              </div>
            )}
            <h3 className="text-2xl font-bold mb-2 text-gray-800">{selectedSupporter.name}</h3>
            <p className="text-gray-600 mb-4">{selectedSupporter.description}</p>
            <p className="text-sm text-gray-500 mb-4">{selectedSupporter.since && `Supporter since ${selectedSupporter.since}`}</p>
            <div className="bg-blue-50 rounded p-4 text-blue-800 font-medium">
              {selectedSupporter.story}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Supporters; 