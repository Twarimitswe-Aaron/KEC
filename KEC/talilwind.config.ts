import { Config } from "tailwindcss";

const config: Config = {
  theme: {
    screens: {
      sm: "640px",
      md: "768px",
      lg: "1024px",
      cu: "1194px", 
      xl: "1280px",
      "2xl": "1536px",
    },
    extend: {
      fontFamily: {
        roboto: ["Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
