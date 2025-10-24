import React, { useState } from 'react';
import { Clock, Phone, MapPin, Wrench, Settings, Package } from 'lucide-react';

export default function OtherBusinessesDescription() {
  const [hoveredCard, setHoveredCard] = useState(null);

  // Contact numbers defined in one place
  const CONTACT_NUMBERS = {
    techfix: "+250 788 456 789",
    proinstall: "+250 788 678 901",
    spareparts: "+250 788 789 012"
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
    },
    {
      id: 3,
      name: "SparePartsPro",
      specialty: "Equipment Parts & Supplies",
      phone: CONTACT_NUMBERS.spareparts,
      location: "Multiple Locations",
      services: ["Parts Supply", "Same-Day Delivery", "Technical Consultation"],
      image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&h=300&fit=crop",
      icon: Package
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Clean Hero */}
      <div className="bg-[#022F40] py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Partner Services</h1>
          <p className="text-lg text-gray-300 mb-8">
            Professional equipment services when you need them
          </p>

          {/* Working Hours */}
          <div className="inline-block bg-white rounded-lg p-6 shadow-lg">
            <div className="flex items-center gap-3 justify-center mb-4">
              <Clock className="text-[#022F40]" size={24} />
              <h3 className="text-xl font-bold text-gray-900">Working Hours</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between gap-8">
                <span className="text-gray-600 font-medium">Monday - Friday:</span>
                <span className="text-gray-900 font-bold">07:00 - 17:00</span>
              </div>
              <div className="flex justify-between gap-8">
                <span className="text-gray-600 font-medium">Weekends:</span>
                <span className="text-gray-900 font-bold">Closed</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Partners Grid */}
      <div className="max-w-6xl mx-auto py-16 px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {partners.map((partner) => {
            const Icon = partner.icon;
            return (
              <div
                key={partner.id}
                onMouseEnter={() => setHoveredCard(null)}
                onMouseLeave={() => setHoveredCard(null)}
                className={`bg-white rounded-lg border border-gray-200 overflow-hidden transition-all duration-300 ${
                  hoveredCard === partner.id 
                    ? 'shadow-xl transform -translate-y-1' 
                    : 'shadow-md'
                }`}
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={partner.image} 
                    alt={partner.name}
                    className={`w-full h-full object-cover transition-transform duration-500 ${
                      hoveredCard === partner.id ? 'scale-110' : 'scale-100'
                    }`}
                  />
                  <div className="absolute inset-0 bg-[#022F40] opacity-40"></div>
                  
                  <div className="absolute top-4 right-4 bg-white rounded-full p-3 shadow-lg">
                    <Icon size={24} className="text-[#022F40]" />
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{partner.name}</h3>
                  <p className="text-sm text-gray-600 mb-4">{partner.specialty}</p>

                  {/* Services */}
                  <div className="space-y-2 mb-5">
                    {partner.services.map((service, idx) => (
                      <div key={idx} className="text-sm text-gray-700">
                        • {service}
                      </div>
                    ))}
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-2 mb-5 pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2">
                      <Phone className="text-gray-600" size={16} />
                      <span className="text-sm font-semibold text-gray-900">{partner.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="text-gray-600" size={16} />
                      <span className="text-sm text-gray-700">{partner.location}</span>
                    </div>
                  </div>

                  {/* Call Button */}
                  <a
                    href={`tel:${partner.phone}`}
                    className="block w-full bg-[#022F40] text-white py-3 rounded-lg font-semibold text-center hover:opacity-90 transition"
                  >
                    Call Now
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 border-t border-gray-200 py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Need Equipment Service?</h2>
          <p className="text-gray-600">
            Contact our trusted partners for repairs, installations, and maintenance
          </p>
        </div>
      </div>
    </div>
  );
}