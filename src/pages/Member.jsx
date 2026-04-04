import React, { useState } from 'react';
import { Search, Filter, User, MapPin, Globe } from 'lucide-react';
import Section from '../components/ui/Section';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const members = [
  { name: 'Sameer Sharma', gender: 'Male', district: 'Moradabad', state: 'Uttar Pradesh', image: '/Sameer Sharma.jpg' },
  { name: 'Pawan Thakur', gender: 'Male', district: 'Moradabad', state: 'Uttar Pradesh' },
  { name: 'Amrit Agrawal', gender: 'Male', district: 'Moradabad', state: 'Uttar Pradesh' },
  { name: 'Vikas Mathur', gender: 'Male', district: 'Moradabad', state: 'Uttar Pradesh' },
  { name: 'Bhag Singh', gender: 'Male', district: 'Bijnor', state: 'Uttar Pradesh', designation: 'Member', joinedDate: '2023-01-01', image: '/Bhag Singh.jpg' },
  { name: 'Neeraj Gupta', gender: 'Male', district: 'Bareilly', state: 'Uttar Pradesh', designation: 'Member', joinedDate: '2023-01-01' },
  { name: 'Neeraj Chaturvedi', gender: 'Male', district: 'Moradabad', state: 'Uttar Pradesh', designation: 'Member', joinedDate: '2023-01-01' },
  { name: 'Sanjeev Rastogi', gender: 'Male', district: 'Moradabad', state: 'Uttar Pradesh', designation: 'Member', joinedDate: '2023-01-01', image: '/Sanjeev Rastogi.jpg' },
  { name: 'Jatadhari Rai', gender: 'Male', district: 'Jaunpur', state: 'Uttar Pradesh' },
  { name: 'Manoj Sinha', gender: 'Male', district: 'Noida', state: 'Uttar Pradesh' },
  { name: 'Shailendra Singh', gender: 'Male', district: 'Chandausi', state: 'Uttar Pradesh' },
  { name: 'Gaurav Kathuriya', gender: 'Male', district: 'Delhi', state: 'Delhi' },
  { name: 'Sanjay Rai', gender: 'Male', district: 'Ghaziabad', state: 'Uttar Pradesh', image: '/Sanjay rai.jpg' },
  { name: 'Sanjay Rai', gender: 'Male', district: 'Mumbai', state: 'Maharashtra' },
  { name: 'Pradeep Rai', gender: 'Male', district: 'Azamgarh', state: 'Uttar Pradesh' },
  { name: 'Navneet Kumar Saxena', gender: 'Male', district: 'Rampur', state: 'Uttar Pradesh' },
  { name: 'Rajendra Prasad Singh', gender: 'Male', district: 'Varanasi', state: 'Uttar Pradesh' },
  { name: 'Madan Singh Negi', gender: 'Male', district: 'Noida', state: 'Uttar Pradesh' },
  { name: 'Nathi Singh Bartwal', gender: 'Male', district: 'Noida', state: 'Uttar Pradesh' },
  { name: 'Yashu Sharma', gender: 'Male', district: 'Guna', state: 'Madhya Pradesh' },
  { name: 'Anil Kumar Sharma', gender: 'Male', district: 'Guna', state: 'Madhya Pradesh' },
  { name: 'Rajendra Kumar Dhingra', gender: 'Male', district: 'Moradabad', state: 'Uttar Pradesh' },
  { name: 'Kailash Chandra Sharma', gender: 'Male', district: 'Moradabad', state: 'Uttar Pradesh' },
  { name: 'Parminder Sharma', gender: 'Male', district: 'Ludhiana', state: 'Punjab' },
  { name: 'Amit Kumar Shukla', gender: 'Male', district: 'Barielly', state: 'Uttar Pradesh', image: '/amit kumar.jpg' },
  { name: 'Varun', gender: 'Male', district: 'Barielly', state: 'Uttar Pradesh', image: '/varun.jpg' },
  { name: 'Pradeep Kumar', gender: 'Male', district: 'Barielly', state: 'Uttar Pradesh', image: '/pradeep.jpg' },
  { name: 'Sachin Mittal', gender: 'Male', district: 'Moradabad', state: 'Uttar Pradesh', image: '/sachin mittal.jpg' },
  { name: 'Anil Kumar Gupta', gender: 'Male', district: 'Moradabad', state: 'Uttar Pradesh', image: '/Anil.jpg' },
  { name: 'Ayush Kumar Singh', gender: 'Male', district: 'Moradabad', state: 'Uttar Pradesh', image: '/Ayush.jpg' },
  { name: 'Seema Singh', gender: 'Female', district: 'Moradabad', state: 'Uttar Pradesh', image: '/Seema Singh.jpg' },
];

