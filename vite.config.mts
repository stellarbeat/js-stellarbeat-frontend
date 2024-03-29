import {defineConfig} from 'vite';
import vue from '@vitejs/plugin-vue2';
import topLevelAwait from "vite-plugin-top-level-await";
import eslint from 'vite-plugin-eslint';

export default defineConfig({
    plugins: [vue(), eslint(), topLevelAwait()],
    envPrefix: 'VUE_',
    worker: {
        plugins: () => [
            topLevelAwait()],
    },
    resolve: {
        alias: {
            '@': '/src',
        },
        extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json'],
    },
    define: {
        'process.env': process.env,
    },
    build: {
        sourcemap: true,
        chunkSizeWarningLimit: 1000,
        rollupOptions: {
            output: {
                manualChunks: {
                    d3: [
                        'd3-force',
                        'd3-shape',
                        'd3-selection',
                        'd3-zoom',
                        'd3-polygon',
                        "d3-drag",
                    ],
                    jquery: [
                        'jquery',
                    ],
                    vue: [
                        'vue',
                        'vue-router',
                        'vue-multiselect',
                        'portal-vue',
                    ],
                    sentry: [
                        '@sentry/vue',
                    ]
                }
            }
        }
    },
    css: {
        devSourcemap: true,
    },
})