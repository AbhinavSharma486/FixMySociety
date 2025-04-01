// tailwind.config.js (ES Module version)
import { defineConfig } from "tailwindcss";
import daisyui from 'daisyui';

/** @type {import('tailwindcss').Config} */
export default defineConfig({
  content: [
    './pages/**/*.{html,js}',
    './components/**/*.{html,js}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [daisyui],
  daisyui: {
    themes: ["light", "dark"],
    darkTheme: "dark",
  }
});
