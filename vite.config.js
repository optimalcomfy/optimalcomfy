import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: [
                'resources/js/app.jsx',
                'resources/css/app.css', 
                'node_modules/primeicons/primeicons.css', 
                'node_modules/primereact/resources/themes/lara-light-indigo/theme.css',
                'node_modules/primereact/resources/primereact.min.css',
                'node_modules/primeflex/primeflex.css'
            ],
            refresh: true,
        }),
        react(),
    ],
});