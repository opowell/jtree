const getIdFromDirectory = dir => {
  let id = dir
  if (dir.lastIndexOf('/') > -1) {
    id = dir.substring(dir.lastIndexOf('/') + 1)
  } else if (dir.lastIndexOf('\\') > -1) {
    id = dir.substring(dir.lastIndexOf('\\') + 1)
  }
  return id
}

module.exports = { getIdFromDirectory }