const sortedMembers = [...members].sort((a, b) => a.name.localeCompare(b.name));

const getInitials = (name) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

const Member = () => {
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedState, setSelectedState] = useState('');

  const districts = Array.from(new Set(members.map(m => m.district))).sort();
  const states = Array.from(new Set(members.map(m => m.state))).sort();

  const filteredMembers = sortedMembers.filter(m => {
    return (selectedDistrict ? m.district === selectedDistrict : true) &&
           (selectedState ? m.state === selectedState : true);
  });

  return (
    <div className="bg-background">
      <Section title="Our Global Member Network" subtitle="The Community" className="pt-32">
        {/* Filters */}
        <div className="max-w-4xl mx-auto mb-16 space-y-6">
          <div className="flex flex-wrap items-center justify-center gap-4">
             <div className="flex items-center gap-2 bg-white border-4 border-foreground rounded-2xl px-4 py-2 shadow-pop">
                <Filter className="w-5 h-5 text-accent" />
                <span className="font-heading font-black text-xs uppercase tracking-widest text-mutedForeground">Filter By</span>
             </div>
             
             <select
                value={selectedDistrict}
                onChange={e => setSelectedDistrict(e.target.value)}
                className="bg-white border-4 border-foreground rounded-2xl px-6 py-3 font-heading font-black text-sm outline-none cursor-pointer focus:ring-4 focus:ring-accent/20"
              >
                <option value="">All Districts</option>
                {districts.map(d => <option key={d} value={d}>{d}</option>)}
              </select>

              <select
                value={selectedState}
                onChange={e => setSelectedState(e.target.value)}
                className="bg-white border-4 border-foreground rounded-2xl px-6 py-3 font-heading font-black text-sm outline-none cursor-pointer focus:ring-4 focus:ring-accent/20"
              >
                <option value="">All States</option>
                {states.map(s => <option key={s} value={s}>{s}</option>)}
              </select>

              {(selectedDistrict || selectedState) && (
                <Button 
                  variant="secondary" 
                  className="px-6 py-3 text-sm"
                  onClick={() => { setSelectedDistrict(''); setSelectedState(''); }}
                >
                  Clear All
                </Button>
              )}
          </div>
        </div>

        {/* Member Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {filteredMembers.map((member, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="group"
            >
              <Card variant="default" className="h-full p-6 text-center hover:-translate-y-2 transition-transform">
                <div className="relative inline-block mb-6 pt-2">
                  <div className="absolute inset-0 bg-accent translate-x-2 translate-y-2 rounded-2xl -z-10 group-hover:rotate-6 transition-transform" />
                  <div className="w-24 h-24 bg-white border-4 border-foreground rounded-2xl overflow-hidden shadow-pop group-hover:-rotate-3 transition-transform">
                    {member.image ? (
                      <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className={`w-full h-full flex items-center justify-center font-heading font-black text-2xl text-white ${member.gender === 'Female' ? 'bg-secondary' : 'bg-accent'}`}>
                        {getInitials(member.name)}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-heading font-black text-foreground leading-tight">{member.name}</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2 text-mutedForeground font-bold text-xs uppercase tracking-widest">
                       <MapPin className="w-3 h-3 text-accent" />
                       {member.district}
                    </div>
                    <div className="flex items-center justify-center gap-2 text-mutedForeground font-bold text-xs uppercase tracking-widest">
                       <Globe className="w-3 h-3 text-secondary" />
                       {member.state}
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t-2 border-foreground/5">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border-2 border-foreground ${member.gender === 'Female' ? 'bg-secondary/10 text-secondary' : 'bg-accent/10 text-accent'}`}>
                    Active Member
                  </span>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredMembers.length === 0 && (
          <div className="text-center py-20">
             <div className="inline-block p-10 bg-white border-4 border-dashed border-foreground/20 rounded-3xl">
                <Search className="w-16 h-16 text-mutedForeground/20 mx-auto mb-4" />
                <p className="font-heading font-black text-foreground">No members found in this region.</p>
                <Button className="mt-6" onClick={() => { setSelectedDistrict(''); setSelectedState(''); }}>Reset Filters</Button>
             </div>
          </div>
        )}
      </Section>
    </div>
  );
};

export default Member; 
 