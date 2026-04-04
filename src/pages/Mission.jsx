import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, HeartPulse, UserCheck, Users, Star, Quote } from 'lucide-react';
import Section from '../components/ui/Section';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const Mission = () => {
  const initiatives = [
    {
      title: 'Education that Empowers',
      description: 'We believe education is the most powerful weapon we can use to change the world. We ensure that children in slums receive access to basic learning tools.',
      icon: BookOpen,
      color: 'bg-accent'
    },
    {
      title: 'Health with Dignity',
      description: 'Health is a right. We organize medical aid drives, rehabilitation programs, and distribute mobility aids like crutches and wheelchairs.',
      icon: HeartPulse,
      color: 'bg-secondary'
    },
    {
      title: 'Caring for the Forgotten',
      description: 'We ensure our seniors are respected and cared for through warm meals, monthly ration kits, and genuine companionship.',
      icon: UserCheck,
      color: 'bg-tertiary'
    },
    {
      title: 'Empowering Communities',
      description: 'Building self-reliant communities through skill-building programs and inclusive events. We work with communities, not just for them.',
      icon: Users,
      color: 'bg-quaternary'
    },
  ];

  const stats = [
    { value: '70+', label: 'Donors' },
    { value: '52+', label: 'Volunteers' },
    { value: '2022', label: 'Founded' },
    { value: '1000+', label: 'Impacted' },
  ];

  return (
    <div className="bg-background">
      {/* Hero Mission Statement */}
      <Section 
        title="Empowering Lives, One Step at a Time" 
        subtitle="Our Mission"
        className="pt-32"
      >
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <p className="text-xl text-mutedForeground font-body leading-relaxed">
            Founded in 2022 in Moradabad, Path Sarthi Trust began with a single belief: <br/>
            <span className="text-foreground font-bold italic text-2xl mt-4 block">
              "Every life deserves a chance to dream, to heal, and to rise."
            </span>
          </p>
          
          {/* Upcoming Mission Sticker */}
          <motion.div
            initial={{ rotate: 2, scale: 0.9, opacity: 0 }}
            whileInView={{ rotate: -1, scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            className="my-12"
          >
            <Card variant="featured" className="p-8 md:p-12 relative overflow-hidden group">
              {/* Decorative Circle */}
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-tertiary/10 rounded-full group-hover:scale-110 transition-transform" />
              
              <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
                <div className="flex-shrink-0">
                  <div className="w-48 h-48 rounded-blob border-4 border-foreground overflow-hidden shadow-pop rotate-3 group-hover:rotate-0 transition-transform">
                    <img src="/child.jpg" alt="Mission" className="w-full h-full object-cover" />
                  </div>
                </div>
                
                <div className="flex-grow text-center md:text-left space-y-4">
                  <div className="inline-block px-4 py-1 bg-tertiary border-2 border-foreground rounded-full text-xs font-black uppercase tracking-widest">Upcoming Campaign</div>
                  <h2 className="text-3xl md:text-4xl font-heading font-black text-foreground">एक किताब, एक भविष्य</h2>
                  <p className="text-lg font-bold text-mutedForeground">
                    आपकी दी हुई एक किताब, किसी बच्चे का भविष्य बना सकती है। <br/>
                    <span className="text-secondary italic">"अब मेरी भी किताब है, अब मेरा भी सपना है…"</span>
                  </p>
                  <Button variant="primary" onClick={() => window.location.href = '/donate'}>सहयोग करें</Button>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </Section>

      {/* Stats Section */}
      <Section variant="muted" pattern={false}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, idx) => (
            <Card key={idx} variant="flat" className="text-center group">
              <div className="text-4xl font-heading font-black text-accent mb-1 group-hover:scale-110 transition-transform">{stat.value}</div>
              <div className="text-sm font-bold uppercase tracking-widest text-mutedForeground">{stat.label}</div>
            </Card>
          ))}
        </div>
      </Section>

      {/* Initiatives Grid */}
      <Section title="Our Heartfelt Initiatives" subtitle="Focus Areas">
        <div className="grid md:grid-cols-2 gap-8">
          {initiatives.map((item, idx) => (
            <Card key={idx} className="group overflow-hidden">
              <div className="flex gap-6 items-start">
                <div className={`${item.color} p-4 rounded-xl border-2 border-foreground shadow-pop group-hover:-rotate-6 transition-transform flex-shrink-0`}>
                  <item.icon className="w-8 h-8 text-foreground" strokeWidth={2.5} />
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-heading font-bold text-foreground">{item.title}</h3>
                  <p className="text-mutedForeground font-body leading-relaxed">{item.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Section>

      {/* Movement of Hope */}
      <Section variant="accent" pattern={false} className="text-white">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <Quote className="w-16 h-16 mx-auto opacity-20" />
          <h2 className="text-4xl md:text-5xl font-heading font-black">A Movement of Hope</h2>
          <p className="text-xl opacity-90 font-medium italic">
            "We don't need to change the whole world at once — we just need to change someone's world every day."
          </p>
          <div className="h-1 w-20 bg-tertiary mx-auto rounded-full" />
          <p className="text-lg opacity-80 max-w-2xl mx-auto">
            Path Sarthi is more than an organization — it's a family of change-makers including 70+ donors and 52+ volunteers powered by compassion.
          </p>
          <Button variant="secondary" className="border-white text-white hover:bg-white hover:text-accent">Join the Movement</Button>
        </div>
      </Section>
    </div>
  );
};

export default Mission; 
 