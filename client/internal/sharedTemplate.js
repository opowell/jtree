//
// MAKE CHANGES TO 'sharedTemplate.js', not 'shared.js' directly!!!
//
var jt = jt || {};

// Code used by both participant and admin.
jt.socket = null;
jt.timer = null;
jt.data = {};
jt.data.endTime = 0;
jt.data.timeLeft = 0;
jt.data.clockRunning = false;
jt.data.CLOCK_FREQUENCY = 100; // in ms

jt.serverIP = '{{{SERVER_IP}}}';
jt.serverPort = '{{{SERVER_PORT}}}';
jt.server = {};

jt.serverURL = function() {
    if (jt.serverPort === '80') {
        return jt.serverIP;
    } else {
        return jt.serverIP + ':' + jt.serverPort;
    }
}

window.onload = function() {
    jt.checkIfLoaded();
}

jt.popupMessage = function(text) {
    var abDiv = $('<div class="popup">');
    var div = $('<div class="alert-box success">');
    div.html(text);
    abDiv.append(div);
    $('body').append(abDiv);
    abDiv.delay(1200).fadeOut(700);
}

jt.checkIfLoaded = function() {
        var pId = jt.getPId();
        var pwd = jt.getURLParameter('pwd');

        var type = jt.getURLParameter('type'); // 'admin' == admin
        if (jt.isAdmin()) {
            type = 'ADMIN';
        }

        var sId = jt.getSessionId(); // sessionId

        var roomId = jt.getRoomId();

        var query = {
            query: 'id=' + pId +
            '&pwd=' + pwd +
            '&type=' + type +
            '&sessionId=' + sId +
            '&roomId=' + roomId
        };
        jt.socket = io(jt.serverIP + ':' + jt.serverPort, query);
        jt.socket.on('connect', function() {
            console.log('client.socket connected socketId=' + jt.socket.id);
            jt.defaultSocketConnected();
            jt.socketConnected();
        });

        jt.socket.on('logged-in', function(participant) {
            jt.setPId(participant.id, participant.session.id);
        });

        jt.socket.on('loggedIntoRoom', function(pId) {
            jt.showPId(pId);
        });

        jt.defaultConnected();
        jt.connected();

}

jt.defaultSocketConnected = function() {
    
}

// Overwrite
jt.socketConnected = function() {
}

jt.isAdmin = function() {
    return (
        window.location.pathname.includes('/admin')
    );
}

jt.getSessionId = function() {
    var sId = jt.getURLParameter('sId');
    if (location.pathname.includes('/session/')) {
        var totheright = location.pathname.substring('/session/'.length);
        var nextSlashIndex = totheright.indexOf('/');
        if (nextSlashIndex > 0) {
            sId = totheright.substring(0, nextSlashIndex);
        }
    }
    return sId;
}

jt.getRoomId = function() {
    var out = jt.getURLParameter('roomId');
    if (location.pathname.includes('/room/')) {
        var totheright = location.pathname.substring('/room/'.length);
        var nextSlashIndex = totheright.indexOf('/');
        if (nextSlashIndex > 0) {
            out = totheright.substring(0, nextSlashIndex);
        }
    }
    return out;
}

jt.getPId = function() {
    var pId = jt.getURLParameter('id'); // participant or admin id
    if (pId === null && !jt.isAdmin()) {
        var toSkip;
        // Location is /session/sessionId/pId
        if (location.pathname.startsWith('/session/')) {
            toSkip = '/session/' + jt.getSessionId() + '/';
        }

        // /room/roomId/pId
        else if (location.pathname.startsWith('/room/')) {
            toSkip = '/room/' + jt.getRoomId() + '/';
        }

        // /pId
        else {
            toSkip = '/';
        }
        var whatsLeft = location.pathname.substring(toSkip.length);

        // .../pId/hash
        if (whatsLeft.indexOf('/') > 0) {
            whatsLeft = whatsLeft.substring(0, whatsLeft.index('/'));
        }

        pId = whatsLeft;
    }
    return pId;
}

jt.setPId = function(newPId, newSId) {
    var pId = jt.getPId(); // participant or admin id
    var pwd = jt.getURLParameter('pwd');
    var sId = jt.getSessionId();
    var type = jt.getURLParameter('type');
    var props = '/' + newPId;
    if (pwd !== null) {
        props += '?pwd=' + pwd;
    }
    if (sId !== null) {
        props += '/session/' + newSId;
    }
    if (type !== null) {
        props += '&type=' + type;
    }
    var newURL = window.location.protocol + '//' + window.location.host + props;
//    if (window.location.href !== newURL) {
    if (newPId !== pId) {
        window.location.href = newURL;
    }
    jt.showPId(pId);
}


/**
 * Returns parameter with the given name, null if no parameter with this name exists.
 *
 * @param  {type} name description
 * @return {type}      description
 */
jt.getURLParameter = function(name) {
    return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [null, ''])[1].replace(/\+/g, '%20')) || null;
}

jt.getClock = function(timeLeft) {
    const clock = {};
    var duration = timeLeft;
    if (duration < 0) {
        duration = 0;
    }

    clock.milliseconds    = duration%1000;
    clock.seconds         = parseInt((duration/1000)%60);
    clock.minutes         = parseInt((duration/(1000*60))%60);
    clock.hours           = parseInt((duration/(1000*60*60))%24);
    clock.totalSeconds    = parseInt(duration/1000);

    clock.noMS = {};
    clock.noMS.seconds = clock.milliseconds > 0 ? clock.seconds + 1 : clock.seconds;
    clock.noMS.minutes = clock.minutes;
    clock.noMS.hours = clock.hours;
    if (clock.noMS.seconds >= 60) {
        clock.noMS.seconds = clock.noMS.seconds - 60;
        clock.noMS.minutes = clock.noMS.minutes + 1;
        if (clock.noMS.minutes >= 60) {
            clock.noMS.hours = clock.noMS.hours + 1;
        }
    }
    return clock;
}

// https://stackoverflow.com/questions/10073699/pad-a-number-with-leading-zeros-in-javascript/10073788
jt.pad = function(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

jt.displayTimeLeft = function(min, secs, timeLeft) {
    let clock = jt.getClock(timeLeft);
    min.text(clock.noMS.minutes);
    secs.text(jt.pad(clock.noMS.seconds, 2));
}

// Should be overwritten.
if (jt.defaultConnected == null) {
    jt.defaultConnected = function() {}
}
if (jt.connected == null) {
    jt.connected = function()        {}
}
if (jt.showPId == null) {
    jt.showPId = function(id)        {}
}
