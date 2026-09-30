import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  // Serve from the GitHub Pages subpath: <user>.github.io/still-focus/
  base: '/still-focus/',
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
  },
})
