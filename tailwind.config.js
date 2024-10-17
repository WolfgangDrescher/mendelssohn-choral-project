import { sky } from 'tailwindcss/colors';
import { fontFamily } from 'tailwindcss/defaultTheme';

/** @type {import('tailwindcss').Config} */
export default {
    theme: {
        extend: {
            colors: {
                primary: sky,
            },
            fontFamily: {
                ...fontFamily,
                serif: ['Alegreya', 'serif'],
                sans: ['Alegreya Sans', 'sans-serif'],
            },
        },
        container: {
            center: true,
            padding: {
                DEFAULT: '1rem',
                sm: '2rem',
                md: '3rem',
                lg: '4rem',
                xl: '5rem',
                '2xl': '6rem',
            },
        },
    },
};
