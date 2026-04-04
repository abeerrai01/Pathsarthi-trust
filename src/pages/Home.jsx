import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ShieldCheck, Users, HandHelping, ArrowRight, Zap, Target, Star } from 'lucide-react';
import VisitorCounter from "../components/VisitorCounter";
import TributeModal from '../components/TributeModal';
import CSRSection from '../components/CSRSection';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Section from '../components/ui/Section';
import Marquee from '../components/ui/Marquee';

const Home = () => {
  const stats = [
    { label: 'Lives Impacted', value: '1000+', icon: Heart, color: 'bg-secondary' },
    { label: 'Projects Done', value: '50+', icon: Zap, color: 'bg-tertiary' },
    { label: 'Volunteers', value: '100+', icon: Users, color: 'bg-accent' },
    { label: 'Communities', value: '25+', icon: Target, color: 'bg-quaternary' },
    { label: 'Interns', value: '30+', icon: Star, color: 'bg-pink-400' },
  ];

  const initiatives = [
    {
      title: 'Child Welfare',
      description: 'We support vulnerable children by providing care, education, and opportunities for a brighter future.',
      image: '/ChildWelfare.jpg',
      color: 'accent'
    },
    {
      title: 'Education Support',
      description: 'Providing quality education and learning resources to underprivileged children.',
      image: '/Gunjan 2.jpg',
      color: 'tertiary'
    },
    {
      title: 'Healthcare Access',
      description: 'Facilitating medical care and health awareness in rural communities.',
      image: '/medical.jpg',
      color: 'quaternary'
    },
    {
      title: 'Women Empowerment',
      description: 'Supporting women through skill development and entrepreneurship programs.',
      image: '/IMG-20231223-WA0030 - Gunjan Gururani.jpg',
      color: 'secondary'
    },
  ];

  const counterRef = useRef(null);

  useEffect(() => {
    if (counterRef.current) counterRef.current.innerHTML = "";
    const poweredBy = document.createElement('a');
    poweredBy.href = 'https://www.free-counters.org/';
    poweredBy.textContent = 'powered by Free-Counters.org';
    poweredBy.target = '_blank';
    poweredBy.rel = 'noopener noreferrer';
    if (counterRef.current) counterRef.current.appendChild(poweredBy);
    const script1 = document.createElement('script');
    script1.type = 'text/javascript';
    script1.src = 'https://www.freevisitorcounters.com/auth.php?id=22bf731492fb17baa4745af20331c0fdd2467bf9';
    script1.async = true;
    if (counterRef.current) counterRef.current.appendChild(script1);
    const script2 = document.createElement('script');
    script2.type = 'text/javascript';
    script2.src = 'https://www.freevisitorcounters.com/en/home/counter/1353603/t/5';
    script2.async = true;
    if (counterRef.current) counterRef.current.appendChild(script2);
    return () => { if (counterRef.current) counterRef.current.innerHTML = ""; };
  }, []);

  const certificateImages = ['/Certificate 1.jpg', '/Certificate 2.jpg', '/Certificate 3.jpg'];
  const [currentCert, setCurrentCert] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentCert((prev) => (prev + 1) % certificateImages.length);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const supporters = [
    { name: "SNR Hotel", logo: "/SNR hotel.jpg" },
    { name: "Sachin Tube Company", logo: "/Sachin tube.jpg" },
    { name: "Rastogi Store", logo: null },
    { name: "RJS Associates", logo: null },
  ];

  const [currentSupporter, setCurrentSupporter] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSupporter((prev) => (prev + 1) % supporters.length);
    }, 1000);
    return () => clearInterval(interval);
  }, [supporters.length]);

  const [tributeOpen, setTributeOpen] = useState(false);
  const [tributeType, setTributeType] = useState('');

  return (
    <div className="bg-background min-h-screen">
      {/* Hero Section */}
      <Section className="min-h-[80vh] flex items-center pt-32" pattern={false}>
          {/* Wild Decorations */}
          <div className="absolute top-20 right-10 w-64 h-64 bg-tertiary rounded-full opacity-20 blur-3xl" />
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-accent rounded-full opacity-10 blur-3xl" />
          
          <div className="grid lg:grid-cols-2 gap-12 items-center relative z-10">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white border-2 border-foreground rounded-full shadow-pop text-sm font-bold text-accent">
                <Star className="w-4 h-4 fill-current" />
                <span>Transforming Lives in Moradabad</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-heading font-extrabold text-foreground leading-[1.1]">
                Empowering <br />
                <span className="text-accent underline decoration-tertiary decoration-Wavy">Communities</span> <br />
                Through Action
              </h1>
              
              <p className="text-xl text-mutedForeground font-body max-w-xl">
                Path Sarthi Trust is dedicated to fostering education, healthcare, and sustainable development. Join us in shaping a brighter, more equitable future for everyone.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Link to="/donate">
                  <Button variant="primary" icon={Heart}>Donate Now</Button>
                </Link>
                <Link to="/mission">
                  <Button variant="secondary">Our Mission</Button>
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="relative hidden lg:block"
            >
              {/* Image with Blob Mask */}
              <div className="relative z-10 w-full aspect-square border-4 border-foreground rounded-blob overflow-hidden shadow-pop-lg">
                <img src="/ub21.jpg" alt="Hero" className="w-full h-full object-cover" />
              </div>
              
              {/* Floating Element */}
              <motion.div 
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-6 -left-6 bg-secondary text-white p-6 rounded-xl border-2 border-foreground shadow-pop z-20"
              >
                <div className="font-heading font-bold text-2xl">5000+</div>
                <div className="text-sm font-medium opacity-90">Meals Served</div>
              </motion.div>
            </motion.div>
          </div>
      </Section>

      {/* Impact Stats */}
      <Section title="Our Remarkable Impact" subtitle="The Numbers" variant="muted">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          {stats.map((stat, idx) => (
            <Card key={idx} variant="flat" className="text-center group overflow-hidden">
              <div className={`w-12 h-12 ${stat.color} border-2 border-foreground rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-6 h-6 text-foreground" />
              </div>
              <div className="text-3xl font-heading font-extrabold text-foreground">{stat.value}</div>
              <div className="text-sm font-bold text-mutedForeground uppercase tracking-wider">{stat.label}</div>
            </Card>
          ))}
        </div>
      </Section>

      {/* Legitimacy Section */}
      <Section title="Proof of Trust" subtitle="Legitimacy">
        <div className="max-w-4xl mx-auto">
          <Card variant="featured" className="p-0 overflow-hidden relative">
            <div className="aspect-video bg-muted flex items-center justify-center p-8">
              <motion.img
                key={currentCert}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                src={certificateImages[currentCert]}
                alt="Certificate"
                className="max-h-full rounded-lg shadow-lg border-2 border-foreground"
              />
            </div>
            <div className="p-6 bg-white border-t-2 border-foreground flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold">Registered & Recognized</h3>
                <p className="text-mutedForeground">Providing transparency in every step.</p>
              </div>
              <div className="flex gap-2">
                {certificateImages.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentCert(i)}
                    className={`w-3 h-3 rounded-full border border-foreground ${currentCert === i ? 'bg-accent' : 'bg-white'}`}
                  />
                ))}
              </div>
            </div>
          </Card>
        </div>
      </Section>

      {/* Health Camp News */}
      <Section variant="tertiary" pattern={false} className="bg-opacity-10 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1">
            <div className="card-sticker p-2 rotate-2 hover:rotate-0 transition-transform">
              <img src="/news.jpg" alt="Health Camp" className="rounded-md" />
            </div>
          </div>
          <div className="flex-1 space-y-6">
            <div className="text-accent font-bold uppercase tracking-widest text-sm">Latest Update</div>
            <h2 className="text-4xl font-heading font-bold leading-tight">
              Free <span className="text-accent">Health Checkup</span> Camp in Moradabad
            </h2>
            <p className="text-lg text-mutedForeground">
              Collaborating with Ujala Cygnus Hospital, we provided free tests and consultations to hundreds of citizens, led by Chairman Adv. Ravi Prakash Rai.
            </p>
            <Link to="/about">
              <Button variant="secondary" icon={ArrowRight}>Read Full Story</Button>
            </Link>
          </div>
        </div>
      </Section>

      {/* Initiatives */}
      <Section title="Our Core Initiatives" subtitle="Focused Action">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {initiatives.map((item, idx) => (
            <Card 
              key={idx} 
              variant="default" 
              className="group p-0"
              onClick={() => {
                if (item.title === 'Women Empowerment') { setTributeType(''); setTributeOpen(true); }
                else if (item.title === 'Education Support') { setTributeType('education'); setTributeOpen(true); }
              }}
            >
              <div className="h-48 overflow-hidden">
                <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-sm text-mutedForeground mb-4 line-clamp-3">{item.description}</p>
                <div className={`text-xs font-bold uppercase tracking-widest text-${item.color}`}>Learn More →</div>
              </div>
            </Card>
          ))}
        </div>
        <TributeModal open={tributeOpen} onClose={() => setTributeOpen(false)} type={tributeType} />
      </Section>

      {/* Supporters Marquee */}
      <Section title="Our Trusted Partners" subtitle="Supporters" variant="muted">
        <Marquee 
          speed={40} 
          items={supporters.map((s, i) => (
            <div key={i} className="card-sticker px-10 py-6 min-w-[240px] flex flex-col items-center justify-center bg-white">
              {s.logo ? (
                <img src={s.logo} alt={s.name} className="h-16 w-auto object-contain mb-2 grayscale hover:grayscale-0 transition-all opacity-70 hover:opacity-100" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-foreground text-white flex items-center justify-center font-heading font-extrabold text-2xl mb-2">
                  {s.name.charAt(0)}
                </div>
              )}
              <span className="font-heading font-bold text-sm tracking-tight text-mutedForeground">{s.name}</span>
            </div>
          ))} 
        />
      </Section>

      {/* CSR & Video */}
      <CSRSection />
      
      <Section title="Meet our Leader" subtitle="Values">
        <div className="max-w-4xl mx-auto overflow-hidden rounded-xl border-4 border-foreground shadow-pop-lg">
          <iframe
            src="https://www.youtube.com/embed/upicFvhg1Qk"
            title="Video"
            className="w-full h-[450px]"
            allowFullScreen
          />
        </div>
      </Section>

      {/* Final CTA */}
      <Section variant="accent" pattern={false}>
        <div className="text-center space-y-8 py-10 relative">
          {/* Abstract Shapes */}
          <div className="absolute top-0 left-0 w-24 h-24 bg-tertiary rounded-lg rotate-12 -translate-x-12 -translate-y-12 opacity-50" />
          <div className="absolute bottom-0 right-0 w-24 h-24 bg-secondary rounded-full translate-x-12 translate-y-12 opacity-50" />
          
          <h2 className="text-5xl md:text-6xl font-heading font-extrabold text-white text-pop">
            Ready to <span className="text-tertiary">Make</span> a Difference?
          </h2>
          <p className="text-xl text-white/90 max-w-2xl mx-auto font-medium">
            Your support fuels our mission to uplift the underserved. Every contribution counts toward building a stronger nation.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <Link to="/donate">
              <Button variant="primary" className="bg-white text-foreground hover:bg-tertiary">Get Involved Now</Button>
            </Link>
            <Link to="/contribution">
              <Button variant="secondary" className="border-white text-white hover:bg-white hover:text-accent">Member Signup</Button>
            </Link>
          </div>
        </div>
      </Section>

      <VisitorCounter />
    </div>
  );
};

export default Home;