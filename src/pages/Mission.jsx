import React from 'react';
import { motion } from 'framer-motion';

const Mission = () => {
  const initiatives = [
    {
      title: 'Education that Empowers',
      description: 'We believe education is the most powerful weapon we can use to change the world. We work tirelessly to ensure that children living in slums, villages, or construction sites receive access to basic learning tools — be it notebooks, school bags, or enrollment support.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" 
          />
        </svg>
      ),
    },
    {
      title: 'Health with Dignity',
      description: 'Health is not a privilege — it is a right. Our mission includes organizing medical aid drives, corrective surgeries, rehabilitation programs, and distributing essential mobility aids like crutches, wheelchairs, and hearing devices.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
          />
        </svg>
      ),
    },
    {
      title: 'Caring for the Forgotten',
      description: 'The elderly often go unseen in our fast-paced world. We ensure that our seniors are not forgotten, but remembered, respected, and cared for through warm meals, monthly ration kits, and companionship.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
          />
        </svg>
      ),
    },
    {
      title: 'Empowering Communities',
      description: 'We believe in building self-reliant communities through skill-building programs, awareness campaigns, and inclusive events. We work with communities, not just for them.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" 
          />
        </svg>
      ),
    },
  ];

  const stats = [
    { value: '70+', label: 'Active Donors' },
    { value: '52+', label: 'Volunteers' },
    { value: '2022', label: 'Founded' },
    { value: '1000+', label: 'Lives Impacted' },
  ];

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Mission Statement */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl font-bold mb-6">🌟 Our Mission: Empowering Lives, One Step at a Time</h1>
          <div className="max-w-3xl mx-auto">
            <p className="text-xl text-gray-600 mb-6">
              At PathSarthi Trust, our mission goes beyond charity — it's a heartfelt commitment to stand with those who have been overlooked, to serve with compassion, and to uplift with dignity. Founded in 2022 in Moradabad, Uttar Pradesh, our journey began with a single belief:
            </p>
            <p className="text-2xl font-semibold text-indigo-600 italic mb-6">
              "Every life, no matter where it begins, deserves a chance to dream, to heal, and to rise."
            </p>
            <p className="text-lg text-gray-600">
              We aim to bring lasting transformation in the lives of underprivileged children, the elderly, persons with disabilities, and marginalized communities through structured, compassionate, and deeply impactful initiatives.
            </p>
          </div>
        </motion.section>

        {/* Impact Stats */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-16"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                className="text-center p-6 bg-white rounded-lg shadow-sm"
              >
                <div className="text-4xl font-bold text-indigo-600 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Initiatives */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-16"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {initiatives.map((initiative, index) => (
              <motion.div
                key={initiative.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                className="bg-white rounded-lg p-6 shadow-sm"
              >
                <div className="text-indigo-600 mb-4 flex items-center">
                  {initiative.icon}
                  <h3 className="text-xl font-semibold ml-3">{initiative.title}</h3>
                </div>
                <p className="text-gray-600">{initiative.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Movement of Hope */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center"
        >
          <div className="bg-indigo-50 rounded-lg p-8 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">🌱 A Movement of Hope</h2>
            <p className="text-gray-600 mb-6">
              PathSarthi is more than an organization — it's a family of change-makers, including volunteers, donors, and advisors who believe that small acts of kindness can ripple out into big changes. With over 70 active donors, 52+ volunteers, and a committed core team, we're not just running programs — we're nurturing a movement powered by compassion.
            </p>
            <div className="text-xl font-semibold text-indigo-600 italic">
              "We don't need to change the whole world at once — we just need to change someone's world every day."
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default Mission; 