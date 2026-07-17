import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    // Add the proxy configuration block here
    proxy: {
      '/api': {
        target: 'https://gana.work.gd', // Points directly to your running Django server port
        changeOrigin: true,
        secure: false,
      }
    }
  },
});