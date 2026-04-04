import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Calendar, Zap, ShieldCheck, Award, Wallet, Building2, Landmark, Heart, Info } from 'lucide-react';
import Section from '../components/ui/Section';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const AboutUs = () => {
  const boardMembers = [
    { name: 'Shri Ravi Prakash Rai', role: 'President' },
    { name: 'Shri Rupesh Kumar Chauhan', role: 'Vice President' },
    { name: 'Shri Om Prakash Rai', role: 'Treasurer' },
    { name: 'Shri Arun Kumar Singh', role: 'Secretary' },
    { name: 'Shri Satya Prakash Rai', role: 'Financial Advisor' },
    { name: 'Shri Priyansh Rai', role: 'Vice Secretary' },
    { name: 'Shri Abeer Rai', role: 'Board Member' },
  ];

  const organizationStats = [
    { label: 'Board Members', value: '7', icon: Users, color: 'bg-accent' },
    { label: 'Employees', value: '8', icon: Building2, color: 'bg-secondary' },
    { label: 'Volunteers', value: '52+', icon: Heart, color: 'bg-tertiary' },
    { label: 'Advisors', value: '6', icon: Info, color: 'bg-quaternary' },
    { label: 'Donors', value: '70+', icon: Zap, color: 'bg-pink-400' },
  ];

  const donorBenefits = [
    {
      title: 'Be Part of a Community',
      description: 'Connect with like-minded people and share thoughts, opinions, and ideas.',
      icon: Users,
    },
    {
      title: 'Access to Events',
      description: 'Get exclusive invites to curated weekend events hosted by our partners.',
      icon: Calendar,
    },
    {
      title: 'Join the Change Makers',
      description: 'Become a part of a movement led by others who believe in social good.',
      icon: Zap,
    },
    {
      title: 'Assurance & Transparency',
      description: 'Get regular updates on how your donation is impacting children.',
      icon: ShieldCheck,
    },
    {
      title: 'Membership Certificate',
      description: 'Receive an official welcome and certificate of gratitude.',
      icon: Award,
    },
    {
      title: 'Flexible Options',
      description: 'Pause, resume, or change your donation anytime with ease.',
      icon: Wallet,
    },
  ];

  return (
    <div className="bg-background">
      {/* Header Section */}
      <Section title="Inside Path Sarthi Trust" subtitle="Who We Are" className="pt-32">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Main Info Card */}
          <Card variant="default" className="p-10 relative overflow-visible">
            <div className="absolute -top-12 -left-8 w-24 h-24 bg-tertiary border-4 border-foreground rounded-full flex items-center justify-center shadow-pop rotate-12">
              <Building2 className="w-10 h-10 text-foreground" />
            </div>
            
            <div className="space-y-8 text-center md:text-left">
              <div className="space-y-2">
                <h2 className="text-2xl font-heading font-black text-foreground">Registered Office</h2>
                <p className="text-lg text-mutedForeground">
                  E-374-375, Kashiram Nagar, Moradabad, Uttar Pradesh, India – 244001
                </p>
              </div>

              <div className="p-6 bg-muted/50 rounded-xl border-2 border-dashed border-foreground/20">
                <h3 className="text-xl font-heading font-bold text-accent mb-3 flex items-center gap-2">
                  <Landmark className="w-5 h-5" /> Official Registration
                </h3>
                <ul className="text-mutedForeground space-y-1 font-medium">
                  <li>Registered with Niti Aayog Darpan, Govt. of India</li>
                  <li>Registration ID: <span className="text-foreground font-bold">UP/2022/0317438</span></li>
                  <li>Indian Trust Act 1882 No. 68/2022</li>
                </ul>
              </div>

              <p className="text-xl leading-relaxed text-foreground font-medium">
                Path Sarthi is actively contributing to the well-being of children, elderly individuals, 
                and the underprivileged through structured programs in health and education.
              </p>
            </div>
          </Card>
        </div>
      </Section>

      {/* Vision & Mission */}
      <Section variant="muted" pattern={false}>
        <div className="grid md:grid-cols-2 gap-8">
          <Card className="border-accent shadow-pop-accent">
            <h2 className="text-3xl font-heading font-black text-accent mb-4">Our Vision</h2>
            <p className="text-lg text-mutedForeground leading-relaxed mb-6">
              To enhance the quality of life in education and health through collaboration. 
              We ensure continuous financial and emotional support for people with special needs.
            </p>
            <div className="p-4 bg-accent/5 border-l-4 border-accent italic text-accent font-bold">
              "Transforming lives in slums through education and skills."
            </div>
          </Card>
          <Card className="border-secondary shadow-pop-pink">
            <h2 className="text-3xl font-heading font-black text-secondary mb-4">Our Mission</h2>
            <p className="text-lg text-mutedForeground leading-relaxed">
              Create a better world through well-designed support programs that improve education, 
              healthcare, rehabilitation, and corrective surgeries — bringing real 
              change to those who need it most.
            </p>
          </Card>
        </div>
      </Section>

      {/* Organizational Structure */}
      <Section title="How We Are Structured" subtitle="The Pillars">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          {organizationStats.map((stat, idx) => (
            <Card key={idx} variant="flat" className="text-center group overflow-hidden">
               <div className={`w-12 h-12 ${stat.color} border-2 border-foreground rounded-full flex items-center justify-center mx-auto mb-4 group-hover:-rotate-12 transition-transform`}>
                <stat.icon className="w-6 h-6 text-foreground" />
              </div>
              <div className="text-3xl font-heading font-black text-foreground">{stat.value}</div>
              <div className="text-xs font-black uppercase tracking-widest text-mutedForeground">{stat.label}</div>
            </Card>
          ))}
        </div>
      </Section>

      {/* Board Members */}
      <Section title="The Board of Trustees" subtitle="Our Leaders" variant="tertiary">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {boardMembers.map((member, idx) => (
            <Card key={idx} variant="default" className="hover:bg-white/80 transition-colors">
              <h3 className="text-xl font-heading font-black text-foreground">{member.name}</h3>
              <p className="text-accent font-bold uppercase tracking-wider text-sm">{member.role}</p>
            </Card>
          ))}
        </div>
        <div className="mt-12 p-8 card-sticker bg-white text-center italic font-medium text-mutedForeground">
          "Trustees are nominated and selected to ensure the continuity of our visionary mission."
        </div>
      </Section>

      {/* Donor Family */}
      <Section title="Why Join Our Family?" subtitle="Get Involved">
        <div className="grid md:grid-cols-3 gap-8">
          {donorBenefits.map((benefit, idx) => (
            <Card key={idx} variant="default" className="group">
              <div className="bg-tertiary border-2 border-foreground w-12 h-12 rounded-lg flex items-center justify-center mb-6 shadow-pop group-hover:rotate-6 transition-transform">
                <benefit.icon className="w-6 h-6 text-foreground" strokeWidth={2.5} />
              </div>
              <h3 className="text-xl font-heading font-bold text-foreground mb-3">{benefit.title}</h3>
              <p className="text-mutedForeground font-body">{benefit.description}</p>
            </Card>
          ))}
        </div>
        
        <div className="mt-20 text-center space-y-10">
          <p className="text-3xl font-heading font-black text-foreground max-w-3xl mx-auto leading-tight">
            "Your support — no matter how big or small — is why children survive and thrive."
          </p>
          <div className="flex justify-center gap-6">
            <Link to="/donate">
              <Button variant="primary" icon={Heart}>Donate Now</Button>
            </Link>
            <Link to="/join-us">
              <Button variant="secondary">Join as Volunteer</Button>
            </Link>
          </div>
        </div>
      </Section>
    </div>
  );
};

export default AboutUs;