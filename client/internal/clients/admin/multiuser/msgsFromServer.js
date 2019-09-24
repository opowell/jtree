// INCOMING MESSAGES FROM SERVER
var msgs = {};
msgs.addSession = function(session) {
  var index = findById(jt.data.sessions, session.id);
  if (index === null) {
      jt.data.sessions.push(session);
      showSessionRow(session);
      jt.showUsersMode(jt.settings.multipleUsers);
  }
}
msgs.deleteSession = function(id) {
    for (i in jt.data.sessions) {
        var session = jt.data.sessions[i];
        if (id === session.id) {
            jt.data.sessions.splice(i, 1);
            i--;
            showSessions();
        }
    }
}

msgs.updateAppPreview = function(appPreview) {
    jt.showAppPreview(appPreview);
}

msgs.reloadApps = function(apps) {
    jt.setApps(apps);
}

msgs.createRoom = function(room) {
    jt.data.rooms.push(room);
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
    jt.data.users.push(user);
    showUser(user);
}

msgs.createApp = function(app) {
    jt.data.appInfos[app.id] = app;
    showAppInfos();
    jt.openApp(app.id);
}

msgs.createQueue = function(queue) {
    jt.data.queues.push(queue);
    showQueue(queue);
}

msgs.setSessionId = function(data) {
    var session = findById(jt.data.sessions, data.oldId);
    session.id = data.newId;
    if (jt.data.session.id === data.oldId) {
        jt.data.session.id = data.newId;
        jt.showSessionId(data.newId);
    }
}

msgs.appSaved = function(app) {
    delete jt.data.appInfos[app.origId];
    jt.data.appInfos[app.id] = app;
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

    const prevSession = jt.data.session;
    jt.data.session = session;
    if (objLength(session.participants) === 0 && prevSession !== undefined) {
        server.setNumParticipants(objLength(prevSession.participants));
    }

    if (prevSession !== undefined && prevSession.id !== session.id) {
        server.reloadClients();
    }

    localStorage.setItem('sessionId', session.id);

    if (session !== undefined) {
        jt.showSessionId(session.id);
        var filelink = jt.data.jtreeLocalPath + '/sessions/' + session.id + '.csv';
        $('#view-session-results-filelink')
            .text(filelink)
            .attr('href', 'file:///' + filelink);
        showPanel("#panel-session-info");
        showParticipants(jt.data.session.participants);
        // viewAllParticipants();
        updateSessionApps();
        jt.updateSessionUsers();
        updateAllowNewParts();
        updateAllowAdminPlay();
        jt.updateChartPage();
        jt.chartVar('test');
    }

    // $('#session-participants').removeAttr('hidden');

    setView('session');
    jt.view.updateNumParticipants();
    jt.setSessionView('appqueue');
}

msgs.addClient = function(md) {
    if (md.session == null || md.session.id == null) {
        return;
    }
    if (md.pId == null) {
        return;
    }

    let participant = jt.data.session.participants[md.pId];

    if (participant == null) {
        return;
    }

    participant.numClients++;

    $('.participant-' + md.pId + '-numClients').text(participant.numClients);
}

msgs.updateSessionId = function(md) {
    var session = findById(jt.data.sessions, d.sId);
    if (session !== null && session !== undefined) {
        session.users.push(d.uId);
        showSessions();
    }
    if (jt.data.session.id === d.sId) {
        updateSessionUsers();
    }
}

msgs.participantSetAppIndex = function(md) {
    var participant = jt.data.session.participants[md.participantId];
    participant.appIndex = md.appIndex;
    showPlayerCurApp(participant);
}

msgs.participantSetGroupId = function(md) {
    $('.participant-' + safePId(md.participantId) + '-groupId').text(md.groupId);
}

msgs.participantSetPeriodIndex = function(md) {
    var participant = jt.data.session.participants[md.participantId];
    participant.periodIndex = md.periodIndex;
    $('.participant-' + safePId(md.participantId) + '-periodIndex').text(participant.periodIndex+1);
}

