// jtree as a JAS app: starts the jtree server (server/source/jtree.js) on the
// HTTP server JAS owns, and hands it every request under this app's route
// ("route" in settings.json, /jtree by default).
//
// In a JAS shared with other apps, jtree serves its pages, links and socket.io
// under that route. As JAS's default app (JAS_DEFAULT_APP=jtree, which jtree's
// own launchers and releases set), it has the server to itself and serves them
// at the root: JAS hands it requests for / as well, and jtree writes root URLs.
import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const require = createRequire(import.meta.url)
const jtree = require(path.join(root, 'server', 'source', 'jtree.js'))

export default (router, app, httpServer) => {
  // A JAS without per-app routes serves every app at /<folder>.
  const route = app.route || '/' + app.id
  const basePath = process.env.JAS_DEFAULT_APP === app.id ? '' : route
  const jt = jtree.start({ path: path.join(root, 'client'), basePath, httpServer })
  const expApp = jt.staticServer.expApp

  // jtree's Express app swaps the request and response prototypes for its own
  // (it is a separate copy of Express), so put JAS's back on anything it passes on.
  router.use(route, (req, res, next) => {
    const reqProto = Object.getPrototypeOf(req)
    const resProto = Object.getPrototypeOf(res)
    expApp(req, res, (err) => {
      Object.setPrototypeOf(req, reqProto)
      Object.setPrototypeOf(res, resProto)
      next(err)
    })
  })
}
