import { Config } from 'tailwindcss';
import lineClamp from '@tailwindcss/line-clamp';

const config: Config = {
  theme: {
    extend: {
      screens: {
        sm: '640px', // Small screens
        md: '768px', // Medium screens
        lg: '1024px', // Large screens
        '1027px': '1027px', // Custom breakpoint for minimum width
        '1067px': { max: '1067px' }, // Custom breakpoint for maximum width
      },
      fontFamily: {
        roboto: ['Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [lineClamp],
};

export default config;