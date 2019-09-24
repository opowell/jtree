var participantTimers = {};

// function reloadParticipantView() {
//     for (var i in selectedParticipants) {
//         var id = selectedParticipants[i];
//         var url = location.origin + '/' + id;
//         $('#participant-frame-' + id).attr('src', url)
//     }
// }

function clearSelectedParticipants() {
    const numSelected = selectedParticipants.length;
    for (let i=0; i<numSelected; i++) {
        removeSelectedParticipant(selectedParticipants[0]);
    }
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

jt.view = {};

jt.view.updateNumParticipants = function() {
    const numParts = objLength(jt.data.session.participants);
    $('#setNumParticipantsInput').val(numParts);
    $('#tabSessionParticipantsNumber').text(numParts);
}

function refresh(ag) {
    // console.log('refresh');

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

}

function removeClient(cId) {
    $('#client-' + cId).remove();
}

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
                // console.log('received message ' + i + ': ' + JSON.stringify(d));
                eval('msgs.' + i + "(d)");
            });
        })(i);
    }

    jt.socket.on('refresh-admin', function(ag) {
        refresh(ag);
    });

    jt.socket.on('refresh-apps', function(appInfos) {
        // console.log('refresh-apps');
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

    jt.socket.on('add-client', function(client) {
        if (client.session.id === jt.data.session.id) {
            // console.log('add client: ' + client);
            jt.data.session.clients.push(client);
            var participant = findByIdWOJQ(jt.data.session.participants, client.pId);
            if (participant !== null) {
                participant.numClients++;
                $('.participant-' + client.pId + '-numClients').text(participant.numClients);
            }
        }
    });

    jt.socket.on('remove-client', function(client) {
        if (client.session.id === jt.data.session.id) {
            console.log('remove client: ' + client);
            deleteById(jt.data.session.clients, client.id);
            removeClient(client.id);
            var participant = findByIdWOJQ(jt.data.session.participants, client.pId);
            if (participant != null) {
                participant.numClients--;
                $('.participant-' + client.pId + '-numClients').text(participant.numClients);
            }
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

    var interfaceMode = localStorage.getItem('interfaceMode');
    if (interfaceMode === null) {
        interfaceMode = 'basic';
    }
    jt.setInterfaceMode(interfaceMode);

    // var queuesMode = localStorage.getItem('queuesMode');
    // if (queuesMode === null) {
    //     queuesMode = 'hide';
    // }
    // jt.setQueuesMode(queuesMode);

  // var sId = localStorage.getItem("sessionId");
  // if (sId !== null) {
  //     server.openSessionId(sId);
  // } else {
  //     server.sessionCreate();
  // }

  var userId = Cookies.get('userId');
  if (userId !== undefined) {
      $('#menu-userid').text(userId);
  }

}

jt.socketConnected = function() {
    server.refreshAdmin();

    ace.config.set("basePath", "/shared/ace");

    // var editor = ace.edit("edit-app-appjs");
    // var editorCH = ace.edit("edit-app-clienthtml");
    // editor.setTheme("ace/theme/tomorrow");
    // editor.session.setMode("ace/mode/javascript");
    // editorCH.setTheme("ace/theme/tomorrow");
    // editorCH.session.setMode("ace/mode/html");

    jt.editor = new Editor();
}
