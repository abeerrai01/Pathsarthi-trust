import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShieldCheck, BookOpen, GraduationCap, Building, Zap, Sparkles, QrCode, CheckCircle2 } from 'lucide-react';
import Section from '../components/ui/Section';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import PaymentModal from '../components/PaymentModal';
import GooglePayManualFlow from '../components/GooglePayManualFlow';

const Donate = () => {
  const [selectedAmount, setSelectedAmount] = useState('500');
  const [customAmount, setCustomAmount] = useState('');
  const [name, setName] = useState('');
  const [thankYou, setThankYou] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);

  const donationAmounts = [
    { value: '500', label: '₹500' },
    { value: '1000', label: '₹1,000' },
    { value: '2500', label: '₹2,500' },
    { value: '5000', label: '₹5,000' },
  ];

  const impactMetrics = [
    {
      amount: '₹500',
      description: 'Educational materials for one child',
      icon: BookOpen,
      color: 'bg-accent'
    },
    {
      amount: '₹1,000',
      description: 'Healthcare checkup for a family',
      icon: Heart,
      color: 'bg-secondary'
    },
    {
      amount: '₹2,500',
      description: 'Skill development for one woman',
      icon: Zap,
      color: 'bg-tertiary'
    },
    {
      amount: '₹5,000',
      description: 'Monthly community project funding',
      icon: Building,
      color: 'bg-quaternary'
    },
  ];

  const getAmount = () => customAmount ? Number(customAmount) : Number(selectedAmount);

  return (
    <div className="bg-background">
      <Section title="Support Our Heroic Cause" subtitle="Donate" className="pt-32">
        <div className="max-w-7xl mx-auto space-y-12">
          {!thankYou ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              {/* Donation Form */}
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <Card variant="featured" className="p-8 md:p-10">
                  <h2 className="text-2xl font-heading font-black text-foreground mb-8 text-center uppercase tracking-tighter">Choose Your Impact</h2>
                  
                  <div className="space-y-8">
                    {/* Name Input */}
                    <div className="space-y-2">
                      <label className="text-sm font-black uppercase tracking-widest text-mutedForeground">Your Name (Optional)</label>
                      <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Hero Helper"
                        className="w-full bg-white border-4 border-foreground rounded-xl p-4 font-bold text-lg focus:ring-4 focus:ring-accent/20 transition-all outline-none"
                      />
                    </div>

                    {/* Amount Grid */}
                    <div className="space-y-4">
                      <label className="text-sm font-black uppercase tracking-widest text-mutedForeground">Quick Select</label>
                      <div className="grid grid-cols-2 gap-4">
                        {donationAmounts.map((amount) => (
                          <button
                            key={amount.value}
                            onClick={() => { setSelectedAmount(amount.value); setCustomAmount(''); }}
                            className={`py-4 px-6 rounded-2xl border-4 text-xl font-heading font-black transition-all shadow-pop active:translate-y-1 active:shadow-none ${
                              selectedAmount === amount.value
                                ? 'bg-accent border-foreground text-foreground -translate-y-1'
                                : 'bg-white border-foreground/10 text-mutedForeground hover:border-foreground/40'
                            }`}
                          >
                            {amount.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Custom Amount */}
                    <div className="space-y-2">
                       <label className="text-sm font-black uppercase tracking-widest text-mutedForeground">Custom Amount</label>
                      <div className="relative">
                        <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-foreground">₹</span>
                        <input
                          type="number"
                          value={customAmount}
                          onChange={e => { setCustomAmount(e.target.value); setSelectedAmount(''); }}
                          placeholder="Your choice"
                          className="w-full bg-white border-4 border-foreground rounded-xl pl-12 pr-6 py-4 font-black text-xl focus:ring-4 focus:ring-accent/20 transition-all outline-none"
                        />
                      </div>
                    </div>

                    {/* Payment Buttons */}
                    <div className="pt-4 space-y-4">
                      <GooglePayManualFlow amount={getAmount()} />
                      <Button 
                        variant="accent" 
                        className="w-full p-6 text-xl" 
                        icon={QrCode}
                        onClick={() => setShowQRModal(true)}
                      >
                        Fast Checkout (QR/UPI)
                      </Button>
                      <p className="text-center text-xs font-bold text-mutedForeground uppercase tracking-widest">
                        Zero Processing Fees • 100% Tax Exempt (80G)
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* Impact Visualization */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                <h2 className="text-3xl font-heading font-black text-foreground mb-6">See Your Magic in Action</h2>
                <div className="grid sm:grid-cols-2 gap-6">
                  {impactMetrics.map((metric, idx) => (
                    <Card key={idx} variant="default" className="group border-none bg-white/50 backdrop-blur-md">
                      <div className={`${metric.color} w-12 h-12 rounded-xl border-2 border-foreground flex items-center justify-center mb-4 shadow-pop group-hover:rotate-12 transition-transform`}>
                        <metric.icon className="w-6 h-6 text-foreground" />
                      </div>
                      <div className="text-2xl font-heading font-black text-foreground mb-1">{metric.amount}</div>
                      <p className="text-sm font-bold text-mutedForeground leading-tight">{metric.description}</p>
                    </Card>
                  ))}
                </div>

                <Card variant="flat" className="border-accent bg-accent/5 p-8 mt-8">
                   <div className="flex items-start gap-4">
                      <div className="bg-white border-2 border-foreground p-3 rounded-full shadow-pop">
                        <ShieldCheck className="w-6 h-6 text-accent" />
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-xl font-heading font-black text-foreground">100% Secure & Honest</h4>
                        <p className="text-sm text-mutedForeground leading-relaxed">
                          We are registered with **Niti Aayog Darpan** and follow strict transparency guidelines. 
                          You will receive a digital receipt instantly.
                        </p>
                      </div>
                   </div>
                </Card>
                
                <div className="text-center p-8 bg-tertiary/10 rounded-3xl border-2 border-dashed border-foreground/20 italic font-bold text-foreground">
                  "Giving is not just about making a donation. It's about making a difference."
                </div>
              </motion.div>
            </div>
          ) : (
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
              <Card variant="featured" className="max-w-2xl mx-auto text-center p-12 overflow-hidden relative">
                <Sparkles className="absolute top-8 left-8 w-12 h-12 text-tertiary animate-pulse" />
                <Sparkles className="absolute bottom-8 right-8 w-10 h-10 text-accent animate-pulse" />
                
                <div className="mb-8 relative inline-block">
                  <div className="w-24 h-24 bg-secondary border-4 border-foreground rounded-full flex items-center justify-center shadow-pop animate-bounce">
                    <CheckCircle2 className="w-12 h-12 text-foreground" strokeWidth={3} />
                  </div>
                </div>

                <h2 className="text-4xl md:text-5xl font-heading font-black text-foreground mb-4">You are a Rockstar, {name || 'Donor'}! 🙏</h2>
                <p className="text-xl text-mutedForeground font-body mb-8">
                  Your kindness has been registered in the universe (and our hearts). 
                  Together, we are shaping the future of Moradabad's children.
                </p>
                
                <div className="p-8 bg-background rounded-2xl border-2 border-foreground font-black text-foreground tracking-widest uppercase text-sm space-y-2">
                  <p>Certificate Incoming to Your Email</p>
                  <p className="text-accent underline">Follow our impact @pathsarthi</p>
                </div>
                
                <Button className="mt-10" onClick={() => setThankYou(false)}>Return Home</Button>
              </Card>
            </motion.div>
          )}
        </div>
      </Section>

      <PaymentModal open={showQRModal} onClose={() => setShowQRModal(false)}>
        <div className="flex flex-col items-center p-4">
          <div className="relative group">
            <div className="absolute inset-0 bg-accent translate-x-3 translate-y-3 rounded-2xl -z-10 bg-dots" />
            <img src="/Qr-code-3.jpg" alt="QR Code" className="h-64 w-64 object-contain rounded-2xl border-4 border-foreground" />
          </div>
          
          <div className="mt-10 space-y-4 w-full">
            <div className="bg-white border-2 border-foreground rounded-xl p-4 shadow-pop flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-mutedForeground uppercase tracking-widest">UPI ID</p>
                <p className="font-heading font-black text-foreground">8958421200m@pnb</p>
              </div>
              <Button variant="secondary" className="px-3 py-1 text-xs">Copy</Button>
            </div>
            
             <div className="bg-white border-2 border-foreground rounded-xl p-4 shadow-pop flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-mutedForeground uppercase tracking-widest">Mobile Number</p>
                <p className="font-heading font-black text-foreground">8958421200</p>
              </div>
              <Button variant="secondary" className="px-3 py-1 text-xs">Copy</Button>
            </div>
          </div>

          <div className="mt-10 p-6 bg-tertiary/10 rounded-2xl border-2 border-dashed border-foreground/40 text-sm font-bold text-foreground">
            1. Scan QR with GPay/PhonePe/Paytm <br/>
            2. Enter Donation Amount <br/>
            3. Hero Status Achieved!
          </div>
        </div>
      </PaymentModal>
    </div>
  );
};

export default Donate;