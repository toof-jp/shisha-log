import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    server: {
        port: 3000,
        host: true,
        https: {
            key: fs.readFileSync(path.resolve(__dirname, 'certs/key.pem')),
            cert: fs.readFileSync(path.resolve(__dirname, 'certs/cert.pem')),
        },
    },
});
