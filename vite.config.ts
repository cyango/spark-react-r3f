import os from "node:os";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import checker from "vite-plugin-checker";
import mkcert from "vite-plugin-mkcert";
// import { VitePWA } from 'vite-plugin-pwa';
import svgr from "vite-plugin-svgr";
import tailwindcss from "@tailwindcss/vite";

const getLocalIP = () => {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    const networkInterface = interfaces[name];
    if (networkInterface) {
      for (const iface of networkInterface) {
        if (iface.family === "IPv4" && !iface.internal) {
          return iface.address;
        }
      }
    }
  }
};

export default ({ mode }: { mode: string }) => {
  console.log("mode", mode);

  const localIP = getLocalIP();
  console.log("Local IP:", localIP);

  return defineConfig({
    plugins: [
      react(),
      tailwindcss(),
      mkcert(),

      // VitePWA({
      //   strategies: 'injectManifest',
      //   srcDir: 'src',
      //   filename: 'service-worker.ts',
      //   // registerType: 'prompt',
      //   // injectRegister: null,

      //   injectManifest: {
      //     swSrc: './src/service-worker.ts', // Path to your custom service worker
      //     maximumFileSizeToCacheInBytes: 15000000, // ~15MB, // files bigger than 15MB will not be precached
      //     manifestTransforms: [
      //       (manifest) => {
      //         manifest.push({
      //           url: '/version.json',
      //           revision: Date.now().toString(),
      //           size: 0,
      //         });
      //         return { manifest };
      //       },
      //     ],
      //   },

      //   workbox: {
      //     globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
      //   },

      //   devOptions: {
      //     enabled: true,
      //     navigateFallback: 'index.html',

      //     // suppressWarnings: true,
      //     type: 'module',
      //   },
      // }),
    ],

    server: {
      host: localIP,
      port: 5173,
      strictPort: true,
    },
  });
};
