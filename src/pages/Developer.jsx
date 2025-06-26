import React from 'react';
import { motion } from 'framer-motion';

const socialLinks = [
  {
    name: 'GitHub',
    url: 'https://github.com/abeerrai01',
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C6.477 2 2 6.484 2 12.021c0 4.428 2.865 8.184 6.839 9.504.5.092.682-.217.682-.482 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.004.07 1.532 1.032 1.532 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.339-2.221-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.987 1.029-2.687-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.295 2.748-1.025 2.748-1.025.546 1.378.202 2.397.1 2.65.64.7 1.028 1.594 1.028 2.687 0 3.847-2.337 4.695-4.566 4.944.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.749 0 .267.18.579.688.481C19.138 20.2 22 16.448 22 12.021 22 6.484 17.523 2 12 2z" />
      </svg>
    ),
  },
  {
    name: 'LinkedIn',
    url: 'https://linkedin.com/in/theabeerrai',
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.761 0 5-2.239 5-5v-14c0-2.761-2.239-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.268c-.966 0-1.75-.784-1.75-1.75s.784-1.75 1.75-1.75 1.75.784 1.75 1.75-.784 1.75-1.75 1.75zm13.5 11.268h-3v-5.604c0-1.337-.025-3.063-1.868-3.063-1.868 0-2.154 1.459-2.154 2.967v5.7h-3v-10h2.881v1.367h.041c.401-.761 1.381-1.563 2.841-1.563 3.039 0 3.6 2.001 3.6 4.601v5.595z" />
      </svg>
    ),
  },
];

