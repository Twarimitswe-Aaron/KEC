import React, { useState } from "react";
import {
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaWrench,
  FaClock,
} from "react-icons/fa";
import styles from "../../../Styles/styles.js";

const servicesData = [
  {
    name: "Material Repairs",
    icon: <FaWrench />,
    image:
      "https://images.unsplash.com/photo-1603901622056-0a5bee231395?w=500&auto=format&fit=crop&q=60",
  },
  {
    name: "Maintenance & Servicing",
    icon: <FaWrench />,
    image:
      "https://images.unsplash.com/photo-1603901622056-0a5bee231395?w=500&auto=format&fit=crop&q=60",
  },
  {
    name: "Product Upgrades",
    icon: <FaWrench />,
    image:
      "https://images.unsplash.com/photo-1603901622056-0a5bee231395?w=500&auto=format&fit=crop&q=60",
  },
  {
    name: "Custom Installations",
    icon: <FaWrench />,
    image:
      "https://images.unsplash.com/photo-1603901622056-0a5bee231395?w=500&auto=format&fit=crop&q=60",
  },
];

const contactData = [
  { name: "+250 788 123 456", icon: <FaPhoneAlt /> },
  { name: "support@yourelearning.com", icon: <FaEnvelope /> },
  { name: "Kigali, Rwanda", icon: <FaMapMarkerAlt /> },
];

const hoursData = [
  { name: "Mon - Fri: 8:00 AM - 6:00 PM", icon: <FaClock /> },
  { name: "Sat: 9:00 AM - 2:00 PM", icon: <FaClock /> },
  { name: "Sun: Closed", icon: <FaClock /> },
];

// Default image URL (show this when nothing hovered)
const defaultImage =
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=60";

const OtherBusinesses: React.FC = () => {
  const [activeImage, setActiveImage] = useState<string>(defaultImage);

  return (
    <section className={styles.parent_section} id="others">
      <div className={styles.section}>
        <div className="flex w-full justify-center items-center">
          <h1 className="font-bold sm:text-3xl text-[22px] mb-6 sm:mb-14 mt-10">
            Other Businesses
          </h1>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left side: All info */}
          <div
            className=" md:h-[26rem]  "
            onMouseLeave={() => setActiveImage(defaultImage)}
          >
            {/* What We Offer */}

            {/* Contact Us */}
            <div className="h-[50%] ">
              <h2 className="text-2xl font-bold border-b-2 border-[#022F40] pb-2 mb-4">
                Contact Us
              </h2>
              <ul className="space-y-3">
                {contactData.map((contact, index) => (
                  <li key={index} className="flex items-center gap-3">
                    {contact.icon} {contact.name}
                  </li>
                ))}
              </ul>
            </div>

            {/* Working Hours & CTA */}
            <div className="h-[50%]">
              <div>
                <h2 className="text-2xl font-bold border-b-2 border-[#022F40] pb-2 mb-4">
                  What We Offer
                </h2>
                <ul className="space-y-3">
                  {servicesData.map((service, index) => (
                    <li
                      key={index}
                      className="flex items-center gap-3 cursor-pointer hover:text-[#022F40] transition-colors"
                      onMouseEnter={() => setActiveImage(service.image)}
                    >
                      {service.icon} {service.name}
                    </li>
                  ))}
                </ul>
              </div>
              <button className="mt-6 md:block hidden w-full bg-[#022F40] hover:bg-[#022F40] text-white font-semibold py-2 px-4 rounded-lg transition-all">
                Request Service
              </button>
            </div>
          </div>

          {/* Right side: Image */}
          <div className="flex flex-col gap-3 md:h-[26rem]  justify-between items-start">
            <div className="md:h-[20%] w-full">
              <h2 className="text-2xl font-bold border-b-2 border-[#022F40] pb-2 mb-4">
                Working Hours
              </h2>
              <ul className="space-y-3">
                {hoursData.map((hours, index) => (
                  <li key={index} className="flex items-center gap-3">
                    {hours.icon} {hours.name}
                  </li>
                ))}
              </ul>
              <div className="mt-6 md:hidden block w-full">
                <button className="w-full bg-[#022F40] hover:bg-[#022F40] text-white font-semibold py-2 px-4 rounded-lg transition-all">
                  Request Service
                </button>
              </div>
            </div>

            <div className="md:h-[50%] w-full">
              <img
                src={activeImage}
                alt="Service"
                className="rounded-lg shadow-lg max-w-full h-auto md:h-[250px] w-full md:w-[500px]  object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OtherBusinesses;
