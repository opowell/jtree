partLink = function(pId) {
    if (jt.interfaceMode === 'basic') {
        return jt.serverURL() + '/' + pId;
    } else {
//        return jt.serverURL() + '/' + pId + '?sessionId=' + jt.data.session.id;
        return jt.serverURL() + '/session/' + jt.data.session.id + '/' + pId;
    }
}

fullPartLink = function(pId) {
    return jt.serverURL() + '/session/' + jt.data.session.id + '/' + pId;
}

// http://www.davekoelle.com/files/alphanum.js
// Sort alphanumerically in place.
alphanumSort = function(ids) {
    let caseInsensitive = true;
    for (var z = 0, t; t = ids[z]; z++) {
        ids[z] = new Array();
        var x = 0, y = -1, n = 0, i, j;
    
        while (i = (j = t.charAt(x++)).charCodeAt(0)) {
        var m = (i == 46 || (i >=48 && i <= 57));
        if (m !== n) {
            ids[z][++y] = "";
            n = m;
        }
        ids[z][y] += j;
        }
    }
    
    ids.sort(function(a, b) {
        for (var x = 0, aa, bb; (aa = a[x]) && (bb = b[x]); x++) {
        if (caseInsensitive) {
            aa = aa.toLowerCase();
            bb = bb.toLowerCase();
        }
        if (aa !== bb) {
            var c = Number(aa), d = Number(bb);
            if (c == aa && d == bb) {
            return c - d;
            } else return (aa > bb) ? 1 : -1;
        }
        }
        return a.length - b.length;
    });
    
    for (var z = 0; z < ids.length; z++)
        ids[z] = ids[z].join("");
} 

roomLink = function(roomId) {
    return jt.serverURL() + '/room/' + roomId;
}

function roundValue(obj, dec) {
    if (isNumber(obj)) {
        return round(obj-0, dec);
    } else {
        return JSON.stringify(obj);
    }
}

function groupId(fullId) {
    if (fullId === undefined) {
        return '';
    }
    var i = fullId.indexOf('_group_');
    return fullId.substring(i + '_group_'.length);
}

function appId(id) {
    var index = id.indexOf('app_');
    var indexPrd = id.indexOf('period_');
    if (index > -1) {
        if (indexPrd < 0) {
            return id.substring(index+'app_'.length);
        } else {
            return id.substring(index+'app_'.length, indexPrd);
        }
    }
    return null;
}

jt.deriveAppOptions = function(optionEls) {
    var options = {};
    for (var i=0; i<optionEls.length; i++) {
        var el = optionEls[i];
        var name = $(el).attr('app-option-name');
        options[name] = $(el).val();
    }
    return options;
}
