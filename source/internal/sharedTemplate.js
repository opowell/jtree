//
// MAKE CHANGES TO 'sharedTemplate.js', not 'shared.js' directly!!!
//
var jt = {};

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

// For Player only
jt.alwaysShowAllStages = false;

window.onload = function() {
    jt.checkIfLoaded();
}

jt.dataReviver = function(key, value) {
    if (
        (value != null) &&
        (typeof value.startsWith === 'function') &&
        value.startsWith("/Function(") &&
        value.endsWith(")/")
    ) {
        value = value.substring(10, value.length - 2);
        try {
            return eval("(" + value + ")");
        } catch (err) {
            console.log(err);
        }
    } else {
        return value;
    }
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

        jt.queue = queue();

        // jt.socket = io(jt.serverIP + ':' + jt.serverPort, query);
        jt.socket = io(window.location.host, query);
        jt.socket.on('connect', function() {
            console.log('client.socket connected socketId=' + jt.socket.id);
            jt.socketConnected();
        });

        jt.socket.on('logged-in', function(msgData) {
            msgData = CircularJSON.parse(msgData, jt.dataReviver);
            jt.storeObjects(msgData.objectList);
            let partData = msgData.participant;
            partData = jt.replaceLinksWithObjects(partData);
            let partId = null;
            let sessId = null;
            if (partData.id != null) {
                partId = partData.id;
                sessId = partData.session.id;
            } else {
                let participant = CircularJSON.parse(partData, jt.dataReviver);
                partId = participant.id;
                sessId = participant.session.id;
            }
            jt.setPId(partId, sessId);
        });

        jt.socket.on('loggedIntoRoom', function(pId) {
            jt.showPId(pId);
        });

        jt.defaultConnected();
        jt.connected();

        if (jt.alwaysShowAllStages) {
            jt.showAllStages();
        }
}

jt.storeObjects = function(objects) {
    if (!jt.vueMounted) {
        let vueComputed = {
            clock: function() {
                return jt.getClock(this.timeLeft);
            },
            clockClient: function() {
                return jt.getClock(this.timeLeftClient);
            },
            groupOtherPlayers: function() {
                let players = [];
                let me = this.player;
                if (this.group.players != null && this.group.players.length > 0) {
                    players = this.group.players.filter(function (grpPlyr) {
                        return grpPlyr.id !== me.id;
                    })
                }
                return players;
            }
        };

        // let computed = participant.session.vueComputedText;
        // for (let i in computed) {
        //     eval('vueComputed[i] = ' + computed[i]);
        // }
        // let methods = participant.session.vueMethodsText;
        // for (let i in methods) {
        //     eval('vueMethods[i] = ' + methods[i]);
        // }
    
        let participant = {};
        jt.vueModels = jt.getVueModels(participant, vueComputed);

        jt.vue = new Vue({
            el: '#jtree',
            data: jt.vueModels,
            computed: vueComputed,
            methods: jt.vueMethods,
            mounted: function() {
                jt.setFormDefaults();
            }
        });
        $('body').addClass('show');
    }
    jt.vue.objectList = jt.vue.objectList || [];
    jt.vue.objectList.push(...objects);
    jt.replaceLinksWithObjects(objects);
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
jt.defaultConnected = function() {}
jt.connected = function()        {}
jt.showPId = function(id)        {}