import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const serverRoute = env.VITE_SERVER_ROUTE;

  return {
    plugins: [
      react(),
      tailwindcss()
    ],
    define: {
      'import.meta.env.VITE_USER_API_URL': JSON.stringify(`${serverRoute}/alumniConnect`),
      'import.meta.env.VITE_ADMIN_API_URL': JSON.stringify(`${serverRoute}/alumniConnect/admin-portal`),
      'import.meta.env.VITE_DEVELOPER_API_URL': JSON.stringify(`${serverRoute}/alumniConnect/developer-portal`),
      'import.meta.env.VITE_DEVELOPER_ROUTE': JSON.stringify('/developer-portal'),
      'import.meta.env.VITE_ADMIN_ROUTE': JSON.stringify('/admin-portal'),
    },
    ssr: {
      noExternal: [/@syncfusion/]
    },
    build: {
      sourcemap: true
    },
    server: {
      port: 5175,
    },
  };
})
