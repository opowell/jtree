/*
text - the text of the button.
fn - the function to call when the button is clicked.
parentEl - the element to append the button to.
 */

jt.Button = function(text, fn, parentEl) {
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
