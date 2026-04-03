import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  CheckCircle2, 
  BriefcaseHandshake,
  TrendingUp,
  FileCheck2,
  ShieldCheck,
  ChevronRight,
  X,
  Send
} from 'lucide-react';

const CSRSection = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    companyName: '',
    budget: '',
    contactPerson: '',
    contactInfo: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({...prev, [name]: value}));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real scenario, this would send an email or save to DB.
    alert('Thank you for your interest! Our team will contact you shortly.');
    setIsFormOpen(false);
    setFormData({companyName: '', budget: '', contactPerson: '', contactInfo: ''});
  };

  return (
    <section className="relative py-24 overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-blue-50">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 p-32 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse"></div>
      <div className="absolute top-0 right-48 p-32 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse animation-delay-2000"></div>
      
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        
        {/* Header & Badge */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 border border-green-200 shadow-sm mb-6"
          >
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-green-800 font-bold text-sm tracking-wide uppercase">MCA Approved CSR Entity</span>
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-800 pb-2"
          >
            💼 CSR Registration & Corporate Partnership
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="max-w-3xl mx-auto text-xl text-slate-600 leading-relaxed font-medium"
          >
            We are proud to announce that Path Sarthi Trust is officially registered with the Ministry of Corporate Affairs, Government of India, to undertake Corporate Social Responsibility (CSR) activities.
          </motion.p>
        </div>

        {/* Registration Card & Why Partner */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-20">
          
          {/* Registration Details Card (Glassmorphism) */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-5 bg-white/70 backdrop-blur-md rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-white"
          >
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200">
                <ShieldCheck className="text-white w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-800">Registration Details</h3>
                <p className="text-indigo-600 font-medium text-sm">Official Credentials</p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="mt-1 bg-blue-100 p-2 rounded-lg"><Building2 className="text-blue-700 w-5 h-5" /></div>
                <div>
                  <p className="text-sm text-slate-500 font-medium">Registered Authority</p>
                  <p className="text-lg font-bold text-slate-800">Ministry of Corporate Affairs (MCA)</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="mt-1 bg-blue-100 p-2 rounded-lg"><FileCheck2 className="text-blue-700 w-5 h-5" /></div>
                <div>
                  <p className="text-sm text-slate-500 font-medium">Registration Number</p>
                  <p className="text-xl font-black text-indigo-700">CSR00107853</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="mt-1 bg-blue-100 p-2 rounded-lg"><CheckCircle2 className="text-blue-700 w-5 h-5" /></div>
                <div>
                  <p className="text-sm text-slate-500 font-medium">Date of Approval</p>
                  <p className="text-lg font-bold text-slate-800">19 March 2026</p>
                </div>
              </div>
            </div>

            <div className="mt-8 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-4 border border-emerald-100 flex items-center gap-3">
              <div className="bg-white p-1 rounded-full shadow-sm"><span className="text-xl">✅</span></div>
              <p className="text-emerald-800 font-semibold text-sm">Eligible for CSR funding under Companies Act, 2013</p>
            </div>
          </motion.div>

          {/* Why Partner Grid */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-7 flex flex-col justify-center"
          >
            <h3 className="text-3xl font-bold text-slate-800 mb-8 flex items-center gap-3">
              🤝 Why Partner With Us?
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { title: "Government-Recognized", desc: "We are officially approved to receive CSR contributions, ensuring full compliance and transparency.", icon: "🌍" },
                { title: "Transparent Utilization", desc: "We provide impact reports, project updates, and complete financial transparency.", icon: "📊" },
                { title: "High-Impact Social Work", desc: "Our initiatives deeply focus on Education 📚, Community welfare 🏡, and Youth development 🚀.", icon: "💡" },
                { title: "Brand Visibility", desc: "Partners get website recognition, social media promotion, and event branding opportunities.", icon: "📢" }
              ].map((item, idx) => (
                <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-50">
                  <div className="text-3xl mb-3">{item.icon}</div>
                  <h4 className="text-lg font-bold text-slate-800 mb-2">{item.title}</h4>
                  <p className="text-slate-600 text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Benefits & Impact Booster */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20 bg-slate-900 rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden">
          {/* subtle background decoration */}
          <div className="absolute top-0 left-0 w-full h-full opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, #ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
          
          <div className="relative z-10">
            <h3 className="text-3xl font-bold mb-8 flex items-center gap-3">
              <TrendingUp className="text-blue-400 w-8 h-8" />
              Benefits for Donors
            </h3>
            <ul className="space-y-5">
              {[
                "Tax benefits under applicable laws",
                "Strong brand image & immediate social impact",
                "Verified NGO partner (MCA Registered)",
                "Real-time project updates and impact metrics"
              ].map((benefit, i) => (
                <li key={i} className="flex items-center gap-4 bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                  <div className="bg-blue-500 rounded-full p-1 text-white"><CheckCircle2 className="w-5 h-5" /></div>
                  <span className="font-medium text-slate-100 text-lg">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative z-10 lg:border-l lg:border-slate-700 lg:pl-12 mt-12 lg:mt-0">
            <h3 className="text-3xl font-bold mb-8 flex items-center gap-3">
              📊 Where Your Money Goes
            </h3>
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-blue-900/60 to-slate-800 p-5 rounded-2xl border border-blue-800/30">
                <div className="text-blue-300 font-bold mb-1 text-sm">Starting at ₹10,000</div>
                <div className="text-xl font-semibold flex items-center gap-3">
                  <span className="text-3xl">🎒</span> Education kits for 10+ students
                </div>
              </div>
              <div className="bg-gradient-to-r from-indigo-900/60 to-slate-800 p-5 rounded-2xl border border-indigo-800/30">
                <div className="text-indigo-300 font-bold mb-1 text-sm">Starting at ₹50,000</div>
                <div className="text-xl font-semibold flex items-center gap-3">
                  <span className="text-3xl">🤝</span> Full community support program
                </div>
              </div>
              <div className="bg-gradient-to-r from-purple-900/60 to-slate-800 p-5 rounded-2xl border border-purple-800/30 relative overflow-hidden">
                <div className="absolute right-0 top-0 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl"></div>
                <div className="text-purple-300 font-bold mb-1 text-sm text-yellow-400 flex items-center gap-2"><span>⭐</span> ₹1 Lakh+</div>
                <div className="text-xl font-semibold flex items-center gap-3">
                  <span className="text-3xl">🚀</span> Exclusive Project Sponsorship
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section (The Next Level Trick) */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-indigo-600 rounded-[2.5rem] p-10 md:p-16 text-center text-white shadow-[0_20px_50px_rgba(79,70,229,0.3)] relative overflow-hidden"
        >
          {/* bg glow */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] bg-gradient-to-br from-blue-500/30 to-purple-500/30 rotate-12 blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col items-center">
            <h2 className="text-4xl md:text-5xl font-black mb-6">🚀 Partner With Us</h2>
            <p className="text-xl md:text-2xl text-indigo-100 mb-10 max-w-2xl font-medium">
              Looking to fulfill your CSR obligations with real impact? Don't just donate, invest in credibility, visibility, and high-impact social change.
            </p>
            <button 
              onClick={() => setIsFormOpen(true)}
              className="group relative inline-flex items-center justify-center gap-3 bg-white text-indigo-600 px-8 py-4 rounded-full font-bold text-lg transition-all hover:scale-105 hover:bg-slate-50 focus:ring-4 focus:ring-indigo-300 shadow-xl"
            >
               Become a CSR Partner
               <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </motion.div>
      </div>

      {/* Modal Form */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setIsFormOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden z-10"
            >
              <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-6 text-white flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold">Partner With Us</h3>
                  <p className="text-indigo-100 text-sm mt-1">Let's create lasting impact together.</p>
                </div>
                <button 
                  onClick={() => setIsFormOpen(false)}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-8 space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Company Name</label>
                  <input 
                    type="text" 
                    name="companyName"
                    required
                    value={formData.companyName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    placeholder="Enter official company name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">CSR Budget Range</label>
                  <select 
                    name="budget"
                    value={formData.budget}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white"
                  >
                    <option value="" disabled>Select approximate budget</option>
                    <option value="10k - 50k">₹10,000 - ₹50,000</option>
                    <option value="50k - 1L">₹50,000 - ₹1,00,000</option>
                    <option value="1L - 5L">₹1,00,000 - ₹5,00,000</option>
                    <option value="5L+">₹5,00,000+</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Contact Person</label>
                  <input 
                    type="text" 
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    placeholder="Full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Email or Phone</label>
                  <input 
                    type="text" 
                    name="contactInfo"
                    value={formData.contactInfo}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    placeholder="How should we reach you?"
                  />
                </div>
                
                <button 
                  type="submit"
                  className="w-full mt-4 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-bold text-lg transition-colors shadow-lg shadow-indigo-600/30"
                >
                  <Send className="w-5 h-5" />
                  Submit Partnership Request
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default CSRSection;
