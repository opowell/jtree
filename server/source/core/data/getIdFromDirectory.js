const getIdFromDirectory = dir => {
  if (dir.lastIndexOf('/') > -1) {
    id = dir.substring(dir.lastIndexOf('/') + 1)
  } else if (dir.lastIndexOf('\\') > -1) {
    id = dir.substring(dir.lastIndexOf('\\') + 1)
  }
}

const exports = module.exports = {}
exports.getIdFromDirectory = getIdFromDirectory