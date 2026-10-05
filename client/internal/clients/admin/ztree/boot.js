// Starts the admin interface with no build step: vue3-sfc-loader fetches src/App.vue and
// what it imports, compiles the TypeScript and single-file components in the browser, and
// remembers the results (see compiledCache) so later loads skip the compiling. Edit a file
// in src/ and reload the page to see the change.
import * as Vue from 'vue'
import * as Layout from 'header-content-layout'
import * as acorn from 'acorn'
import { loadModule } from 'vue3-sfc-loader'

const CACHE_PREFIX = 'jtree-admin-ztree-compiled:'

/**
 * Compiled modules, in localStorage. Keys are hashes of the source, so an edited file gets a
 * new entry; when storage fills up, the old entries are dropped.
 */
const compiledCache = {
  async get(key) {
    try {
      return localStorage.getItem(CACHE_PREFIX + key) ?? undefined
    } catch {
      return undefined
    }
  },
  async set(key, value) {
    try {
      localStorage.setItem(CACHE_PREFIX + key, value)
    } catch {
      try {
        for (const k of Object.keys(localStorage)) {
          if (k.startsWith(CACHE_PREFIX)) localStorage.removeItem(k)
        }
        localStorage.setItem(CACHE_PREFIX + key, value)
      } catch {
        // No storage (private window, blocked site data): compile every time.
      }
    }
  },
}

const options = {
  // Libraries come from the import map (index.html) and the page's scripts, not from src/.
  moduleCache: {
    'vue': Vue,
    'header-content-layout': Layout,
    'acorn': acorn,
    'socket.io-client': { io: window.io },
    'circular-json': window.CircularJSON,
  },
  // Imports in src/ leave out the extension of TypeScript modules, as a bundler allows.
  async getFile(url) {
    const type = /\.[a-z]+$/i.test(url) ? undefined : '.ts'
    const res = await fetch(type ? url + type : url)
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}: ${url}`)
    return {
      type,
      getContentData: (asBinary) => (asBinary ? res.arrayBuffer() : res.text()),
    }
  },
  addStyle(textContent) {
    document.head.append(Object.assign(document.createElement('style'), { textContent }))
  },
  compiledCache,
  log(type, ...args) {
    console[type](...args)
  },
}

try {
  const App = await loadModule('./src/App.vue', options)
  Vue.createApp(App).mount('#app')
} catch (err) {
  console.error(err)
  const pre = Object.assign(document.createElement('pre'), { textContent: 'jtree admin (z-Tree) could not start:\n\n' + (err?.stack || err) })
  pre.style.cssText = 'padding: 1rem; white-space: pre-wrap; color: #b91c1c'
  document.getElementById('app').replaceChildren(pre)
}
