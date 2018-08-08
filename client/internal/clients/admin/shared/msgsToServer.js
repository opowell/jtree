
/**
 * Emitted message names should correspond to a message in server/core/Msgs.js.
 */

var server = {};

/**
 * SERVER CALLS
 * Corresponds to entries in server/Msgs.js.
 */

server.createRoom   = function(id)  { jt.socket.emit('createRoom'      , id); }
server.createQueue   = function(id)  { jt.socket.emit('createQueue'      , id); }
server.saveRoom     = function(room) { jt.socket.emit('saveRoom', room); }
server.startSessionFromQueue = function(id) { jt.socket.emit('startSessionFromQueue', {qId: id, userId: Cookies.get('userId')}); }
server.createAppFromFile    = function(fn, contents) { jt.socket.emit('createAppFromFile', {fn: fn, contents: contents})}

server.createApp    = function(id)  { jt.socket.emit('createApp'        , id); }

server.appAddStage = function()  {
    var app = $('.focussed-panel').find('.jstree').data('app');
    var iId = 'app';
    jt.socket.emit('appAddStage', {id: app.id, insertionPoint: iId});
}

server.setAppContents = function(appPath, content, cb) {
    jt.socket.emit('setAppContents', {appPath: appPath, content: content, cb: cb});
}

server.deleteQueue = function(id) { jt.socket.emit('deleteQueue', id); }

server.sendMessages = function(data) {
    jt.socket.emit('messages', data);
}

server.setAutoplay = function(pId, b) {
    let d = {};
    d.sId = jt.data.session.id;
    d.pId = pId;
    d.val = b;
    jt.socket.emit('setAutoplay', d);
}

server.setAutoplayForAll = function(b) {
    let d = {};
    d.sId = jt.data.session.id;
    d.val = b;
    jt.socket.emit('setAutoplayForAll', d);
}

server.addParticipants = function() {
    console.log('server.addParticipants');
    var d = {};
    d.sId = jt.data.session.id;
    d.number = $('#addParticipants').val();
    jt.socket.emit('addParticipants', d);
}

server.sessionAddQueue = function(qId) {
    jt.socket.emit('sessionAddQueue', {qId: qId, sId: jt.data.session.id});
}

server.deleteParticipant = function(pId) {
    var d = {sId: jt.data.session.id, pId: pId};
    jt.socket.emit('deleteParticipant', d);
}

server.createSessionAndAddApp = function(appId, options) {
    jt.socket.emit('createSessionAndAddApp', {appId: appId, options: options, userId: Cookies.get('userId')});
}

server.sessionCreate = function() {
    jt.socket.emit('sessionCreate', Cookies.get('userId'));
}

server.sessionDeleteApp = function(data) {
    jt.socket.emit('sessionDeleteApp', data);
}

server.openSession  = function(event) {
    $('#openSessionModal').modal('hide')
    server.openSessionId(event.data.id);
}
server.openSessionId = function(id) {
    var msgs = [];
    var openMsg = {msgName:'openSession', msgData:id}
    msgs.push(openMsg);
    server.sendMessages(msgs);
//    socket.emit('openSession', id);
}

// Overwrite
server.refreshAdmin = function() {
    var userId = Cookies.get('userId');
    jt.socket.emit('refreshAdmin', {sockId: jt.socket.id, userId: userId});
}

server.sessionAddApp = function(id, options) {
    let sId = undefined;
    if (jt.data.session != null) {
        sId = jt.data.session.id;
    }
    var d = {appId: id, sId: sId, options: options};
    jt.socket.emit('sessionAddApp', d);
}

server.roomAddApp = function(id) {
    var roomId = $('#view-room-id').text();
    var d = {appId: id, roomId: roomId};
    jt.socket.emit('roomAddApp', d);
}

server.queueAddApp = function(id, options) {
    var queueId = $('#view-queue-id').text();
    var d = {appId: id, queueId: queueId, options: options};
    jt.socket.emit('queueAddApp', d);
    $('#addAppToQueueModal').modal('hide');
}

server.sessionSetActive = function(b) {
    var d = {active: b, sId: jt.data.session.id};
    jt.socket.emit('session-set-active'  , d);
}
server.deleteSession = function(d) {
    var id = d.data.id;
    jt.socket.emit('deleteSession', id);
}
server.sessionAdvanceSlowest = function() {
    jt.socket.emit('sessionAdvanceSlowest', jt.data.session.id);
}
server.sessionStart = function() {
    jt.socket.emit('sessionStart', jt.data.session.id);
}
server.sessionResume = function() {
    jt.socket.emit('sessionResume', jt.data.session.id);
}
server.sessionPause = function() {
    jt.socket.emit('sessionPause', jt.data.session.id);
}

server.setAllowNewParts = function() {
    var d = {};
    d.sId = jt.data.session.id;
    d.value = $('#allowNewParts')[0].checked;
    jt.socket.emit('setAllowNewParts', d);
}

server.reloadClients = function() {
    jt.socket.emit('reloadClients');
}

server.setNumParticipants = function(amt) {
    var d = {};
    d.sId = jt.data.session.id;
    d.number = amt;
    jt.socket.emit('setNumParticipants', d);
    $('#setNumParticipantsModal').modal('hide');
}
