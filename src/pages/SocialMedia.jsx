import React from 'react';
import { motion } from 'framer-motion';
import { Youtube, Instagram, Facebook, Linkedin, ExternalLink, Play, Heart } from 'lucide-react';
import Section from '../components/ui/Section';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const SocialMedia = () => {
  const socialLinks = [
    {
      platform: 'YouTube',
      url: 'https://www.youtube.com/channel/UCH85rcaMHgCtN2fV8W_51LQ',
      icon: Youtube,
      color: 'bg-[#FF0000]',
      description: 'Impact Stories & Documentaries',
      stats: '1K+ Subs'
    },
    {
      platform: 'Instagram',
      url: 'https://www.instagram.com/pathsarthi2022/?utm_medium=copy_link',
      icon: Instagram,
      color: 'bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]',
      description: 'Daily Updates & Behind the Scenes',
      stats: '2K+ Followers'
    },
    {
      platform: 'Facebook',
      url: 'https://www.facebook.com/pathsarthi#',
      icon: Facebook,
      color: 'bg-[#1877F2]',
      description: 'Community News & Discussions',
      stats: '5K+ reach'
    },
    {
      platform: 'LinkedIn',
      url: 'https://www.linkedin.com/company/path-sarthi-trust',
      icon: Linkedin,
      color: 'bg-[#0A66C2]',
      description: 'Professional Network & Partnerships',
      stats: 'B2B Connect'
    },
  ];

  return (
    <div className="bg-background">
      <Section title="Connect With the Movement" subtitle="Social Pulse" className="pt-32">
        {/* Social Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20 max-w-7xl mx-auto">
          {socialLinks.map((social, index) => (
            <motion.a
              key={social.platform}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              whileHover={{ y: -8 }}
              viewport={{ once: true }}
              className="block"
            >
              <Card variant="default" className="h-full p-8 text-center group cursor-pointer border-foreground/10 hover:border-foreground">
                <div className="relative mb-6 inline-block">
                   <div className={`absolute inset-0 ${social.color} blur-2xl opacity-20 group-hover:opacity-40 transition-opacity rounded-full`} />
                   <div className={`w-16 h-16 ${social.color} border-2 border-foreground rounded-2xl flex items-center justify-center shadow-pop transform group-hover:rotate-12 transition-transform relative z-10`}>
                      <social.icon className="w-8 h-8 text-white" />
                   </div>
                </div>
                
                <h3 className="text-xl font-heading font-black text-foreground mb-2">{social.platform}</h3>
                <p className="text-xs font-bold text-mutedForeground uppercase tracking-widest mb-4">{social.description}</p>
                
                <div className="mt-auto pt-4 flex items-center justify-center gap-2">
                   <span className="text-[10px] font-black bg-foreground/5 px-2 py-1 rounded-md text-foreground">
                      {social.stats}
                   </span>
                   <ExternalLink className="w-3 h-3 text-mutedForeground" />
                </div>
              </Card>
            </motion.a>
          ))}
        </div>

        {/* Media Spotlight */}
        <div className="max-w-6xl mx-auto space-y-20">
          {/* YouTube Spotlight */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-6">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-accent border-2 border-foreground rounded-lg flex items-center justify-center shadow-pop">
                    <Play className="w-5 h-5 text-foreground" />
                 </div>
                 <h2 className="text-3xl font-heading font-black text-foreground">Watch Our Impact</h2>
              </div>
              <p className="text-lg text-mutedForeground font-bold leading-relaxed">
                Dive deep into the stories of change. Our YouTube channel features documentaries of our field missions, volunteer experiences, and educational content.
              </p>
              <Button variant="accent" icon={Youtube} onClick={() => window.open(socialLinks[0].url)}>Subscribe Now</Button>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="relative group">
              <div className="absolute inset-0 bg-secondary translate-x-4 translate-y-4 rounded-[2rem] -z-10 bg-dots opacity-20" />
              <div className="aspect-video bg-white border-4 border-foreground rounded-[2rem] overflow-hidden shadow-pop-lg relative">
                <iframe
                  src="https://www.youtube.com/embed/videoseries?list=UCH85rcaMHgCtN2fV8W_51LQ"
                  title="Path Sarthi Trust YouTube Channel"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                ></iframe>
              </div>
            </motion.div>
          </div>

          {/* Instagram Spotlight */}
          <Card variant="featured" className="p-10 md:p-16 flex flex-col items-center text-center space-y-8 bg-gradient-to-br from-white to-pink-50/50">
             <div className="w-20 h-20 bg-secondary border-4 border-foreground rounded-[2rem] flex items-center justify-center shadow-pop animate-bounce">
                <Heart className="w-10 h-10 text-foreground" fill="currentColor" />
             </div>
             <div className="max-w-2xl space-y-4">
                <h2 className="text-4xl font-heading font-black text-foreground">Stay in the Loop</h2>
                <p className="text-xl font-bold text-mutedForeground">
                  Get daily doses of hope, volunteer calls, and real-time updates from our ground missions. 
                  Our Instagram is where the heart of Path Sarthi beats.
                </p>
             </div>
             <Button 
                variant="secondary" 
                className="px-10 py-5 text-lg" 
                icon={Instagram}
                onClick={() => window.open(socialLinks[1].url)}
              >
                Follow @pathsarthi
             </Button>
          </Card>
        </div>
      </Section>
    </div>
  );
};

export default SocialMedia; 
 