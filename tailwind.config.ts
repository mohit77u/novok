/** @type {import('tailwindcss').Config} */
const colors = require("tailwindcss/colors");
module.exports = {
    mode: "jit",
    content: [
        "./components/**/*.{js,vue,ts}",
        "./layouts/**/*.vue",
        "./pages/**/*.vue",
        "./plugins/**/*.{js,ts}",
        "./nuxt.config.{js,ts}",
        "./app.vue",
        "./assets/**/*.scss",
        "./assets/**/*.css",
    ],
    variants: { 
        width: ["responsive", "hover", "focus"] 
    },
    theme: {
        screens: {
            sm: "576px",
            md: "768px",
            lg: "992px",
            xl: "1200px",
            "2xl": "1440px",
            "3xl": "1536px",
        },

        extend: {
            content: {
                search: '<svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" data-v-ea893728=""><path fill="currentColor" d="m795.904 750.72 124.992 124.928a32 32 0 0 1-45.248 45.248L750.656 795.904a416 416 0 1 1 45.248-45.248zM480 832a352 352 0 1 0 0-704 352 352 0 0 0 0 704z"></path></svg>',
            },
            colors: {
                white: "#ffffff",
                dark: "#545152",
                primary: {
                    DEFAULT: "#9353A2",
                    dark: "#9353A2",
                },
                cyan: "#545152",
                info: "#1294A8",
                success: "#008000",
                warning: "#FBBF24",
                danger: "#ee6666",
                sourcing: "#008000",
                selection: "#008080",
                signing: "#3f51b5",
                supervision: "#b5693f",
                onHold: "#ffa500",
                newProject: "purple",
                blue: "#3f51b5",
                grey: "#545152cc",
                amber: "#ff8e28",
                teal: "#1294a8",
                gray: {
                    50: "rgba(84, 81, 82, 0.05)",
                    100: "rgba(84, 81, 82, 0.10)",
                    200: "rgba(84, 81, 82, 0.20)",
                    300: "rgba(84, 81, 82, 0.30)",
                    400: "rgba(84, 81, 82, 0.40)",
                    500: "rgba(84, 81, 82, 0.50)",
                    600: "rgba(84, 81, 82, 0.60)",
                    700: "rgba(84, 81, 82, 0.70)",
                    800: "rgba(84, 81, 82, 0.80)",
                    900: "rgba(84, 81, 82, 0.90)",
                },
            },
            fontFamily: {
                calibri: ["Calibri", "Arial", "sans-serif"],
            },
        },
    },
    plugins: ["tailwindcss ,autoprefixer, tailwindcss/nesting, postcss-import"],
};
