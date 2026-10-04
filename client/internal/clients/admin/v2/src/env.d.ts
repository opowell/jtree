// Types for editors and `npm run typecheck` (see README.md); the browser ignores them.

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<object, object, unknown>
  export default component
}

declare module 'circular-json' {
  const CircularJSON: { parse(text: string): any; stringify(value: unknown): string }
  export default CircularJSON
}
