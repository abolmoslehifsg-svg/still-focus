import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  // Relative assets work both under the GitHub Pages subpath and in Electron.
  base: './',
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
  },
})
