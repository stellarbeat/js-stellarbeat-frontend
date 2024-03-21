import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue2';
import topLevelAwait from "vite-plugin-top-level-await";

export default defineConfig({
    plugins: [vue(), topLevelAwait()],
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
    }
})