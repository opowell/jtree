// INCOMING MESSAGES FROM SERVER
var msgs = {};
msgs.addSession = function(session) {
  var index = findById(vue.$store.state.sessions, session.id);
  if (index === null) {
      vue.$store.state.sessions.push(session);
      showSessionRow(session);
      jt.showUsersMode(jt.settings.multipleUsers);
  }
}

msgs.deleteSession = function(id) {
    for (i in vue.$store.state.sessions) {
        var session = vue.$store.state.sessions[i];
        if (id === session.id) {
            vue.$store.state.sessions.splice(i, 1);
            i--;
            showSessions();
        }
    }
}

msgs.objChange = function(change) {

    console.log('object change: \n' + JSON.stringify(change));

    let paths = change.path.split('.');
    let obj = window.vue.$store.state;
    if (obj[paths[0]] == null) {
        obj = window.vue.$store.state.session;
    }

    switch (change.type) {

        case 'function-call':
            for (let i=0; i<paths.length; i++) {
                obj = obj[paths[i]];
            }
            if (obj == null) return;
            obj[change.function](...change.arguments);
            break;

        case 'set-prop':
            // console.log('set property: \n' + JSON.stringify(change.newValue));
            for (let i=0; i<paths.length - 1; i++) {
                obj = obj[paths[i]];
            }
            if (obj == null) return;
            vue.$set(obj, paths[paths.length-1], change.newValue);
            break;

        case 'set-value':
            // console.log('set value: \n' + change.newValue);
            for (let i=0; i<paths.length - 1; i++) {
                obj = obj[paths[i]];
            }
            if (obj == null) {
                return;
            }
            if (obj == null) return;
            vue.$set(obj, paths[paths.length-1], change.newValue);
            break;

        case 'delete-prop':
            // console.log('delete property: \n');
            for (let i=0; i<paths.length - 1; i++) {
                obj = obj[paths[i]];
            }
            if (obj == null) return;
            vue.$delete(obj, paths[paths.length-1]);
            break;

        default:
            debugger;
            break;
    }
}

msgs.updateAppPreview = function(appPreview) {
    jt.showAppPreview(appPreview);
}

msgs.reloadApps = function(apps) {
    jt.setApps(apps);
}

msgs.createRoom = function(room) {
    vue.$store.state.rooms.push(room);
    showRoom(room);
}

msgs.dataUpdate = function(dataChanges) {
    for (let i=0; i<dataChanges.length; i++) {
        let change = dataChanges[i];
        let obj = jt.getObject(change.roomId);
        obj[change.field] = change.value;
    }
}

msgs.createUser = function(user) {
    vue.$store.state.users.push(user);
    showUser(user);
}

msgs.createApp = function(app) {
    vue.$store.state.appInfos[app.id] = app;
    showAppInfos();
    jt.openApp(app.id);
}

msgs.createQueue = function(queue) {
    vue.$store.state.queues.push(queue);
    showQueue(queue);
}

msgs.setSessionId = function(data) {
    var session = findById(vue.$store.state.sessions, data.oldId);
    session.id = data.newId;
    if (vue.$store.state.session.id === data.oldId) {
        vue.$store.state.session.id = data.newId;
        jt.showSessionId(data.newId);
    }
}

msgs.appSaved = function(app) {
    delete vue.$store.state.appInfos[app.origId];
    vue.$store.state.appInfos[app.id] = app;
    var curId = $('#view-app-id').text();
    if (curId === app.origId) {
        jt.openApp(app.id);
    }
}

msgs.addRoomClient = function(client) {
    var room = jt.getRoom(client.roomId);
    for (var i in room.participants) {
        var part = room.participants[i];
        part.roomId = client.roomId;
        if (part.id === client.pId) {
            part.clients.push(client);
            jt.viewRoomUpdateLabel(part);
            return;
        }
    }
}

