import { defineConfig, loadEnv } from 'vite'
import path from "path"
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa';
import Sitemap from 'vite-plugin-sitemap'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        workbox: {
          globPatterns: [
            '**/*.{js,jsx,css,html,ico,png,jpg,jpeg,webp,svg,woff,woff2,ttf,eot,xml,txt}']
        }
      }),
      Sitemap({ 
        hostname: 'https://mstream.site',
        dynamicRoutes: [
          '/movies?sort_by=popularity.desc&include_adult=false&include_video=false&language=en-US&page=1',
          '/tv-shows?sort_by=popularity.desc&include_adult=false&include_null_first_air_dates=false&language=en-US&page=1',
          '/popular?include_adult=false&include_video=false&language=en-US&page=1',
          '/watch?type=movie&id=1523145',
          '/watch?type=movie&id=1197137',
          '/watch?type=movie&id=1114967',
          '/watch?type=movie&id=1571470',
          '/watch?type=movie&id=617126'
        ],
        robots: [
          {
            userAgent: '*',
            allow: '/',
            disallow: '/api/',
            crawlDelay: 2,
          },
        ]
      }),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./"),
      },
    },
    build: {
      target: "es2022",
      outDir: "dist",
      assetsDir: "assets",
    },
    server: {
      proxy: {
        '/api': {
          target: 'https://api.themoviedb.org/3',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
          configure: (proxy, options) => {
            proxy.on('proxyReq', (proxyReq, req, res) => {
              if (env.VITE_TMDB_READ_ACCESS_TOKEN) {
                proxyReq.setHeader('Accept', 'application/json');
                proxyReq.setHeader('Authorization', `Bearer ${env.VITE_TMDB_READ_ACCESS_TOKEN}`);
              }
            });
          }
        }
      }
    }
  }
})
