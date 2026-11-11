import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    const proxy = { '/api': { target: env.API_GATEWAY_PROXY_TARGET || 'http://localhost:8066', changeOrigin: true } };
    return { plugins: [react(), tailwindcss()], server: { proxy }, preview: { proxy } };
});
