import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import TributeModal from '../components/TributeModal';

const Contribution = () => {
  const [tributeOpen, setTributeOpen] = React.useState(false);
  const [tributeType, setTributeType] = React.useState('');
  const impactStories = [
    {
      id: 5,
      title: "Child Welfare",
      name: "Hope for Children",
      description: "We help vulnerable children by providing care, education, and opportunities for a brighter future. Every child deserves a safe and nurturing environment.",
      image: "/ChildWelfare.jpg",
    },
    {
      id: 1,
      title: "Empowering Through Education",
      name: "Priya's Story",
      description: "From struggling to access basic education to becoming a community teacher, Priya's journey showcases the transformative power of educational support.",
      image: "/Gunjan 2.jpg",
    },
    {
      id: 2,
      title: "Healthcare Access",
      name: "Village Health Initiative",
      description: "Our mobile health clinics have provided essential healthcare services to over 500 families in remote villages, significantly improving community health outcomes.",
      image: "/medical.jpg",
    },
    {
      id: 3,
      title: "Women Empowerment",
      name: "Rural Women's Collective",
      description: "A group of 25 women started their own small businesses through our skill development program, inspiring many others in their community.",
      image: "/IMG-20231223-WA0030 - Gunjan Gururani.jpg",
    },
    {
      id: 4,
      title: "Community Development Project",
      name: "Project Uplift",
      description: "Project Uplift is one of Path Sarthi Trust's flagship initiatives, focusing on holistic community development in rural Moradabad. Through education, healthcare, and skill-building workshops, the project has empowered hundreds of families to achieve self-reliance and a better quality of life.",
      image: "/Project.jpg",
    },
  ];

  const contributionWays = [
    {
      title: "Volunteer",
      description: "Join our team of dedicated volunteers and contribute your time and skills to various projects.",
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      link: "/volunteer",
    },
    {
      title: "Donate",
      description: "Support our initiatives through monetary contributions. Every donation makes a difference.",
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      link: "/donate",
    },
    {
      title: "Partner",
      description: "Collaborate with us as an organization to create greater impact through shared resources and expertise.",
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      link: "/partner",
    },
    {
      title: "Spread Awareness",
      description: "Help us reach more people by sharing our mission and impact stories with your network.",
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
        </svg>
      ),
      link: "/spread-awareness",
    },
  ];

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl font-bold mb-6">Make a Difference</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join us in our mission to create positive change. Every contribution, big or small, helps us make a lasting impact in the lives of those we serve.
          </p>
        </motion.div>

        {/* Impact Stories */}
        <section className="mb-16">
          <div className="mb-10 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-bold mb-2 text-accent-700">🌸 Women Empowerment – Pathsarthi Trust</h3>
              <p className="text-gray-700">At Pathsarthi, we believe in empowering women to become self-reliant, confident, and independent. Through skill development, awareness programs, and community support, we aim to uplift women and give them a platform to grow, lead, and inspire change.</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-bold mb-2 text-sky-700">📚 Education Support – Pathsarthi Trust</h3>
              <p className="text-gray-700">Education is the foundation of a better future. Pathsarthi is dedicated to supporting underprivileged students by providing learning resources, mentorship, and financial assistance. Our mission is to ensure that no child is left behind due to lack of opportunity.</p>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-center mb-12">Impact Stories</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {impactStories.map((story, index) => (
              <motion.div
                key={story.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-lg overflow-hidden shadow-sm cursor-pointer"
                onClick={() => {
                  if (story.title === 'Women Empowerment') {
                    setTributeType('');
                    setTributeOpen(true);
                  } else if (story.title === 'Empowering Through Education') {
                    setTributeType('education');
                    setTributeOpen(true);
                  }
                }}
              >
                <div className="h-48 bg-gray-200">
                  <img
                    src={story.image}
                    alt={story.title}
                    className={`w-full h-full ${
                      story.title === 'Empowering Through Education'
                        ? 'object-cover object-top'
                        : story.title === 'Community Development Project'
                        ? 'object-contain'
                        : 'object-cover'
                    }`}
                    style={
                      story.title === 'Empowering Through Education'
                        ? { objectPosition: 'top' }
                        : undefined
                    }
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{story.title}</h3>
                  {story.title === 'Women Empowerment' ? (
                    <div className="bg-accent-50 rounded p-3 mb-2 text-accent-700 text-sm font-medium">
                      At Pathsarthi, we believe in empowering women to become self-reliant, confident, and independent. Through skill development, awareness programs, and community support, we aim to uplift women and give them a platform to grow, lead, and inspire change.
                    </div>
                  ) : story.title === 'Empowering Through Education' ? (
                    <div className="bg-sky-50 rounded p-3 mb-2 text-sky-700 text-sm font-medium">
                      Education is the foundation of a better future. Pathsarthi is dedicated to supporting underprivileged students by providing learning resources, mentorship, and financial assistance. Our mission is to ensure that no child is left behind due to lack of opportunity.
                    </div>
                  ) : null}
                  <h4 className="text-indigo-600 mb-2">{story.name}</h4>
                  <p className="text-gray-600">{story.description}</p>
                </div>
              </motion.div>
            ))}
            <TributeModal open={tributeOpen} onClose={() => setTributeOpen(false)} type={tributeType} />
          </div>
        </section>

        {/* Ways to Contribute */}
        <section>
          <h2 className="text-3xl font-bold text-center mb-12">Ways to Contribute</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {contributionWays.map((way, index) => (
              <motion.div
                key={way.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                className="bg-white rounded-lg p-6 shadow-sm text-center"
              >
                <Link to={way.link} className="block group">
                  <div className="text-indigo-600 mb-4 flex justify-center group-hover:text-indigo-500 transition-colors">
                    {way.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-indigo-600 transition-colors">
                    {way.title}
                  </h3>
                  <p className="text-gray-600">{way.description}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Call to Action */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16 bg-indigo-600 rounded-lg p-12 text-center text-white"
        >
          <h2 className="text-3xl font-bold mb-6">Ready to Make an Impact?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Take the first step towards creating positive change. Join our community of change-makers today.
          </p>
          <Link
            to="/donate"
            className="inline-block bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition-colors"
          >
            Donate Now
          </Link>
        </motion.section>
      </div>
    </div>
  );
};

export default Contribution; 