msgs.playerSetStageIndex = function(md) {
    try {
        var participant = jt.data.session.participants[md.participantId];
        participant.player.stageIndex = md.stageIndex;
        var app = jt.data.session.apps[participant.appIndex-1];
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
    var participant = jt.data.session.participants[md.participantId];
    participant.player = md.player;
    $('.participant-' + safePId(md.participantId) + '-groupId').text(participant.player.group.id);
}
msgs.playerUpdate = function(player) {
//    var decompId = decomposeId(player.roomId);
//    if (decompId.sessionId === jt.data.session.id) {

    player = jt.parse(player);

    if (player.group.period.app.session.id === jt.data.session.id) {
        var div = $('tr.participant-' + safePId(player.id));

        // // Re-establish object links.
        // player.participant.session = player.group.period.app.session;
        // if (player.stage !== undefined) {
        //     player.stage.app = player.group.period.app;
        // }
        // player.participant.player = player;

        jt.data.session.participants[player.id] = player.participant;

        setParticipantPlayer(player.id, player, div);
//        $('.participant-' + player.id + '-periodIndex').text(decompId.periodId);
        $('.participant-' + safePId(player.id) + '-periodIndex').text(player.group.period.id);
    }
}

msgs.refreshAdmin = function(ag) {
    refresh(ag);
}

msgs.sessionAddApp = function(d) {
    if (jt.data.session.id === d.sId) {
        jt.data.session.apps.push(d.app);
        updateSessionApps();
    }
    var session = findById(jt.data.sessions, d.sId);
    if (session !== null && session !== undefined) {
        session.appSequence.push(d.app.id);
        session.numApps++;
        showSessions();
    }
};

msgs.sessionAddUser = function(d) {
    var session = findById(jt.data.sessions, d.sId);
    if (session !== null && session !== undefined) {
        session.users.push(d.uId);
        showSessions();
    }
    if (jt.data.session.id === d.sId) {
        updateSessionUsers();
    }
}

msgs.roomAddApp = function(d) {
    var room = jt.getRoom(d.roomId);
    room.apps.push(d.appId);
    jt.viewRoomShowApp(d.appId);
};

msgs.deleteQueue = function(id) {
    for (var i=0; i<jt.data.queues.length; i++) {
        if (jt.data.queues[i].id === id) {
            jt.data.queues.splice(i, 1);
        }
    }
    $('#view-queues-table').find('[queueId="' + id + '"]').remove();
    if ($('#view-queue-id').text() === id) {
        setView('queues');
    }
}

msgs.deleteApp = function(id) {
    for (var i=0; i<jt.data.appInfos.length; i++) {
        if (jt.data.appInfos[i].id === id) {
            jt.data.appInfos.splice(i, 1);
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
    if (jt.data.session.id === msgData.sId) {
        jt.data.session.active = msgData.active;
        updateSessionActive(jt.data.session);
    }
    var session = findById(jt.data.sessions, msgData.sId);
    if (session !== null) {
        session.active = msgData.active;
        showSessions();
    }
}

msgs.sessionSetRunning = function(msgData) {
    if (jt.data.session.id === msgData.sId) {
        jt.data.session.isRunning = msgData.isRunning;
        updateSessionRunning(jt.data.session);
    }
    var session = findById(jt.data.sessions, msgData.sId);
    if (session !== null) {
        session.canPlay = msgData.canPlay;
        showSessions();
    }
}

msgs.sessionDeleteApp = function(md) {
    if (jt.data.session.id === md.sId &&
        jt.data.session.apps[md.i].id === md.aId) {
            jt.data.session.apps.splice(md.i, 1);
            updateSessionApps();
    }
}

msgs.sessionDeleteParticipant = function(md) {
    if (jt.data.session.id === md.sId) {
        deleteParticipant(md.pId);
        jt.view.updateNumParticipants();
    }
}

msgs.addParticipant = function(participant) {
    if (jt.data.session != null && participant.session.id === jt.data.session.id) {
        console.log('add participant: ' + participant);
        Vue.set(jt.data.session.participants, participant.id, participant);
        showParticipant(participant);
        //        viewParticipant(participant.id);
        jt.view.updateNumParticipants();
    }
}

msgs.setAllowNewParts = function(md) {
    if (jt.data.session.id === md.sId) {
        jt.data.session.allowNewParts = md.value;
        updateAllowNewParts();
    }
};

msgs.setAllowAdminPlay = function(md) {
    if (jt.data.session.id != md.sId) {
        return;
    }
    jt.data.session.allowAdminClientsToPlay = md.value;
    updateAllowAdminPlay();
}

msgs.setCaseSensitiveLabels = function(md) {
    if (jt.data.session.id === md.sId) {
        jt.data.session.caseSensitiveLabels = md.value;
        jt.updateCaseSensitiveLabels();
    }
};
