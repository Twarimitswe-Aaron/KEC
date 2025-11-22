import { useEffect } from "react";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import { useGetTeamMembersQuery } from "../../../state/api/userApi";

const CoreTeamPage = () => {
  const { data: teamMembers = [], isLoading } = useGetTeamMembersQuery();

  const [sliderRef, instanceRef] = useKeenSlider({
    loop: teamMembers.length > 3, // Only loop if more than 3 members
    mode: "snap",
    renderMode: "performance",
    slides: {
      origin: "auto",
      spacing: 15,
      perView: "auto",
    },
  });

  useEffect(() => {
    // Only auto-slide if there are enough members to justify it
    if (teamMembers.length <= 3) return;

    const interval = setInterval(() => {
      instanceRef.current?.next();
    }, 5000);
    return () => clearInterval(interval);
  }, [instanceRef, teamMembers.length]);

  if (isLoading) {
    return (
      <div className="w-full" id="coreTeam">
        <div className="flex w-full justify-center mt-10 items-center">
          <h1 className="font-bold sm:text-3xl text-[22px] sm:mb-14 sm:mt-10">
            Core Team
          </h1>
        </div>
        <div className="flex justify-center items-center py-10">
          <p className="text-gray-600">Loading team members...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full" id="coreTeam">
      <div className="flex w-full justify-center mt-10 items-center">
        <h1 className="font-bold sm:text-3xl text-[22px] sm:mb-14 sm:mt-10">
          Core Team
        </h1>
      </div>

      {teamMembers.length === 0 ? (
        <div className="flex justify-center items-center py-10">
          <p className="text-gray-600">No team members found.</p>
        </div>
      ) : teamMembers.length <= 3 ? (
        // Display cards in a simple flex layout when few members
        <div className="flex justify-center items-center gap-4 px-4 flex-wrap">
          {teamMembers.map((member) => (
            <div
              key={member.id}
              className="w-[280px] shadow-[0_4px_4px_rgba(0,0,0,0.5)] p-7 rounded-md my-5 flex-shrink-0 justify-center items-center"
            >
              <img
                className="w-[219px] h-[210px] object-cover shadow-8lg mx-auto shadow-[0_4px_4px_rgba(0,0,0,0.5)] rounded-full circle"
                alt={member.name}
                src={member.avatar}
              />
              <div className="justify-center text-center items-center">
                <h3 className="mt-2 [font-family:'Inter',Helvetica] font-bold text-black text-2xl">
                  {member.name}
                </h3>
                <p className="mt-2 [font-family:'Inter',Helvetica] font-normal text-black text-[13px]">
                  {member.title}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Use slider when many members
        <div
          ref={sliderRef}
          className="keen-slider justify-evenly text-center items-center"
        >
          {teamMembers.map((member) => (
            <div
              key={member.id}
              className="keen-slider__slide !w-[280px] shadow-[0_4px_4px_rgba(0,0,0,0.5)] p-7 rounded-md my-5 flex-shrink-0 justify-center items-center"
            >
              <img
                className="w-[219px] h-[210px] object-cover shadow-8lg mx-auto shadow-[0_4px_4px_rgba(0,0,0,0.5)] rounded-full circle"
                alt={member.name}
                src={member.avatar}
              />
              <div className="justify-center text-center items-center">
                <h3 className="mt-2 [font-family:'Inter',Helvetica] font-bold text-black text-2xl">
                  {member.name}
                </h3>
                <p className="mt-2 [font-family:'Inter',Helvetica] font-normal text-black text-[13px]">
                  {member.title}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CoreTeamPage;
