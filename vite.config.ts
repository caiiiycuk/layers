import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [preact()],
  build: {
    rollupOptions: {
      output: {
        entryFileNames: "layers.js",
        assetFileNames: (info) => {
          return info.name === "index.css" ? "layers.css" : info.name;
        },
      },
    },
  },
})
