import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/api/tickets': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        bypass: (req) => {
          if (req.url && req.url.includes('/comments')) {
            return undefined; // Proxy to dotnet
          }
          if (req.url && req.url.includes('/attachments')) {
            return undefined; // Proxy to python
          }
        }
      },
      '/api/auth': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/api/dashboard': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/api/users': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/api/attachments': {
        target: 'http://localhost:8082',
        changeOrigin: true,
      }
    }
  }
});
