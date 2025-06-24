import React from 'react';
import { motion } from 'framer-motion';

const AboutUs = () => {
  const boardMembers = [
    {
      name: 'Shri Ravi Prakash Rai',
      role: 'President',
    },
    {
      name: 'Shri Rupesh Kumar Chauhan',
      role: 'Vice President',
    },
    {
      name: 'Shri Om Prakash Rai',
      role: 'Treasurer',
    },
    {
      name: 'Shri Arun Kumar Singh',
      role: 'Secretary',
    },
    {
      name: 'Shri Satya Prakash Rai',
      role: 'Financial Advisor',
    },
    {
      name: 'Shri Priyansh Rai',
      role: 'Vice Secretary',
    },
    {
      name: 'Shri Abeer Rai',
      role: 'Board Member',
    },
  ];

  const organizationStats = [
    { label: 'Board Members', value: '4' },
    { label: 'Full-Time Employees', value: '8' },
    { label: 'Volunteers & Interns', value: '~52' },
    { label: 'Advisory Team', value: '6' },
    { label: 'Active Donors', value: '70+' },
  ];

  const donorBenefits = [
    {
      title: 'Be Part of a Community',
      description: 'Connect with like-minded people and share thoughts, opinions, and ideas.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    {
      title: 'Access to Events',
      description: 'Get exclusive invites to curated weekend events hosted by our partners and staff.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      title: 'Join the Change Makers',
      description: 'Become a part of a movement led by others who believe in collective social good.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ),
    },
    {
      title: 'Assurance & Transparency',
      description: 'Get regular updates on how your donation is impacting children across India.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
    {
      title: 'Membership Certificate',
      description: 'Receive an official welcome and certificate of gratitude.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      title: 'Flexible Donation Options',
      description: 'Pause, resume, increase, or decrease your donation anytime with flexible payment methods.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Organization Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl font-bold mb-6">About PathSarthi Trust</h1>
          <div className="bg-white rounded-lg shadow-sm p-8 max-w-3xl mx-auto">
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Registered Office</h2>
              <p className="text-gray-600">
                E-374-375, Kashiram Nagar, Moradabad, Uttar Pradesh, India – PIN 244001
              </p>
            </div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Registration</h2>
              <p className="text-gray-600">
                Registered with Niti Aayog Darpan, Government of India<br />
                Registration ID: UP/2022/0317438
              </p>
            </div>
            <div>
              <p className="text-gray-600">
                PathSarthi is an NGO based in Moradabad, Uttar Pradesh, India. Established in 2022, 
                PathSarthi Trust is actively contributing to the well-being of children, elderly individuals, 
                and the underprivileged through structured programs in health, education, and welfare.
                The trust currently operates with three branches across India.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Vision & Mission */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-16"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <h2 className="text-2xl font-semibold mb-4">Our Vision</h2>
              <p className="text-gray-600 mb-4">
                To enhance the quality of life in education and health through collaboration with 
                individuals and communities. PathSarthi aims to ensure continuous financial and 
                emotional support for people with special needs, leading innovative solutions and 
                enabling them to reach their full potential.
              </p>
              <p className="text-indigo-600 italic">
                "With a mission to empower children in slums, PathSarthi is reaching out to transform 
                lives through education and skills."
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
              <p className="text-gray-600">
                Create a better world through well-designed support programs that improve education, 
                healthcare, rehabilitation, corrective surgeries, and aid distribution — bringing real 
                change to those who need it most.
              </p>
            </div>
          </div>
        </motion.section>

        {/* Organization Stats */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-center mb-12">Our Structure</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {organizationStats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                className="bg-white rounded-lg p-6 text-center shadow-sm"
              >
                <div className="text-3xl font-bold text-indigo-600 mb-2">{stat.value}</div>
                <div className="text-gray-600 text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Board of Trustees */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-center mb-12">Board of Trustees</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {boardMembers.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                className="bg-white rounded-lg p-6 shadow-sm"
              >
                <h3 className="text-xl font-semibold mb-2">{member.name}</h3>
                <p className="text-indigo-600">{member.role}</p>
              </motion.div>
            ))}
          </div>
          <div className="mt-8 bg-gray-50 rounded-lg p-6">
            <p className="text-gray-600 italic">
              "Trustee means and includes the board of trustees as described herein. Present trustees 
              and any future trustees shall be nominated, selected, or appointed by the remaining 
              members when vacancies arise."
            </p>
          </div>
        </motion.section>

        {/* Why Join Our Donor Family */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <h2 className="text-3xl font-bold text-center mb-12">Why Join Our Donor Family?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {donorBenefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                className="bg-white rounded-lg p-6 shadow-sm"
              >
                <div className="text-indigo-600 mb-4">{benefit.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-xl text-gray-600 italic max-w-3xl mx-auto">
              "At PathSarthi, we believe your support — no matter how big or small — is the reason 
              we can help children survive, thrive, and grow."
            </p>
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default AboutUs; 