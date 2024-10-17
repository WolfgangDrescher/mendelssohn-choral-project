import { fileURLToPath } from 'node:url';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: '2024-04-03',
    devtools: { enabled: false },
    runtimeConfig: {
        humlibBaseUrl: 'http://humlib:3000',
    },
    app: {
        buildAssetsDir: '/build/',
        head: {
            meta: [
                { charset: 'utf-8' },
                { name: 'viewport', content: 'width=device-width, initial-scale=1' },
                { hid: 'robots', name: 'robots', content: process.env.DEPLOY_ENV === 'prod' ? 'all' : 'noindex' },
            ],
            link: [
                // { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg', sizes: 'any' },
            ],
        },
    },
    modules: [
        '@nuxt/ui',
        '@nuxt/fonts',
        '@nuxtjs/i18n',
        '@pinia/nuxt',
    ],
    i18n: {
        strategy: 'prefix_except_default',
        locales: [
            { code: 'de', language: 'de-DE', file: 'de.yaml', dir: 'ltr' },
        ],
        defaultLocale: 'de',
        langDir: 'locales/',
    },
    vite: {
        worker: {
            format: 'es',
        },
        optimizeDeps: {
            exclude: ['verovio'],
        },
    },
    nitro: {
        publicAssets: [
            {
                baseURL: 'kern/mendelssohn-choral-works',
                dir: fileURLToPath(new URL('./mendelssohn-choral-works/kern', import.meta.url)),
                maxAge: 3600,
            },
        ],
    },
});