msgs.removeRoomClient = function(client) {
    var room = jt.getRoom(client.roomId);
    for (var i in room.participants) {
        var part = room.participants[i];
        if (part.id === client.pId) {
            for (var j in part.clients) {
                var cl = part.clients[j];
                if (cl.id === client.cId) {
                    part.clients.splice(j, 1);
                    jt.viewRoomUpdateLabel(part);
                    return;
                }
            }
        }
    }
}

msgs.openSession = function(session) {

    for (let i in participantTimers) {
        clearInterval(participantTimers[i]);
    }

    if (session.state == null) {
        session.state = session.initialState;
    }
    const prevSession = vue.$store.state.session;
    vue.$store.state.session = session;
    if (
        objLength(session.state.participants) === 0 && 
        prevSession != null && 
        prevSession.state != null && 
        prevSession.state.participants != null
    ) {
        server.setNumParticipants(objLength(prevSession.state.participants));
    }

    if (prevSession !== undefined && prevSession.id !== session.id) {
        server.reloadClients();
    }

    // localStorage.setItem('sessionId', session.id);
    vue.$store.commit('setSession', session);

    // if (session !== undefined) {
    //     jt.showSessionId(session.id);
    //     var filelink = vue.$store.state.jtreeLocalPath + '/sessions/' + session.id + '.csv';
    //     $('#view-session-results-filelink')
    //         .text(filelink)
    //         .attr('href', 'file:///' + filelink);
    //     showPanel("#panel-session-info");
    //     showParticipants(vue.$store.state.session.participants);
    //     // viewAllParticipants();
    //     updateSessionApps();
    //     jt.updateSessionUsers();
    //     updateAllowNewParts();
    //     jt.updateChartPage();
    //     jt.chartVar('test');
    // }

    // $('#session-participants').removeAttr('hidden');

    // setView('session');
    // jt.view.updateNumParticipants();
    // jt.setSessionView('appqueue');
}

msgs.updateSessionId = function(md) {
    var session = findById(vue.$store.state.sessions, d.sId);
    if (session !== null && session !== undefined) {
        session.users.push(d.uId);
        showSessions();
    }
    if (vue.$store.state.session.id === d.sId) {
        updateSessionUsers();
    }
}

msgs.participantSetAppIndex = function(md) {
    var participant = vue.$store.state.session.participants[md.participantId];
    participant.appIndex = md.appIndex;
    showPlayerCurApp(participant);
}

msgs.participantSetGroupId = function(md) {
    $('.participant-' + safePId(md.participantId) + '-groupId').text(md.groupId);
}

msgs.participantSetPeriodIndex = function(md) {
    var participant = vue.$store.state.session.participants[md.participantId];
    participant.periodIndex = md.periodIndex;
    $('.participant-' + safePId(md.participantId) + '-periodIndex').text(participant.periodIndex+1);
}

msgs.playerSetStageIndex = function(md) {
    try {
        var participant = vue.$store.state.session.participants[md.participantId];
        participant.player.stageIndex = md.stageIndex;
        var app = vue.$store.state.session.apps[participant.appIndex-1];
        if (app == null) {
            return;
        }
        var stage = app.stages[participant.player.stageIndex];
        var stageText = '';
        if (stage !== undefined) {
            stageText = stage.id;
        }
        $('.participant-' + safePId(md.participantId) + '-stageId').text(stageText);
    } catch (err) {}
}
msgs.participantSetPlayer = function(md) {
    var participant = vue.$store.state.session.participants[md.participantId];
    participant.player = md.player;
    $('.participant-' + safePId(md.participantId) + '-groupId').text(participant.player.group.id);
}
msgs.playerUpdate = function(player) {
//    var decompId = decomposeId(player.roomId);
//    if (decompId.sessionId === vue.$store.state.session.id) {
    if (player.group.period.app.session.id === vue.$store.state.session.id) {
                var div = $('tr.participant-' + safePId(player.id));

        // Re-establish object links.
        player.participant.session = player.group.period.app.session;
        if (player.stage !== undefined) {
            player.stage.app = player.group.period.app;
        }
        player.participant.player = player;

        vue.$store.state.session.participants[player.id] = player.participant;

        setParticipantPlayer(player.id, player, div);
//        $('.participant-' + player.id + '-periodIndex').text(decompId.periodId);
        $('.participant-' + safePId(player.id) + '-periodIndex').text(player.group.period.id);
    }
}

