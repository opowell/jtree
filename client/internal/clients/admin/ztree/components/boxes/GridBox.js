// Adds a grid box to the given parent element.
// numCols - the number of columns in the grid box.
// parentEl - the parent element.
jt.GridBox = function(numCols, parentEl) {
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
