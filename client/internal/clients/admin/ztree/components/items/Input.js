jt.Input = function(title, id, parentEl) {
    var out = $(`
        <div>
            <span>${title}</span>
            <input id='${id}'>
        </div>
    `);
    if (parentEl != null) {
        $(parentEl).append(out);
    }
    return out;
}
