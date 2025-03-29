// tailwind.config.js (ES Module version)
import { defineConfig } from "tailwindcss";

/** @type {import('tailwindcss').Config} */
export default defineConfig({
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"], // Ensure it scans all your files
  theme: {
    extend: {},
  },
  plugins: [],
});
