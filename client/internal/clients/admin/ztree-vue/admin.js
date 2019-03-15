var participantTimers = {};

// function reloadParticipantView() {
//     for (var i in selectedParticipants) {
//         var id = selectedParticipants[i];
//         var url = location.origin + '/' + id;
//         $('#participant-frame-' + id).attr('src', url)
//     }
// }

jt.saveApp = function() {
    var app = $('.jt-panel.focussed-panel').data('app');
    if (app == null) {
        jt.promptForNewAppName($('.jt-panel.focussed-panel .panel-title-text').text());
    } else {

    }
}

jt.promptForNewAppName = function(id) {
    jt.SaveAppAsModal(id);
}

function clearSelectedParticipants() {
    const numSelected = selectedParticipants.length;
    for (let i=0; i<numSelected; i++) {
        removeSelectedParticipant(selectedParticipants[0]);
    }
}

function setNumParticipants() {
    const amt = $('#setNumParticipants').val();
    server.setNumParticipants(amt);
}

function removeCustomAppFolder(folder) {

}

// function ClientRow(obj) {
//     var div = $('<tr>').attr('id', 'client-' + obj.id);
//     div.append($('<td>').text(obj.id));
//     div.append($('<td>').text(obj.pId));
//     div.append($('<td>').text(obj.lastActivity));
//     return div;
// }

function deleteParticipant(pId) {
    $('.participant-' + pId).remove();
    delete jt.data.session.participants[pId];
    $('#deleteParticipantSelect option[value=' + pId + ']').remove();
}

function setQueue(event) {
    event.stopPropagation();
    console.log('set session queue: ' + event.data.id + ', name = ' + event.data.name);
    server.setQueue(event.data.id);
}

function setQueueAndStart(event) {
    event.stopPropagation();
    console.log('set session queue and start: ' + event.data.id + ', name = ' + event.data.name);
    server.setQueueAndStart(event.data.id);
}

function addSelectedAppToQueue() {
    var id = $('#addAppToQueueSelect').val();
    server.sessionAddApp(id);
}

jt.addAppToNewQueue = function(aId) {

}

function addAppFolder() {
    var folder = $('#input-app-folder').val();
    server.addAppFolder(folder);
}

jt.setApps = function(apps) {
    jt.data.appInfos = apps;
    showAppInfos();
}

function refresh(ag) {
    console.log('refresh');

    jt.data.clockRunning = ag.clockRunning;
    jt.data.ag = ag;
    jt.data.predefinedQueues = ag.predefinedQueues;
    jt.data.appName = ag.appName;
    jt.data.sessions = ag.sessions;
    jt.data.rooms = ag.rooms;
    jt.data.queues = ag.queues;
    jt.data.jtreeLocalPath = ag.jtreeLocalPath;
    jt.settings = ag.settings;
    jt.data.users = ag.users;

    jt.setApps(ag.apps);
    showSessions();
    showAppFolders(ag.appFolders);
    showRooms();
    showQueues();
    showUsers();

    $('#setAutoplayFreq-input').val(jt.settings.autoplayDelay);

    jt.showUsersMode(jt.settings.multipleUsers);

    $('#navbarSupportedContent > ul').removeClass('hidden');

}

function removeClient(cId) {
    $('#client-' + cId).remove();
}

ace.config.set("basePath", "/shared/ace");

jt.connected = function() {

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
            jt.socket.on(i, function(d) {
                console.log('received message ' + i + ': ' + JSON.stringify(d));
                eval('msgs.' + i + "(d)");
            });
        })(i);
    }

    jt.socket.on('refresh-admin', function(ag) {
        refresh(ag);
    });

    jt.socket.on('refresh-apps', function(appInfos) {
        console.log('refresh-apps');
        jt.data.appInfos = appInfos;
        showAppInfos();
    });

    jt.socket.on('stage-end', function(a) {
        stageEnd(a);
        console.log('stage-end');
    });

    jt.socket.on('get-app', function(a) {
        jt.data.viewedApp = a;
        viewApp(a.id, a.title);
    });

    jt.socket.on('add-participant', function(participant) {
        if (participant.session.id === jt.data.session.id) {
            console.log('add participant: ' + participant);
            jt.data.session.participants[participant.id] = participant;
            showParticipant(participant);
            //        viewParticipant(participant.id);
        }
    });

// TODO: move all message functionality here
    jt.socket.on('messages', function(msgs) {
        for (m in msgs) {
            var msg = msgs[m];
            // eval(msg.type + "(msg.data)");
            switch (msg.type) {
                case 'set-session-app-status':
                    jt.data.session.appSequence[msg.data.index].status = msg.data.status;
                    showSessionAppSequence();
                    break;
                case 'clock-start':
                    startClock(msg.data.endTime);
                    break;
                case 'refresh-admin':
                    refresh(msg.data);
                    break;
            }
        }
    });

  jt.registerKeyEvents();

  $('#menu-\\?').css('flex-grow', '1');

  $.getJSON('/shared/docjs.json', function(data) {
    jt.data.docs = {};
    for (var i in data) {
        var d = data[i];
        jt.data.docs[d.name] = d;
    }
    console.log('FINISHED LOADING docs');
  });

//   jt.Modal_AppProperties_init();
//   jt.Modal_HTMLEditor_init();
//   jt.Modal_KeyboardShortcuts_init();
//   jt.Modal_SelectApp_init();
//   jt.Modal_TreatmentCode_init();

  jt.data.appInfos = {};

  jt.models = {
    apps: [],
    clients: [],
    sessions: [],
    activeSession: null
  }

//   new Vue({
//     el: '#content-window',
//     data: jt.models
//   });

//   Syc.connect(jt.socket);
//   Syc.loaded(function () {
//           Syc.list('syncData');
//           Syc.watch(Syc.list('syncData'), function (change) { 
//             console.log(JSON.stringify(change));
//          });
//  });

}

refreshClients = function() {
    axios
    .get('http://' + jt.serverURL() + '/api/clients')
    .then(response => {
        window.jt.models.clients = response.data;
    })
}

refreshSessions = function() {
    axios
    .get('http://' + jt.serverURL() + '/api/sessions')
    .then(response => {
        window.jt.models.sessions = response.data;
    })
}

refreshApps = function() {
    axios
    .get('http://' + jt.serverURL() + '/api/apps')
    .then(response => {
        window.jt.models.apps = response.data;
    })
}

jt.startTreatment = function() {
    let panel = $('.jt-panel.focussed-panel');
    // var optionEls = $(this).find('[app-option-name]');
    // var options = jt.deriveAppOptions(optionEls);
    let options = {};
    let appPath = panel.find('panel-content').data('app').appPath;
    // server.sessionAddApp(appPath, options);
    server.createSessionAndAddApp(appPath, options);
}