const Developer = () => (
  <div className="py-12 bg-gray-50 min-h-screen">
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white rounded-xl shadow-lg p-8 mb-10"
      >
        <div className="flex flex-col md:flex-row md:items-center md:space-x-6 mb-6">
          <div className="flex-shrink-0 flex items-center justify-center mb-4 md:mb-0">
            <span className="text-5xl">👨‍💻</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-1">About the Developer</h1>
            <h2 className="text-xl font-semibold text-indigo-700 mb-1">Abeer Rai</h2>
            <div className="flex flex-wrap gap-4 text-gray-600 text-sm mb-2">
              <span>📍 Dehradun, India</span>
              <span>📧 <a href="mailto:theabeerrai@gmail.com" className="underline">theabeerrai@gmail.com</a></span>
              <span>📱 <a href="tel:+918279871605" className="underline">+91 8279871605</a></span>
            </div>
            <div className="flex gap-4 mt-2">
              {socialLinks.map(link => (
                <a key={link.name} href={link.url} target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-indigo-600" aria-label={link.name}>
                  {link.icon}
                </a>
              ))}
            </div>
          </div>
        </div>
        <section className="mb-8">
          <h3 className="text-lg font-bold mb-2">🧠 Who I Am</h3>
          <p className="text-gray-700 mb-2">
            I'm Abeer Rai, a passionate Computer Science undergraduate specializing in Artificial Intelligence and Machine Learning at DIT University, Dehradun. With a strong foundation in Java, SQL, and backend development, I thrive on building meaningful, real-world projects — especially ones that aim to bring positive change to society.
          </p>
          <p className="text-gray-700 mb-2">
            I recently developed the Path Sarthi Trust Website as a voluntary contribution to support a growing NGO working in the areas of education, healthcare, and elder welfare. This platform features dynamic content management, an integrated gallery, a donation module, and an admin dashboard — all built to empower the trust to manage their digital presence independently.
          </p>
          <p className="text-gray-700">
            This project reflects my belief that technology should be accessible and empowering, especially for organizations driving real social change.
          </p>
        </section>
        <section className="mb-8">
          <h3 className="text-lg font-bold mb-2">💡 My Mission</h3>
          <p className="text-gray-700">
            To create impactful, user-centric solutions that blend creativity with code. I'm committed to using my technical skills for real-world transformation — whether it's improving healthcare access, supporting education, or building tools that simplify lives.
          </p>
          <p className="text-gray-700">
            I aim to grow as a developer, a problem-solver, and someone who builds tech with purpose.
          </p>
        </section>
        <section className="mb-8">
          <h3 className="text-lg font-bold mb-2">⚙️ Highlight Projects</h3>
          <div className="mb-4">
            <h4 className="font-semibold text-indigo-700">🩺 DocAI Scheduler</h4>
            <ul className="list-disc list-inside text-gray-700 ml-4">
              <li>Smart appointment booking (doctor, date, reason, emergency)</li>
              <li>Data persistence with MySQL + Spring Boot backend</li>
              <li>PDF generation + contact via email/SMS</li>
              <li>Designed for clinics and local hospitals</li>
            </ul>
            <p className="text-gray-600 text-sm mt-1">This project sharpened my backend skills and taught me how to build efficient, user-friendly systems under real-world constraints.</p>
          </div>
          <div>
            <h4 className="font-semibold text-indigo-700">🌐 Path Sarthi Trust Website</h4>
            <ul className="list-disc list-inside text-gray-700 ml-4">
              <li>Fully responsive frontend (React.js + Tailwind)</li>
              <li>Admin dashboard with login, analytics, and content control</li>
              <li>Firebase Auth, Firestore, Cloudinary integration</li>
              <li>Photo gallery uploads, team management, mission updates</li>
              <li>Vercel-hosted and optimized for performance + SEO</li>
            </ul>
            <p className="text-gray-600 text-sm mt-1">This project helped the trust digitize their operations and connect with a wider audience through a professional online presence.</p>
          </div>
        </section>
        <section className="mb-8">
          <h3 className="text-lg font-bold mb-2">🛠️ Skills & Technologies</h3>
          <ul className="list-disc list-inside text-gray-700 ml-4">
            <li>Languages: Java, C, Python, SQL, HTML</li>
            <li>Frameworks & Tools: React.js, Spring Boot, Firebase, MongoDB, MySQL, Cloudinary, Tailwind CSS, Git</li>
            <li>Core Concepts: Data Structures, OOP, JDBC, REST APIs, Agile, OS</li>
            <li>Soft Skills: Leadership, Communication, Teamwork, Critical Thinking</li>
          </ul>
        </section>
        <section className="mb-8">
          <h3 className="text-lg font-bold mb-2">👨‍💼 Experience & Community</h3>
          <ul className="list-disc list-inside text-gray-700 ml-4">
            <li>Virtual Intern at JPMorgan Chase & Co. (2024) — Simulated real-world credit card reward systems and implemented system recovery using Java and JUnit.</li>
            <li>GDSC-DITU Technical Member — Participated in skill-building sessions and collaborative projects around cloud and AI.</li>
            <li>ACM DITU Active Member — Contributed to coding events and peer mentorship.</li>
          </ul>
        </section>
        <section className="mb-8">
          <h3 className="text-lg font-bold mb-2">📚 Education</h3>
          <ul className="list-disc list-inside text-gray-700 ml-4">
            <li>B.Tech – Computer Science & Engineering (AI & ML), DIT University, Dehradun – CGPA: 8.91 (Till 3rd Sem)</li>
            <li>Senior Secondary (88%) – K.C. Public School, Moradabad</li>
            <li>High School (88.2%) – Spring Fields College, Moradabad</li>
          </ul>
        </section>
        <section className="mb-8">
          <h3 className="text-lg font-bold mb-2">🏆 Certifications</h3>
          <ul className="list-disc list-inside text-gray-700 ml-4">
            <li>Database Management Essentials – University of Colorado</li>
            <li>Java Programming – Oracle & LearnQuest</li>
            <li>Linux Fundamentals – LearnQuest</li>
            <li>Google Cloud Study Jam – GDSC</li>
            <li>JPMorgan Software Engineering Virtual Program – Forage</li>
            <li>MySQL & DBMS – Meta</li>
          </ul>
        </section>
        <section className="mb-8">
          <h3 className="text-lg font-bold mb-2">🗣️ Languages Known</h3>
          <ul className="list-disc list-inside text-gray-700 ml-4">
            <li>English, Hindi, German (Beginner)</li>
          </ul>
        </section>
        <section className="mb-8">
          <h3 className="text-lg font-bold mb-2">✨ Let's Connect!</h3>
          <p className="text-gray-700 mb-2">
            I'm open to collaborations, internships, freelance work, and volunteering opportunities — especially projects that focus on social good or innovation.
          </p>
          <p className="text-gray-700">
            Want to work together or chat about an idea?<br />
            📧 Email me at <a href="mailto:theabeerrai@gmail.com" className="underline">theabeerrai@gmail.com</a> or connect on <a href="https://www.linkedin.com/in/theabeerrai/" target="_blank" rel="noopener noreferrer" className="underline">LinkedIn</a>.
          </p>
        </section>
      </motion.div>
    </div>
  </div>
);

export default Developer; 