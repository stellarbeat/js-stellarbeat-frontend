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
        minify: false,
        chunkSizeWarningLimit: 1000,
    },
    optimizeDeps: {
        esbuildOptions: {

        }
    },
    css: {
        devSourcemap: true,
    },
})