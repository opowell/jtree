partLink = function(pId) {
    if (jt.interfaceMode === 'basic') {
        return jt.serverURL() + '/' + pId;
    } else {
//        return jt.serverURL() + '/' + pId + '?sessionId=' + jt.data.session.id;
        if (jt.data.session != null) {
          return jt.serverURL() + '/session/' + jt.data.session.id + '/' + pId;
        } else {
          return jt.serverURL() + '/' + pId;
        }
    }
}

roomLink = function(roomId) {
    return jt.serverURL() + '/room/' + roomId;
}

function roundValue(obj, dec) {
    if (isNumber(obj)) {
        return round(obj-0, dec);
    } else {
        return obj;
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
