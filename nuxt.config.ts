// https://nuxt.com/docs/api/configuration/nuxt-config
import path from "path";
import { ElForm, ElFormItem, ElInput } from "element-plus";

export default defineNuxtConfig({
    alias: {
        "@": path.resolve(__dirname),
    },

    ssr: false,

    app: {
        head: {
            link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" }],
        },
    },

    css: ["~/assets/css/element-plus.css", "~/assets/css/main.css"],

    runtimeConfig: {
        public: {
            apiBase: process.env.API_BASE_URL,
            privacy_policy: process.env.PRIVACY_POLICY_URL,
            modern_slavery: process.env.MODERN_SLAVERY_URL,
            default_user_link: process.env.DEFAULT_USER_LINK,
            pdf_img_link: process.env.PDF_IMAGE_LINK,
            csv_img_link: process.env.CSV_IMAGE_LINK,
            xlsx_img_link: process.env.XLSX_IMAGE_LINK,
            doc_img_link: process.env.DOC_IMAGE_LINK,
            google_place_api_key: process.env.GOOGLE_PLACE_API_KEY,
            stripe_publish_key: process.env.STRIPE_PUBLISH_KEY,
        },
    },

    plugins: [{ src: "~/plugins/partical", mode: "client" }],

    modules: [
        "@element-plus/nuxt",
        "@nuxtjs/i18n",
        "@pinia/nuxt",
        "@nuxtjs/tailwindcss",
        "@pinia-plugin-persistedstate/nuxt",
        "@nuxtjs/device",
        "@nuxt/image",
    ],

    image: { 
        domains: [process.env.FRONTEND_URL],
    },

    i18n: {
        // vueI18n: './config/i18n.ts', // if you are using custom path, default ,
        locales: [
            {
                code: "en",
                file: "en.json",
            },
            {
                code: "es",
                file: "es.json",
            },
            {
                code: "pt",
                file: "pt.json",
            },
        ],
        lazy: true,
        langDir: "locales",
        defaultLocale: "en",
        detectBrowserLanguage: {
            useCookie: true,
            cookieKey: "i18n_redirected",
            redirectOn: "root", // recommended
        },
    },

    spaLoadingTemplate: false,

    elementPlus: {
        importStyle: false,
    },

    // generate: {
    //     routes: [
    //         "/",
    //         "/super-admin",
    //         "/super-admin/add-super-user",
    //         "/super-admin/edit-super-user/1",
    //         "/profile",
    //         "/dashboard",
    //         "/contact-us",
    //     ],
    // },

    //   postcss: {
    //     plugins: {
    //       tailwindcss: {},
    //       autoprefixer: {},
    //       'postcss-import': {},
    //     'tailwindcss/nesting': {}
    //     },
    //   },
});
