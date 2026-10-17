/** Throws an error whose message is for the editor's user (the server does not log it as a fault). */
function fail(message) {
    const err = new Error(message);
    err.editorMessage = true;
    throw err;
}

/**
 * edit(source), with source's line ends kept: a file with Windows' (\r\n, as git checks files
 * out there) is edited with \n alone, and given back with \r\n throughout, so that what an edit
 * puts in does not mix them. edit may return a promise.
 */
function keepingLineEnds(source, edit) {
    if (!String(source).includes('\r\n')) return edit(source);
    const back = (out) => out.replace(/\r?\n/g, '\r\n');
    const out = edit(source.replace(/\r\n/g, '\n'));
    return out instanceof Promise ? out.then(back) : back(out);
}

module.exports = { fail, keepingLineEnds };
