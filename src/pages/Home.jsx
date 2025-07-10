import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import VisitorCounter from "../components/VisitorCounter";
import SupporterCard from '../components/SupporterCard';

const Home = () => {
  const stats = [
    { label: 'Lives Impacted', value: '1000+' },
    { label: 'Projects Completed', value: '50+' },
    { label: 'Volunteers', value: '100+' },
    { label: 'Communities Served', value: '25+' },
  ];

  const initiatives = [
    {
      title: 'Child Welfare',
      description: 'We support vulnerable children by providing care, education, and opportunities for a brighter future.',
      image: '/ChildWelfare.jpg',
    },
    {
      title: 'Education Support',
      description: 'Providing quality education and learning resources to underprivileged children.',
      image: '/Background1.jpg',
    },
    {
      title: 'Healthcare Access',
      description: 'Facilitating medical care and health awareness in rural communities.',
      image: '/medical.jpg',
    },
    {
      title: 'Women Empowerment',
      description: 'Supporting women through skill development and entrepreneurship programs.',
      image: '/women-empowerment-in-2019.png',
    },
  ];

  // Ref for the counter container
  const counterRef = useRef(null);

  useEffect(() => {
    // Clean up any previous counter
    if (counterRef.current) {
      counterRef.current.innerHTML = "";
    }
    // Create the powered by link
    const poweredBy = document.createElement('a');
    poweredBy.href = 'https://www.free-counters.org/';
    poweredBy.textContent = 'powered by Free-Counters.org';
    poweredBy.target = '_blank';
    poweredBy.rel = 'noopener noreferrer';
    if (counterRef.current) counterRef.current.appendChild(poweredBy);
    // Add the first script
    const script1 = document.createElement('script');
    script1.type = 'text/javascript';
    script1.src = 'https://www.freevisitorcounters.com/auth.php?id=22bf731492fb17baa4745af20331c0fdd2467bf9';
    script1.async = true;
    if (counterRef.current) counterRef.current.appendChild(script1);
    // Add the second script
    const script2 = document.createElement('script');
    script2.type = 'text/javascript';
    script2.src = 'https://www.freevisitorcounters.com/en/home/counter/1353603/t/5';
    script2.async = true;
    if (counterRef.current) counterRef.current.appendChild(script2);
    // Cleanup
    return () => {
      if (counterRef.current) counterRef.current.innerHTML = "";
    };
  }, []);

  const certificateImages = [
    '/Certificate 1.jpg',
    '/Certificate 2.jpg',
    '/Certificate 3.jpg',
  ];

  // Add this state for the certificate slideshow
  const [currentCert, setCurrentCert] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentCert((prev) => (prev + 1) % certificateImages.length);
    }, 1000); // 1 second per slide
    return () => clearInterval(interval);
  }, []);

  const supporters = [
    {
      name: "SNR Hotel",
      logo: "/SNR hotel.jpg"
    },
    {
      name: "Sachin Tube Company",
      logo: "/Sachin tube.jpg"
    },
    {
      name: "Rastogi Provisional Store",
      logo: null
    },
    {
      name: "RJS Associates",
      logo: null
    },
  ];

  // Supporter carousel state
  const [currentSupporter, setCurrentSupporter] = useState(0);
  // Responsive supportersToShow
  const [supportersToShow, setSupportersToShow] = useState(3);
  useEffect(() => {
    const handleResize = () => {
      setSupportersToShow(window.innerWidth < 768 ? 1 : 3);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSupporter((prev) => (prev + 1) % supporters.length);
    }, 1000);
    return () => clearInterval(interval);
  }, [supporters.length]);

  // Helper to get visible supporters in a cyclic way
  const getVisibleSupporters = () => {
    const visible = [];
    for (let i = 0; i < supportersToShow; i++) {
      visible.push(supporters[(currentSupporter + i) % supporters.length]);
    }
    return visible;
  };

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section
        className="relative text-white py-20 flex items-center justify-center"
        style={{
          backgroundImage: 'url(/ub21.jpg)',
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white bg-opacity-80 rounded-xl shadow-lg p-8 max-w-2xl w-full flex flex-col items-center"
        >
          <img
            src="/Logo-2.png"
            alt="Path Sarthi Trust"
            className="h-32 w-auto mb-6"
          />
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 text-center">
            Welcome to Path Sarthi Trust - Empowering Lives Through Action
          </h1>
          <p className="text-xl mb-8 text-gray-800 text-center">
            Path Sarthi Trust is a leading Moradabad NGO dedicated to empowering communities through education, healthcare, and sustainable development initiatives. Join us to make a difference—donate to NGO in India and help transform lives today.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 w-full">
            <Link
              to="/donate"
              className="bg-black text-white px-8 py-3 rounded-md hover:bg-gray-900 transition-colors w-full sm:w-auto text-center"
            >
              Donate Now
            </Link>
            <Link
              to="/mission"
              className="bg-white text-black px-8 py-3 rounded-md border border-black hover:bg-gray-100 transition-colors w-full sm:w-auto text-center"
            >
              Our Mission
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Interns and Impact Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Our Impact</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            <div className="text-center p-6 bg-gray-50 rounded-lg shadow-sm">
              <div className="text-4xl font-bold text-indigo-600 mb-2">1000+</div>
              <div className="text-gray-600">Lives Impacted</div>
            </div>
            <div className="text-center p-6 bg-gray-50 rounded-lg shadow-sm">
              <div className="text-4xl font-bold text-indigo-600 mb-2">50+</div>
              <div className="text-gray-600">Projects Completed</div>
            </div>
            <div className="text-center p-6 bg-gray-50 rounded-lg shadow-sm">
              <div className="text-4xl font-bold text-indigo-600 mb-2">100+</div>
              <div className="text-gray-600">Volunteers</div>
            </div>
            <div className="text-center p-6 bg-gray-50 rounded-lg shadow-sm">
              <div className="text-4xl font-bold text-indigo-600 mb-2">25+</div>
              <div className="text-gray-600">Communities Served</div>
            </div>
            <div className="text-center p-6 bg-gray-50 rounded-lg shadow-sm">
              <div className="text-4xl font-bold text-indigo-600 mb-2">30+</div>
              <div className="text-gray-600">Interns</div>
            </div>
          </div>
        </div>
      </section>

      {/* Proof of Trust Legitimacy */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6 text-blue-700">Proof of Trust Legitimacy</h2>
          <p className="mb-8 text-gray-600">We are a registered and recognized organization. Here are some of our official certificates and recognitions:</p>
          <div className="flex justify-center items-center mb-8">
            <div className="w-full max-w-md h-80 md:max-w-2xl md:h-[32rem] rounded-xl shadow-2xl bg-white flex items-center justify-center overflow-hidden">
              <img
                src={certificateImages[currentCert]}
                alt={`Certificate ${currentCert + 1}`}
                className="w-full h-full object-contain transition-all duration-700 ease-in-out drop-shadow-lg"
                style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}
              />
            </div>
          </div>
          <div className="flex justify-center mt-4 gap-2">
            {certificateImages.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentCert(idx)}
                className={`w-3 h-3 rounded-full ${currentCert === idx ? 'bg-blue-600' : 'bg-gray-300'} transition-colors`}
                aria-label={`Go to certificate ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Free Health Camp Section */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1 mb-8 md:mb-0">
            <img
              src="/news.jpg"
              alt="Free Health Camp News"
              className="w-full h-auto rounded-xl shadow-lg object-contain"
            />
          </div>
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-indigo-700 mb-4 flex items-center gap-2">🩺 Free Health Camp Organized!</h2>
            <p className="text-lg text-gray-800 mb-4">
              PathSarthi Trust, in collaboration with Ujala Cygnus Hospital, successfully organized a Free Health Checkup Camp
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>🧪 Free tests included BP, sugar, and thyroid for local citizens and advocates.</li>
            </ul>
            <p className="text-gray-800 mb-4">
              👤 The camp was led by Chairman Advocate Ravi Prakash Rai, promoting health awareness with great public support.
            </p>
            <p className="text-green-700 font-semibold">
              PathSarthi Trust continues its mission to serve society through health and care. 🌿
            </p>
          </div>
        </div>
      </section>

      {/* Featured Initiatives */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Our Initiatives</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {initiatives.map((initiative, index) => (
              <motion.div
                key={initiative.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-lg overflow-hidden shadow-sm"
              >
                <div className="h-48 bg-gray-200">
                  <img
                    src={initiative.image}
                    alt={initiative.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{initiative.title}</h3>
                  <p className="text-gray-600">{initiative.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Supporters Slideshow */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6 text-blue-700">Our Supporters</h2>
          <div className="flex justify-center items-center mb-8 gap-6">
            {getVisibleSupporters().map((supporter, idx) => (
              <div key={idx} className="w-full max-w-xs h-64 rounded-xl shadow-2xl bg-white flex flex-col items-center justify-center overflow-hidden mx-auto transition-all duration-700">
                {supporter.logo ? (
                  <img
                    src={supporter.logo}
                    alt={supporter.name}
                    className="w-32 h-32 object-contain mx-auto mb-2"
                  />
                ) : (
                  <div className="w-32 h-32 flex items-center justify-center bg-black mx-auto mb-2 rounded-full text-4xl font-bold text-white">
                    {supporter.name.charAt(0)}
                  </div>
                )}
                <h3 className="text-xl font-bold text-gray-800 mt-2">{supporter.name}</h3>
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-4 gap-2">
            {supporters.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSupporter(idx)}
                className={`w-3 h-3 rounded-full ${currentSupporter === idx ? 'bg-blue-600' : 'bg-gray-300'} transition-colors`}
                aria-label={`Go to supporter ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Path Sarthi Trust Introduction Video */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-6">Path Sarthi Trust Introduction by Chairman Ravi Prakash Rai</h2>
          <div className="aspect-w-16 aspect-h-9 w-full rounded-lg shadow-lg overflow-hidden mx-auto">
            <iframe
              src="https://www.youtube.com/embed/upicFvhg1Qk"
              title="Path Sarthi Trust Introduction by Chairman Ravi Prakash Rai"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-96"
            ></iframe>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-indigo-600">
        <div className="max-w-4xl mx-auto text-center text-white px-4">
          <h2 className="text-3xl font-bold mb-6">Ready to Make a Difference?</h2>
          <p className="text-xl mb-8">
            Your support can help us continue our mission and create lasting change in communities.
          </p>
          <div className="space-x-4">
            <Link
              to="/donate"
              className="inline-block bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition-colors"
            >
              Donate Now
            </Link>
            <Link
              to="/contribution"
              className="inline-block border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-indigo-600 transition-colors"
            >
              Get Involved
            </Link>
          </div>
        </div>
      </section>

      {/* Visitor Counter */}
      <VisitorCounter />
    </div>
  );
};

export default Home; 