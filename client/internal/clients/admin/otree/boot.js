// Starts the oTree admin with no build step: vue3-sfc-loader fetches src/App.vue and what it
// imports and compiles them in the browser (as admin2's boot.js does), keeping the results in
// localStorage, keyed by their source.
import * as Vue from 'vue'
import { loadModule } from 'vue3-sfc-loader'

const CACHE_PREFIX = 'jtree-admin-otree-compiled:'

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
        // No storage: compile every time.
      }
    }
  },
}

const options = {
  moduleCache: { 'vue': Vue, 'socket.io-client': { io: window.io } },
  // Imports in src/ leave out the extension of TypeScript modules.
  async getFile(url) {
    const type = /\.[a-z]+$/i.test(url) ? undefined : '.ts'
    const res = await fetch(type ? url + type : url)
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}: ${url}`)
    return { type, getContentData: (asBinary) => (asBinary ? res.arrayBuffer() : res.text()) }
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
  const pre = Object.assign(document.createElement('pre'), { textContent: 'The oTree admin could not start:\n\n' + (err?.stack || err) })
  pre.style.cssText = 'padding: 1rem; white-space: pre-wrap; color: #b91c1c'
  document.getElementById('app').replaceChildren(pre)
}
