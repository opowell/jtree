/// <reference types="vite/client" />

declare const __JTREE_DEV__: { server: string, base: string } | null

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<object, object, unknown>
  export default component
}

declare module 'circular-json' {
  const CircularJSON: { parse(text: string): any; stringify(value: unknown): string }
  export default CircularJSON
}
