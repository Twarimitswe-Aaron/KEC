import React from 'react';
import styles from "../../Styles/styles";
import CourseCarousel from './Coursecard.js';

const FeaturedCoursesPage = () => {
  return (
    <div className={`${styles.parent_section} font-roboto`}> 

      <div className={`${styles.section}`}>
        <div className="flex justify-center">
          <h1 className="full sm:text-3xl text-[22px] mt-4 font-bold">
            Featured courses
          </h1>
        </div>
        <div className="flex justify-around overflow-hidden">
          <CourseCarousel />
        </div>
      </div>
      
    </div>
  );
};

export default FeaturedCoursesPage;
