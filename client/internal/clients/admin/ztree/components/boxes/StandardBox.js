jt.StandardBox = function(parentEl) {
    var out = $(`
        <div class='zt-standardbox'>
        </div>
    `);

    if (parentEl != null) {
        $(parentEl).append(out);
    }

    return out;
}