msgs.refreshAdmin = function(ag) {
    refresh(ag);
}

msgs.sessionAddApp = function(d) {
    if (vue.$store.state.session.id === d.sId) {
        vue.$store.state.session.apps.push(d.app);
        updateSessionApps();
    }
    var session = findById(vue.$store.state.sessions, d.sId);
    if (session !== null && session !== undefined) {
        session.appSequence.push(d.app.id);
        session.numApps++;
        showSessions();
    }
};

msgs.sessionAddUser = function(d) {
    var session = findById(vue.$store.state.sessions, d.sId);
    if (session !== null && session !== undefined) {
        session.users.push(d.uId);
        showSessions();
    }
    if (vue.$store.state.session.id === d.sId) {
        updateSessionUsers();
    }
}

msgs.roomAddApp = function(d) {
    var room = jt.getRoom(d.roomId);
    room.apps.push(d.appId);
    jt.viewRoomShowApp(d.appId);
};

msgs.deleteQueue = function(id) {
    for (var i=0; i<vue.$store.state.queues.length; i++) {
        if (vue.$store.state.queues[i].id === id) {
            vue.$store.state.queues.splice(i, 1);
        }
    }
    $('#view-queues-table').find('[queueId="' + id + '"]').remove();
    if ($('#view-queue-id').text() === id) {
        setView('queues');
    }
}

msgs.deleteApp = function(id) {
    for (var i=0; i<vue.$store.state.appInfos.length; i++) {
        if (vue.$store.state.appInfos[i].id === id) {
            vue.$store.state.appInfos.splice(i, 1);
        }
    }
    $('#appInfos').find('[appid="' + id + '"]').remove();
    if ($('#view-app-id').text() === id) {
        setView('apps');
    }
}

msgs.queueAddApp = function(d) {
    var queue = jt.queue(d.queueId);
    queue.apps.push(d.app);
    jt.viewQueueShowApp(d.app);
};

msgs.sessionSetActive = function(msgData) {
    if (vue.$store.state.session.id === msgData.sId) {
        vue.$store.state.session.active = msgData.active;
        updateSessionActive(vue.$store.state.session);
    }
    var session = findById(vue.$store.state.sessions, msgData.sId);
    if (session !== null) {
        session.active = msgData.active;
        showSessions();
    }
}

msgs.sessionSetRunning = function(msgData) {
    if (vue.$store.state.session.id === msgData.sId) {
        vue.$store.state.session.isRunning = msgData.isRunning;
        updateSessionRunning(vue.$store.state.session);
    }
    var session = findById(vue.$store.state.sessions, msgData.sId);
    if (session !== null) {
        session.canPlay = msgData.canPlay;
        showSessions();
    }
}

msgs.sessionDeleteApp = function(md) {
    if (vue.$store.state.session.id === md.sId &&
        vue.$store.state.session.apps[md.i].id === md.aId) {
            vue.$store.state.session.apps.splice(md.i, 1);
            updateSessionApps();
    }
}

msgs.sessionDeleteParticipant = function(md) {
    if (vue.$store.state.session.id === md.sId) {
        vue.$store.commit('deleteParticipant', md.pId);
    }
}

msgs.addParticipant = function(participant) {
    if (vue.$store.state.session != null && participant.session.id === vue.$store.state.session.id) {
        console.log('add participant: ' + participant);
        vue.$set(vue.$store.state.session.participants, participant.id, participant);
    }
}

msgs.setAllowNewParts = function(md) {
    if (vue.$store.state.session.id === md.sId) {
        vue.$store.state.session.allowNewParts = md.value;
        updateAllowNewParts();
    }
};

msgs.setCaseSensitiveLabels = function(md) {
    if (vue.$store.state.session.id === md.sId) {
        vue.$store.state.session.caseSensitiveLabels = md.value;
        jt.updateCaseSensitiveLabels();
    }
};
