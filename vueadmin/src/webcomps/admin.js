import server from '@/webcomps/msgsToServer.js'
import jt from '@/webcomps/jtree.js'
import 'jquery'
let $ = window.jQuery
import Utils from '@/webcomps/utilsFns.js'
import msgs from '@/webcomps/msgsFromServer.js'

window.msgs = msgs;

jt.participantTimers = {};

// window.reloadParticipantView() {
//     for (var i in selectedParticipants) {
//         var id = selectedParticipants[i];
//         var url = location.origin + '/' + id;
//         $('#participant-frame-' + id).attr('src', url)
//     }
// }

jt.clearSelectedParticipants = function() {
    const numSelected = this.selectedParticipants.length;
    for (let i=0; i<numSelected; i++) {
        jt.removeSelectedParticipant(this.selectedParticipants[0]);
    }
}

// eslint-disable-next-line no-unused-vars
jt.removeCustomAppFolder = function(folder) {

}

// window.ClientRow(obj) {
//     var div = $('<tr>').attr('id', 'client-' + obj.id);
//     div.append($('<td>').text(obj.id));
//     div.append($('<td>').text(obj.pId));
//     div.append($('<td>').text(obj.lastActivity));
//     return div;
// }

jt.deleteParticipant = function(pId) {
    $('.participant-' + pId).remove();
    delete jt.data.session.participants[pId];
    $('#deleteParticipantSelect option[value=' + pId + ']').remove();
}

jt.setQueue = function(event) {
    event.stopPropagation();
    console.log('set session queue: ' + event.data.id + ', name = ' + event.data.name);
    server.setQueue(event.data.id);
}

jt.setQueueAndStart = function(event) {
    event.stopPropagation();
    console.log('set session queue and start: ' + event.data.id + ', name = ' + event.data.name);
    server.setQueueAndStart(event.data.id);
}

jt.addSelectedAppToQueue = function() {
    var id = $('#addAppToQueueSelect').val();
    server.sessionAddApp(id);
}

// eslint-disable-next-line no-unused-vars
jt.addAppToNewQueue = function(aId) {

}

jt.addAppFolder = function() {
    var folder = $('#input-app-folder').val();
    server.addAppFolder(folder);
}

jt.setApps = function(apps) {
    jt.data.appInfos = apps;
    let appInfos = window.vue.$store.state.appInfos;
    appInfos.splice(0, appInfos.length)
    for (let i in apps) {
        appInfos.push(apps[i]);
    }
}

jt.showPanelNew = function(title, type) {
    let panels = window.vue.$store.state.panels;
    for (let i in panels) {
        let panel = panels[i];
        if (panel.type === type) {
            window.vue.$store.commit('setPanel', i);
            return;
        }
    }
    jt.addPanelNew(title, type);
    window.vue.$store.commit('setPanel', panels.length-1);
}

jt.addPanelNew = function(title, type) {
    window.vue.$store.commit('addPanel', {
        title,
        type
    });
}

jt.view = {};

jt.view.updateNumParticipants = function() {
    const numParts = Utils.objLength(jt.data.session.participants);
    $('#setNumParticipantsInput').val(numParts);
    $('#tabSessionParticipantsNumber').text(numParts);
}

jt.refresh = function(ag) {
    // console.log('refresh');

    jt.data.clockRunning = ag.clockRunning;
    jt.data.ag = ag;
    jt.data.predefinedQueues = ag.predefinedQueues;
    jt.data.appName = ag.appName;
    jt.data.sessions = ag.sessions;
    jt.data.rooms = ag.rooms;
    jt.data.queues = ag.queues;
    jt.data.jtreeLocalPath = ag.jtreeLocalPath;
    
    window.vue.$store.commit('setSettings', ag.settings);
    jt.settings = ag.settings;
    jt.data.users = ag.users;

    jt.setApps(ag.apps);
    // window.showSessions();
    // jt.showAppFolders(ag.appFolders);
    // window.showRooms();
    // window.showQueues();
    // window.showUsers();

    $('#setAutoplayFreq-input').val(jt.settings.autoplayDelay);

    // jt.showUsersMode(jt.settings.multipleUsers);

}

