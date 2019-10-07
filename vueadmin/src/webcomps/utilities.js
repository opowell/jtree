import jt from '@/webcomps/jtree.js'
import 'jquery'
let $ = window.jQuery

jt.partLink = function(pId) {
    let state = window.vue.$store.state;
    if (state.includeSessionIdInPartLinks) {
        if (state.session != null) {
            return jt.serverURL() + '/session/' + jt.data.session.id + '/' + pId;
          } else {
            return jt.serverURL() + '/' + pId;
          }
      } else {
        return jt.serverURL() + '/' + pId;
    }
}

jt.roomLink = function(roomId) {
    return jt.serverURL() + '/room/' + roomId;
}

jt.roundValue = function(obj, dec) {
    if (jt.isNumber(obj)) {
        return jt.round(obj-0, dec);
    } else {
        return obj;
    }
}

jt.groupId = function(fullId) {
    if (fullId === undefined) {
        return '';
    }
    var i = fullId.indexOf('_group_');
    return fullId.substring(i + '_group_'.length);
}

jt.appId = function(id) {
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
