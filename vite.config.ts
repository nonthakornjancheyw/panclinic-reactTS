import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  base: '/panclinic-reactTS/',
  plugins: [react()],
  server: {
    hmr: {
      path: '/panclinic-reactTS/ws',
    }
  }
})