jt.removeClient = function(cId) {
    $('#client-' + cId).remove();
}

jt.socketConnected = function() {
    server.refreshAdmin();

    // eslint-disable-next-line no-undef
    ace.config.set("basePath", "/shared/ace");

    // var editor = ace.edit("edit-app-appjs");
    // var editorCH = ace.edit("edit-app-clienthtml");
    // editor.setTheme("ace/theme/tomorrow");
    // editor.session.setMode("ace/mode/javascript");
    // editorCH.setTheme("ace/theme/tomorrow");
    // editorCH.session.setMode("ace/mode/html");

    console.log('Creating editor');
    // eslint-disable-next-line no-undef
    jt.editor = new Editor();
}

jt.connected = function() {

    jt.socketConnected = function() {
        server.refreshAdmin();
    
        // eslint-disable-next-line no-undef
        ace.config.set("basePath", "/shared/ace");
    
        // var editor = ace.edit("edit-app-appjs");
        // var editorCH = ace.edit("edit-app-clienthtml");
        // editor.setTheme("ace/theme/tomorrow");
        // editor.session.setMode("ace/mode/javascript");
        // editorCH.setTheme("ace/theme/tomorrow");
        // editorCH.session.setMode("ace/mode/html");
    
        console.log('Creating editor');
        // eslint-disable-next-line no-undef
        jt.editor = new Editor();
    }
    
    // $('#startAdvanceSlowest').click(function(ev) {
    //     ev.stopPropagation();
    //     server.sessionAdvanceSlowest();
    // });
    //
    // Register to listen for messages defined in msgs object.
    // https://stackoverflow.com/questions/29917977/get-event-name-in-events-callback-function-in-socket-io
    for (var i in msgs) {
        // console.log('listening for message ' + i);
        (function(i) {
            // eslint-disable-next-line no-unused-vars
            jt.socket.on(i, function(d) {
                // console.log('received message ' + i + ': ' + JSON.stringify(d));
                eval('window.msgs.' + i + "(d)");
            });
        })(i);
    }

    jt.socket.on('refresh-admin', function(ag) {
        this.refresh(ag);
    });

    jt.socket.on('refresh-apps', function(appInfos) {
        // console.log('refresh-apps');
        jt.data.appInfos = appInfos;
        jt.showAppInfos();
    });

    jt.socket.on('stage-end', function(a) {
        this.stageEnd(a);
        console.log('stage-end');
    });

    jt.socket.on('get-app', function(a) {
        jt.data.viewedApp = a;
        this.viewApp(a.id, a.title);
    });

    jt.socket.on('add-client', function(client) {
        if (client.session.id === jt.data.session.id) {
            // console.log('add client: ' + client);
            jt.data.session.clients.push(client);
            var participant = Utils.findById(jt.data.session.participants, client.pId);
            if (participant !== null) {
                participant.numClients++;
                $('.participant-' + client.pId + '-numClients').text(participant.numClients);
            }
        }
    });

    jt.socket.on('remove-client', function(client) {
        if (client.session.id === jt.data.session.id) {
            // console.log('remove client: ' + client);
            Utils.deleteById(jt.data.session.clients, client.id);
            jt.removeClient(client.id);
            var participant = Utils.findById(jt.data.session.participants, client.pId);
            if (participant != null) {
                participant.numClients--;
                $('.participant-' + client.pId + '-numClients').text(participant.numClients);
            }
        }
    });

// TODO: move all message functionality here
    jt.socket.on('messages', function(msgs) {
        for (let m in msgs) {
            var msg = msgs[m];
            // eval(msg.type + "(msg.data)");
            switch (msg.type) {
                case 'set-session-app-status':
                    jt.data.session.appSequence[msg.data.index].status = msg.data.status;
                    this.showSessionAppSequence();
                    break;
                case 'clock-start':
                    this.startClock(msg.data.endTime);
                    break;
                case 'refresh-admin':
                    this.refresh(msg.data);
                    break;
            }
        }
    });

}

