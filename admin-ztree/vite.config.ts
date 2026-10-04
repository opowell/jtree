import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { copyFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

// Built into the folder the jtree server scans for admin UIs, so it is served
// at /admin/ztree/. The server answers /admin/ztree (no slash) with admin.html,
// so the page is written under both names.
const outDir = fileURLToPath(new URL('../client/internal/clients/admin/ztree', import.meta.url))

// The jtree server to talk to while developing, and the route it is served
// under: '' when jtree runs on its own, '/jtree' when it runs inside JAS.
const server = process.env.JTREE_SERVER ?? 'http://localhost:3000'
const base = process.env.JTREE_BASE ?? ''

export default defineConfig(({ command }) => ({
  base: '/admin/ztree/',
  plugins: [
    vue(),
    {
      name: 'jtree-admin-html',
      closeBundle() {
        copyFileSync(resolve(outDir, 'index.html'), resolve(outDir, 'admin.html'))
      },
    },
  ],
  define: {
    // While running `vite`, the jtree server is elsewhere; once built, the
    // page is served by jtree and finds its route from its own address.
    __JTREE_DEV__: JSON.stringify(command === 'serve' ? { server, base } : null),
  },
  build: { outDir, emptyOutDir: true },
  server: {
    proxy: {
      [`${base}/socket.io`]: { target: server, ws: true },
    },
  },
}))
