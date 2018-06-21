// Box with a border and a title.
// content: either an html string, or a set of elements
jt.TackyBox = function(title, content, parentEl) {
    var out = $(`
        <div class='tackyBox'>
            <span class='tackyBox-title'>${title}</span>
            <div class='tackyBox-content'></div>
        </div>
    `);

    if (!Array.isArray(content)) {
        out.find('.tackyBox-content').html(content);
    } else {
        for (var i=0; i<content.length; i++) {
            out.find('.tackyBox-content').append(content[i]);
        }
    }

    if (parentEl != null) {
        $(parentEl).append(out);
    }
    return out;
}
