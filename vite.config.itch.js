import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Itch.io specific config - uses relative paths
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'itch-build/dist'
  }
})


