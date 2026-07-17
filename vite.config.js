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
        target: 'http://127.0.0.1:8000', // Points directly to your running Django server port
        changeOrigin: true,
        secure: false,
      }
    }
  },
});