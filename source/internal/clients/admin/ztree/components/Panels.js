function showPanel(t) {
    // Replace periods '.' with escaped periods '\.'.
    var el = $(t.replace(/\./g, '\\.'));
    el.removeAttr('hidden');
}