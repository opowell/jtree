// Box with a border and a title.
// content: either an html string, or a set of elements
jt.Box_Tacky = function(title, content, parentEl) {
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

jt.Box_Standard = function(parentEl) {
    var out = $(`
        <div class='zt-standardbox'>
        </div>
    `);

    if (parentEl != null) {
        $(parentEl).append(out);
    }

    return out;
}

// Adds a grid box to the given parent element.
// numCols - the number of columns in the grid box.
// parentEl - the parent element.
jt.Box_Grid = function(numCols, parentEl) {
    var cols = '';
    for (var i=0; i<numCols; i++) {
        cols = cols + 'auto ';
    }
    cols = cols + ';';

    var out = $(`
        <div class='zt-gridbox' style='grid-template-columns: ${cols}'>
        </div>
    `);

    if (parentEl != null) {
        $(parentEl).append(out);
    }

    return out;
}
