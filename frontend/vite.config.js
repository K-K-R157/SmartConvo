// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
// })


import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      'localhost',
      '192.168.255.199', // your local IP
      '2b1e-2409-40e4-204c-6b53-5095-4436-2744-1ca6.ngrok-free.app', // your ngrok domain
    ],
  },
});