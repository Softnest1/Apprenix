import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    cacheDir: '/tmp/vite_apprenix_v3',
    plugins: [
      react(),
      svgr({
        svgrOptions: {
          icon: true,
          exportType: "named",
          namedExport: "ReactComponent",
        },
      }),
      VitePWA({
        registerType: 'prompt',
        injectRegister: 'auto',
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff2,woff,ttf}'],
          additionalManifestEntries: [
            { url: '/offline.html', revision: '4' },
            { url: '/manifest.json', revision: '9' },
          ],
          maximumFileSizeToCacheInBytes: 8 * 1024 * 1024,
          navigateFallback: '/index.html',
          navigateFallbackDenylist: [
            /^\/rest\//,
            /^\/auth\//,
            /^\/storage\//,
            /^\/functions\//,
            /supabase\.co/,
            /\.supabase\./,
            /\/api\//,
            /\/__/,
          ],
          offlineGoogleAnalytics: false,
          runtimeCaching: [
            {
              urlPattern: /https:\/\/.*\.supabase\.co\/.*/i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'supabase-data-cache',
                networkTimeoutSeconds: 3,
                expiration: {
                  maxEntries: 500,
                  maxAgeSeconds: 60 * 60 * 24 * 7,
                },
                cacheableResponse: { statuses: [0, 200] },
                matchOptions: { ignoreVary: true },
              },
            },
            {
              urlPattern: /https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
            {
              urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|avif)(\?.*)?$/i,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'images-cache',
                expiration: { maxEntries: 300, maxAgeSeconds: 60 * 60 * 24 * 60 },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
            {
              urlPattern: /https:\/\/(?!.*supabase).*\.(json|xml)(\?.*)?$/i,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'static-api-cache',
                expiration: { maxEntries: 80, maxAgeSeconds: 60 * 60 * 24 * 14 },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
            {
              urlPattern: /https:\/\/(cdn\.jsdelivr\.net|unpkg\.com)\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'external-cdn-cache',
                expiration: { maxEntries: 40, maxAgeSeconds: 60 * 60 * 24 * 90 },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
          ],
        },
        manifest: false,
        devOptions: {
          enabled: false,
        },
      }),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    define: {
      'import.meta.env.VITE_SUPABASE_URL':
        JSON.stringify(env.VITE_SUPABASE_URL ?? ''),
      'import.meta.env.VITE_SUPABASE_ANON_KEY':
        JSON.stringify(env.VITE_SUPABASE_ANON_KEY ?? ''),
      'import.meta.env.VITE_APP_ID':
        JSON.stringify(env.VITE_APP_ID ?? ''),
    },
    build: {
      target: ["es2020", "edge88", "firefox78", "chrome87", "safari14"],
      chunkSizeWarningLimit: 600,
      sourcemap: false,
      cssCodeSplit: true,
      reportCompressedSize: false,
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            if (id.includes("node_modules/react/") || id.includes("node_modules/react-dom/"))
              return "vendor-react";
            if (id.includes("node_modules/react-router"))
              return "vendor-router";
            if (id.includes("node_modules/lucide-react"))
              return "vendor-icons";
            if (id.includes("node_modules/@radix-ui"))
              return "vendor-radix";
            if (id.includes("node_modules/recharts") || id.includes("node_modules/d3-"))
              return "vendor-charts";
            if (id.includes("node_modules/@supabase"))
              return "vendor-supabase";
            if (id.includes("node_modules/"))
              return "vendor-misc";
          },
        },
      },
    },
    optimizeDeps: {
      force: true,
      include: [
        "react",
        "react-dom",
        "react-router-dom",
        "lucide-react",
        "@radix-ui/react-dialog",
        "@radix-ui/react-select",
        "@radix-ui/react-tabs",
      ],
    },
  };
});
