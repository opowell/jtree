/** Throws an error whose message is for the editor's user (the server does not log it as a fault). */
function fail(message) {
    const err = new Error(message);
    err.editorMessage = true;
    throw err;
}

module.exports = { fail };
