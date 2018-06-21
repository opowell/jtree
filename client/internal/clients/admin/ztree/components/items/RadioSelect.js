jt.RadioSelect = function(id, options) {

    var out = [];
    for (var i=0; i<options.length; i++) {
        var option = options[i];
        out.push(`<input type="radio" name="${id}" id='${option}'>`)
        out.push(`<label for="${option}">${option}</label><br>`);
    }
    return out;

}
