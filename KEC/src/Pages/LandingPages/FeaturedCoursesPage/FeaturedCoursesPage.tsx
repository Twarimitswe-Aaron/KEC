import React from 'react';
import styles from "../../../Styles/styles.js";
import CourseCarousel from './Coursecard';

const FeaturedCoursesPage = () => {
  return (
    <div className={`${styles.parent_section} font-roboto`} id='featuredCourses'>

      <div className={`${styles.section} py-20`}>
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[rgb(21,22,25)] text-white rounded-full mb-4">
            <span className="text-[rgb(255,71,38)] text-xs">//</span>
            <span className="text-xs font-medium">Courses</span>
            <span className="text-[rgb(255,71,38)] text-xs">//</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-[rgb(21,22,25)] max-w-2xl leading-tight">
              Explore Our <span className="text-[rgb(79,79,79)]">Top Courses</span>
            </h2>
            <p className="font-sans font-semibold text-[1.2rem] leading-[1.2em] tracking-[-0.05em] text-[#151619] max-w-md">
              We combine strategy, speed, and skill to deliver exceptional education — every time.
            </p>
          </div>
        </div>
        <div className="block justify-around overflow-hidden">
          <CourseCarousel />

        </div>
      </div>

    </div>
  );
};

export default FeaturedCoursesPage;
