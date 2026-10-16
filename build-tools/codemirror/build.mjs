// Bundles entry.js (CodeMirror and codeEditor()) into one ES module for the admin interfaces:
//   cd build-tools/codemirror && npm install && npm run build
// The output's folder is named after @codemirror/view's version; when the versions change, build
// into a new folder and change the admins' import maps (shared/README.md: files are never removed).
import { build } from 'esbuild'
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs'

const pkg = JSON.parse(readFileSync('package.json', 'utf8'))
const view = pkg.devDependencies['@codemirror/view']
const out = new URL(`../../client/internal/clients/shared/codemirror-${view}/`, import.meta.url)
mkdirSync(out, { recursive: true })

const versions = Object.entries(pkg.devDependencies).filter(([n]) => n !== 'esbuild').map(([n, v]) => `${n} ${v}`).join(', ')
await build({
  entryPoints: ['entry.js'],
  bundle: true,
  format: 'esm',
  minify: true,
  target: 'es2020',
  legalComments: 'eof',
  banner: { js: `/* CodeMirror 6 for jtree's admin interfaces (build-tools/codemirror). MIT licence. ${versions} */` },
  outfile: new URL('codemirror.js', out).pathname,
})
writeFileSync(new URL('LICENSE', out), readFileSync('node_modules/@codemirror/view/LICENSE'))
console.log('built', new URL('codemirror.js', out).pathname)
