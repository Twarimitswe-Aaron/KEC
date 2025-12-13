import { useEffect } from "react";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import { useGetTeamMembersQuery } from "../../../state/api/userApi";
import { FaLinkedinIn, FaInstagram, FaTwitter } from "react-icons/fa"; // Importing icons for social links

const TeamMemberCard = ({ member }: { member: any }) => {
  return (
    <div className="relative w-full aspect-[4/5] rounded-[24px] overflow-hidden group">
      {/* Background Image */}
      <img
        src={member.avatar || "/images/placeholder.jpg"} // Fallback image
        alt={member.name}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
      />

      {/* Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90" />

      {/* Content Overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col gap-4">

        {/* Name and Title */}
        <div>
          <h4 className="text-white text-2xl font-bold tracking-tight mb-1">{member.name}</h4>
          <p className="text-gray-300 text-sm font-medium uppercase tracking-wide">{member.title}</p>
        </div>

        {/* Social Icons (Mocked for now as likely not in member object yet) */}
        <div className="flex items-center gap-2">
          <a href="#" className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-colors">
            <FaTwitter size={14} />
          </a>
          <a href="#" className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-colors">
            <FaLinkedinIn size={14} />
          </a>
          <a href="#" className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-colors">
            <FaInstagram size={14} />
          </a>
        </div>
      </div>
    </div>
  );
};

const CoreTeamPage = () => {
  const { data: teamMembers = [], isLoading } = useGetTeamMembersQuery();

  const [sliderRef, instanceRef] = useKeenSlider({
    loop: teamMembers.length > 3,
    mode: "snap",
    renderMode: "performance",
    slides: {
      origin: "auto",
      spacing: 20, // Increased spacing
      perView: "auto", // Or set specific like 1.2, 2.5 etc if needed
    },
  });

  useEffect(() => {
    if (teamMembers.length <= 3) return;
    const interval = setInterval(() => {
      instanceRef.current?.next();
    }, 5000);
    return () => clearInterval(interval);
  }, [instanceRef, teamMembers.length]);

  if (isLoading) {
    return (
      <div className="w-full py-20 px-4" id="coreTeam">
        <div className="max-w-[1400px] mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-10 text-[#151619]">Core Team</h1>
          <p className="text-gray-600">Loading team members...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-20 px-4" id="coreTeam">
      <div className="max-w-[1400px] mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-12 text-[#151619]">Core Team</h1>

        {teamMembers.length === 0 ? (
          <p className="text-gray-600">No team members found.</p>
        ) : teamMembers.length <= 3 ? (
          // Grid layout for few members
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {teamMembers.map((member) => (
              <TeamMemberCard key={member.id} member={member} />
            ))}
          </div>
        ) : (
          // Slider for many members
          <div ref={sliderRef} className="keen-slider">
            {teamMembers.map((member) => (
              <div key={member.id} className="keen-slider__slide !min-w-[280px] !max-w-[320px] sm:!min-w-[320px]">
                <TeamMemberCard member={member} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CoreTeamPage;
