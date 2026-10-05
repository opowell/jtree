// Prints the first port, from the one given (default 3000) upwards, that a
// server can listen on, the way JAS listens (all addresses). The launchers
// (start.sh, start.cmd) use it to pick jtree's port.
//
//   node scripts/find-port.js [port]
const net = require('node:net')

const first = Number(process.argv[2]) || 3000
const LAST = 65535

function tryPort(port) {
  if (port > LAST) {
    console.error('find-port: no free port from ' + first + ' to ' + LAST)
    process.exit(1)
  }
  const server = net.createServer()
  server.once('error', (err) => {
    if (err.code === 'EADDRINUSE' || err.code === 'EACCES') tryPort(port + 1)
    else {
      console.error('find-port: ' + err.message)
      process.exit(1)
    }
  })
  server.listen(port, () => server.close(() => console.log(port)))
}

tryPort(first)
