const fs = require('fs')
const path = require('path')
const { getIdFromDirectory } = require('./getIdFromDirectory.js')

// If directory contains "app.js" or "app.jtt", parse other apps
// as subapps.
const loadDefaultApp = dir => {
  let defaultAppFilename = 'app.js'
  let hasDefaultApp = fs.existsSync(path.join(dir, defaultAppFilename))
  if (!hasDefaultApp) {
    defaultAppFilename = 'app.jtt'
    hasDefaultApp = fs.existsSync(path.join(dir, defaultAppFilename))
  }
  if (hasDefaultApp) {
    return getIdFromDirectory(dir)
  }
  return null
}

module.exports = { loadDefaultApp }
