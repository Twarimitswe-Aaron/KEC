import React from "react";
import WhyUsPage from "../../../Pages/LandingPages/WhyUsPage/WhyUsPage.js";
import styles from "../../../Styles/styles.js";

const WhyUs = () => {
  return (
    <div>
      <div className={styles.parent_section}>
        <div className={styles.section}>
          <WhyUsPage />
        </div>
      </div>
    </div>
  );
};

export default WhyUs;
