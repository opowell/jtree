const vm = require('vm')

// Where the syntax error in code is, as {line, column} strings (both from 1), or null if
// it compiles. A SyntaxError from eval has no position; compiling with vm.Script does,
// in its stack: "<filename>:<line>", the line's source, then a caret under the column.
const syntaxErrorPosition = (code, filename) => {
  try {
    new vm.Script(code, { filename })
    return null
  } catch (err) {
    if (!(err instanceof SyntaxError)) {
      return null
    }
    const lines = String(err.stack).split('\n')
    const match = /:(\d+)$/.exec(lines[0])
    if (match == null) {
      return null
    }
    const caret = (lines[2] || '').indexOf('^')
    return {
      line: match[1],
      column: caret >= 0 ? String(caret + 1) : 'unknown',
    }
  }
}

module.exports = { syntaxErrorPosition }
