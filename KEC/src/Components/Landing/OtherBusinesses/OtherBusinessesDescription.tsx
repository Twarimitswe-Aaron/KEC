import { Clock, Phone, Wrench, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

export default function OtherBusinessesDescription() {
  const CONTACT_NUMBERS = {
    techfix: "+250 788 456 789",
    proinstall: "+250 788 678 901"
  };

  const partners = [
    {
      id: 1,
      name: "TechFix Solutions",
      specialty: "Equipment Repair & Maintenance",
      phone: CONTACT_NUMBERS.techfix,
      location: "Gasabo District",
      services: ["Emergency Repair", "Preventive Maintenance", "Parts Replacement"],
      image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop",
      icon: Wrench
    },
    {
      id: 2,
      name: "ProInstall Masters",
      specialty: "Equipment Installation",
      phone: CONTACT_NUMBERS.proinstall,
      location: "Nyarugenge District",
      services: ["New Installations", "Equipment Relocation", "System Integration"],
      image: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400&h=300&fit=crop",
      icon: Settings
    }
  ];

  return (
    <section id="assistance" className="w-[95%] max-w-[1440px] mx-auto border-x border-gray-200">
      <div className="w-[94%] mx-auto max-w-[1440px] py-20">

        {/* Header Section matches WhyUs style */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-16 px-2">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#151619] text-white rounded-full mb-6">
              <span className="text-[#FF3700] font-medium">//</span>
              <span className="text-sm font-medium tracking-wide">Partner Services</span>
              <span className="text-[#FF3700] font-medium">//</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#151619] tracking-tight leading-[1.1]">
              Professional equipment <br /> <span className="text-gray-500">services & support</span>
            </h2>
          </div>
          <p className="font-sans font-semibold text-[1.2rem] leading-[1.2em] tracking-[-0.05em] text-[#151619] max-w-sm">
            Verified partners delivering exceptional repair, installation, and maintenance solutions.
          </p>
        </div>

        {/* Layout: Left Sidebar (Working Hours) + Right Grid (Partners) */}
        <div className="grid grid-cols-1 lg:grid-cols-[30%_1fr] gap-[7px]">

          {/* Left Column: Working Hours Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative bg-[#151619] rounded-[24px] p-8 text-white flex flex-col justify-between overflow-hidden shadow-lg h-full min-h-[400px]"
          >
            {/* Background Gradient Effect */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF3700] rounded-full mix-blend-screen filter blur-[100px] opacity-[0.05] pointer-events-none" />

            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-[#FF3700]/10 border border-[#FF3700]/20 rounded-xl flex items-center justify-center">
                  <Clock className="text-[#FF3700]" size={24} />
                </div>
                <h3 className="text-2xl font-bold tracking-tight text-white">Working Hours</h3>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center bg-white/5 border border-white/5 rounded-xl p-4">
                  <span className="text-white/60 font-medium tracking-tight">Mon - Fri</span>
                  <span className="text-[#FF3700] font-bold tracking-wide">07:00 - 17:00</span>
                </div>
                <div className="flex justify-between items-center bg-white/5 border border-white/5 rounded-xl p-4">
                  <span className="text-white/60 font-medium tracking-tight">Weekends</span>
                  <span className="text-white/40 font-bold tracking-wide">Closed</span>
                </div>
              </div>
            </div>

            <div className="relative z-10 mt-8 pt-8 border-t border-white/10">
              <p className="text-sm text-white/40 font-medium leading-relaxed">
                Our partners are available during these hours for standard inquiries. Emergency support may vary by provider.
              </p>
            </div>
          </motion.div>


          {/* Right Column: Partners Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 bg-[#e5e5e5] rounded-[24px] gap-[5px] p-[5px]">
            {partners.map((partner, idx) => {
              const Icon = partner.icon;
              return (
                <motion.div
                  key={partner.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-[#F0F0F0] rounded-[20px] overflow-hidden flex flex-col shadow-sm group relative"
                >
                  {/* Image Area */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={partner.image}
                      alt={partner.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />

                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2.5 shadow-lg z-10">
                      <Icon size={20} className="text-[#151619]" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-2xl font-bold text-[#151619] tracking-tight mb-1">{partner.name}</h3>
                    <p className="font-sans font-semibold text-[1.1rem] leading-[1.2em] tracking-[-0.05em] text-[#FF3700] mb-5">{partner.specialty}</p>

                    <div className="space-y-2 mb-6 flex-grow">
                      {partner.services.map((service, sIdx) => (
                        <div key={sIdx} className="flex items-center gap-2 font-medium text-sm text-[#151619]/70 tracking-tight">
                          <div className="w-1 h-1 rounded-full bg-[#151619]/40" />
                          {service}
                        </div>
                      ))}
                    </div>



                    <motion.a
                      href={`tel:${partner.phone}`}
                      initial="initial"
                      whileHover="hovered"
                      // Removed distinct color hover, kept subtle opacity/bg change if desired or just removed it.
                      // User said "color hover remove it", so I will strictly remove the color flip.
                      className="flex items-center justify-center gap-2 w-full bg-[#151619]/5 border border-[#151619]/5 text-[#151619] py-3 px-5 rounded-full font-bold text-sm tracking-wide transition-all duration-300 hover:bg-[#151619]/10 group/btn"
                    >
                      <Phone size={16} className="group-hover/btn:rotate-12 transition-transform duration-300" />
                      <div className="relative overflow-hidden h-[1.3em] flex flex-col justify-start items-center">
                        <motion.span
                          variants={{
                            initial: { y: 0 },
                            hovered: { y: "-100%" }
                          }}
                          transition={{ duration: 0.3, ease: [0.33, 1, 0.68, 1] }}
                          className="block"
                        >
                          {partner.phone}
                        </motion.span>
                        <motion.span
                          variants={{
                            initial: { y: "100%" },
                            hovered: { y: 0 }
                          }}
                          transition={{ duration: 0.3, ease: [0.33, 1, 0.68, 1] }}
                          className="absolute inset-0 block"
                        >
                          {partner.phone}
                        </motion.span>
                      </div>
                    </motion.a>
                  </div>
                </motion.div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
}