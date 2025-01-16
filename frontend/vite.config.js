import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    fs: {
      allow: [
        './', // Allows access to the root project folder
        '../', // Allows access to one directory up (for `node_modules`)
      ],
    },
  },
});