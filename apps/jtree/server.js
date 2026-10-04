// jtree as a JAS app: starts the jtree server (server/source/jtree.js) on the
// HTTP server JAS owns, and hands it every request under this app's route
// ("route" in settings.json, /jtree by default), which jtree also serves its
// pages, links and socket.io under.
import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const require = createRequire(import.meta.url)
const jtree = require(path.join(root, 'server', 'source', 'jtree.js'))

export default (router, app, httpServer) => {
  // A JAS without per-app routes serves every app at /<folder>.
  const route = app.route || '/' + app.id
  const jt = jtree.start({ path: path.join(root, 'client'), basePath: route, httpServer })
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
