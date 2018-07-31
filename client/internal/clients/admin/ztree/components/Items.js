jt.Item_RadioSelect = function(id, options) {

    var out = [];
    for (var i=0; i<options.length; i++) {
        var option = options[i];
        out.push(`<input type="radio" name="${id}" id='${option}'>`)
        out.push(`<label for="${option}">${option}</label><br>`);
    }
    return out;

}

/*
text - the text of the button.
fn - the function to call when the button is clicked.
parentEl - the element to append the button to.
 */

jt.Item_Button = function(text, fn, parentEl) {
    var out = $(`
        <div class='zt-button' tabindex='0'>
            ${text}
        </div>
    `);
    out.click(fn);
    out.bind('keydown', 'return', fn);
    out.bind('keydown', 'space', fn);

    if (parentEl != null) {
        $(parentEl).append(out);
    }
    return out;
}

jt.Item_Input = function(title, id, parentEl, value) {
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
