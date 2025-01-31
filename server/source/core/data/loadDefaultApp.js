// If directory contains "app.js" or "app.jtt", parse other apps
// as subapps.
const loadDefaultApp = dir => {
  const defaultAppFilename = 'app.js'
  let hasDefaultApp = fs.exists(path.join(dir, defaultAppFilename))
  if (!hasDefaultApp) {
    defaultAppFilename = 'app.jtt'
    hasDefaultApp = fs.exists(path.join(dir, defaultAppFilename))
  }
  if (hasDefaultApp) {
    const id = getIdFromDirectory(dir)
  }
}

const exports = module.exports = {}
exports.loadDefaultApp = loadDefaultApp