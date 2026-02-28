import { defineConfig } from 'vite';

export default defineConfig({
    base: '/goji-game/',
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    phaser: ['phaser'],
                },
            },
        },
        minify: 'terser',
    },
    server: {
        port: 8080,
    },
});
