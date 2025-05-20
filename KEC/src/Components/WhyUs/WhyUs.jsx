import React from "react";
import WhyUsPage from "../../Pages/WhyUsPage/WhyUsPage.jsx";
import styles from "../../Styles/styles.js";

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
