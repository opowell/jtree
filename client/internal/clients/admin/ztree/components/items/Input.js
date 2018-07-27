jt.Input = function(title, id, parentEl, value) {
    var out = $(`
        <div class='jt-input'>
            <span style='text-align: right; padding-right: 5px;'>${title}</span>
            <input id='${id}' value='${value}'>
        </div>
    `);
    if (parentEl != null) {
        $(parentEl).append(out);
    }
    return out;
}
