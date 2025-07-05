import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Home = () => {
  const stats = [
    { label: 'Lives Impacted', value: '10,000+' },
    { label: 'Projects Completed', value: '50+' },
    { label: 'Volunteers', value: '500+' },
    { label: 'Communities Served', value: '25+' },
  ];

  const initiatives = [
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
    {
      title: 'Child Welfare',
      description: 'We support vulnerable children by providing care, education, and opportunities for a brighter future.',
      image: '/ChildWelfare.jpg',
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

      {/* Impact Stats */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Our Impact</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center p-6 bg-white rounded-lg shadow-sm"
              >
                <div className="text-4xl font-bold text-indigo-600 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
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
      <div className="w-full flex justify-center mt-8">
        <a href="https://www.hitwebcounter.com" target="_blank" rel="noopener noreferrer">
          <img src="https://hitwebcounter.com/counter/counter.php?page=20956663&style=0005&nbdigits=9&type=page&initCount=0" title="Counter Widget" alt="Visit counter For Websites" border="0" />
        </a>
      </div>
    </div>
  );
};

export default Home; 