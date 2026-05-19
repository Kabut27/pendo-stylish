import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@contracts": path.resolve(__dirname, "./contracts"),
      "@db": path.resolve(__dirname, "./db"),
      "@api": path.resolve(__dirname, "./api"),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom', 'react-router'],
          'trpc': ['@trpc/client', '@trpc/server', '@trpc/tanstack-react-query', '@tanstack/react-query'],
          'ui': ['@radix-ui/react-dialog', '@radix-ui/react-tabs', '@radix-ui/react-select', 'recharts'],
        }
      }
    }
  },
});
