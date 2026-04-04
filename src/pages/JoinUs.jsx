import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import emailjs from 'emailjs-com';
import { Youtube, CheckCircle2, User, Phone, Mail, Map, Home, Star, Send } from 'lucide-react';
import Section from '../components/ui/Section';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const SERVICE_ID = 'service_aj9ohf7';
const TEMPLATE_ID = 'template_cikb2vt';
const PUBLIC_KEY = '0qpshPwH1REx-2KTB';

const JoinUs = () => {
  const [form, setForm] = useState({ name: '', age: '', email: '', phone: '', district: '', state: '', city: '', hearAbout: '', hearAboutDetail: '' });
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [subscribeError, setSubscribeError] = useState("");
  const navigate = useNavigate();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!subscribed) {
      setSubscribeError("You must join the movement on YouTube first! 🚀");
      return;
    }
    setSubscribeError("");
    setSubmitting(true);
    try {
      await emailjs.send(SERVICE_ID, TEMPLATE_ID, form, PUBLIC_KEY);
      setShowModal(true);
    } catch (error) {
      alert('Oops! Our pigeons got lost. Please try submitting again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOk = () => {
    setShowModal(false);
    navigate('/');
  };

  const inputClasses = "w-full bg-white border-4 border-foreground rounded-2xl p-4 font-bold text-lg focus:ring-4 focus:ring-accent/20 transition-all outline-none placeholder:text-mutedForeground/30";
  const labelClasses = "block text-xs font-black uppercase tracking-widest text-mutedForeground mb-2 ml-1";

  return (
    <div className="bg-background">
      <Section title="Join the Movement" subtitle="Hero Registration" className="pt-32">
        <div className="max-w-2xl mx-auto">
          <Card variant="featured" className="p-8 md:p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-3xl -mr-16 -mt-16" />
            
            <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
              <div className="text-center mb-10">
                <h2 className="text-3xl font-heading font-black text-foreground uppercase tracking-tighter">Become a Path Sarthi</h2>
                <p className="text-mutedForeground font-bold">Help us build a kinder world, one step at a time.</p>
              </div>

              {/* Personal Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className={labelClasses}>Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-accent" />
                    <input name="name" value={form.name} onChange={handleChange} required className={`${inputClasses} pl-12`} placeholder="Arjun Singh" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className={labelClasses}>Age</label>
                  <input name="age" type="number" value={form.age} onChange={handleChange} required className={inputClasses} placeholder="24" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className={labelClasses}>Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary" />
                    <input name="email" type="email" value={form.email} onChange={handleChange} required className={`${inputClasses} pl-12`} placeholder="arjun@hero.com" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className={labelClasses}>Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-tertiary" />
                    <input name="phone" type="tel" value={form.phone} onChange={handleChange} required className={`${inputClasses} pl-12`} placeholder="+91 99999..." />
                  </div>
                </div>
              </div>

              {/* Location Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="space-y-2">
                  <label className={labelClasses}>City</label>
                  <input name="city" value={form.city} onChange={handleChange} required className={inputClasses} placeholder="Moradabad" />
                </div>
                <div className="space-y-2">
                  <label className={labelClasses}>District</label>
                  <input name="district" value={form.district} onChange={handleChange} required className={inputClasses} placeholder="Moradabad" />
                </div>
                <div className="space-y-2">
                  <label className={labelClasses}>State</label>
                  <input name="state" value={form.state} onChange={handleChange} required className={inputClasses} placeholder="UP" />
                </div>
              </div>

              <div className="space-y-2">
                <label className={labelClasses}>How did you hear about us?</label>
                <select name="hearAbout" value={form.hearAbout} onChange={handleChange} className={inputClasses}>
                  <option value="">Select an option</option>
                  <option value="Instagram">Instagram</option>
                  <option value="YouTube">YouTube</option>
                  <option value="Member Referral">Member Referral</option>
                  <option value="Event">Event</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* YouTube Verification Sticker */}
              <div className="p-6 bg-accent/5 border-4 border-dashed border-foreground/20 rounded-3xl group transition-colors hover:border-accent/40">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="w-16 h-16 bg-white border-2 border-foreground rounded-2xl flex items-center justify-center shadow-pop group-hover:rotate-6 transition-transform">
                    <Youtube className="w-8 h-8 text-[#FF0000]" />
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h4 className="font-heading font-black text-foreground">Join the Digital Force</h4>
                    <p className="text-xs font-bold text-mutedForeground">Subscribe to our YouTube to unlock your registration.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      id="youtube-subscribe"
                      type="checkbox"
                      checked={subscribed}
                      onChange={e => setSubscribed(e.target.checked)}
                      className="w-8 h-8 border-4 border-foreground rounded-lg bg-white checked:bg-accent appearance-none cursor-pointer relative checked:after:content-['✓'] after:absolute after:inset-0 after:flex after:items-center after:justify-center after:text-foreground after:font-black"
                    />
                    <a
                      href="https://www.youtube.com/channel/UCH85rcaMHgCtN2fV8W_51LQ"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-black text-xs uppercase underline tracking-widest text-[#FF0000]"
                    >
                      Visit Channel
                    </a>
                  </div>
                </div>
                {subscribeError && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 text-secondary font-black text-xs text-center uppercase tracking-widest">
                    {subscribeError}
                  </motion.div>
                )}
              </div>

              <Button type="submit" variant="accent" className="w-full p-6 text-xl" disabled={submitting} icon={Send}>
                {submitting ? 'Transmitting...' : 'Register as Hero'}
              </Button>
            </form>
          </Card>
        </div>
      </Section>

      {/* Success Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 flex items-center justify-center bg-foreground/60 backdrop-blur-sm z-[200] p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="max-w-md w-full">
              <Card variant="featured" className="p-10 text-center">
                <div className="w-20 h-20 bg-secondary border-4 border-foreground rounded-full flex items-center justify-center shadow-pop mx-auto mb-6 animate-bounce">
                  <CheckCircle2 className="w-10 h-10 text-foreground" strokeWidth={3} />
                </div>
                <h2 className="text-3xl font-heading font-black text-foreground mb-4">Application Sent!</h2>
                <p className="text-mutedForeground font-bold mb-8">Our trustees are reviewing your heroic profile. We'll be in touch soon!</p>
                <Button variant="accent" className="w-full" onClick={handleOk}>Roger That!</Button>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default JoinUs; 
 