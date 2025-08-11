/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
	theme: {
		extend: {
			colors: {
				brand: { DEFAULT: "#7c9cff", 2: "#5ac4f8" },
			},
		},
	},
	plugins: [require("@tailwindcss/forms")],
};
