
/**
 * Emitted message names should correspond to a message in server/core/Msgs.js.
 */

var server = {};

// SERVER CALLS
//server.refresh      = function()    { jt.socket.emit('refresh-admin'    , ''); }
server.getVar       = function(a)   { jt.socket.emit('get-var'          , a ); }
server.getApp       = function(id)  { jt.socket.emit('get-app'          , id); }
server.getRoom      = function(id)  { jt.socket.emit('get-room'         , id); }
server.refreshApps  = function()    { jt.socket.emit('refresh-apps'     , ''); }
server.addAppFolder = function(f)   { jt.socket.emit('add-app-folder'   , f); }
server.createRoom   = function(id)  { jt.socket.emit('createRoom'      , id); }
server.createApp   = function(id, cb)  { jt.socket.emit('createApp'      , id, cb); }
server.createQueue   = function(id)  { jt.socket.emit('createQueue'      , id); }
server.saveRoom     = function(room) { jt.socket.emit('saveRoom', room); }
server.startSessionFromQueue = function(id, opts) { 
    jt.socket.emit(
        'startSessionFromQueue', 
        {
            qId: id, 
            userId: Cookies.get('userId'),
            options: opts
        }
    );
}
server.createAppFromFile    = function(fn, contents) { jt.socket.emit('createAppFromFile', {fn: fn, contents: contents})}
server.saveOutput = function() { jt.socket.emit('saveOutput', jt.data.session.id); }
server.deleteQueue = function(id) { jt.socket.emit('deleteQueue', id); }
server.setSessionId = function(oldId, newId) { jt.socket.emit('setSessionId', {oldId: oldId, newId: newId}); }
server.renameApp    = function(originalId, newId, cb) {
    jt.socket.emit('renameApp', {originalId, newId}, cb);
}

server.sendMessages = function(data) {
    jt.socket.emit('messages', data);
}

server.setAllowAdminPlay = function(val) {
    let d = {};
    d.sessionId = jt.data.session.id;
    d.val = val;
    jt.socket.emit('setAllowAdminPlay', d);
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
    var d = {appId: id, sId: jt.data.session.id, options: options};
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

server.setNumParticipants = function(amt, cb) {
    var d = {};
    d.sId = jt.data.session.id;
    d.number = amt;
    jt.socket.emit('setNumParticipants', d, cb);
    $('#setNumParticipantsModal').modal('hide');
}

server.setSessionOption = function(obj, cb) {
    jt.socket.emit('setSessionOption', obj, cb);
}

server.resetSession = function(cb) {
    var d = {};
    d.sId = jt.data.session.id;
    jt.disableButton('resetSessionBtn', '<i class="fas fa-undo-alt"></i>&nbsp;&nbsp;Resetting...');
    let activateBtn = function() {
        jt.enableButton('resetSessionBtn',  '<i class="fas fa-undo-alt"></i>&nbsp;&nbsp;Reset');
        jt.popupMessage('Reset session <b>' + d.sId + '</b>.');
    }
    jt.socket.emit('resetSession', d, activateBtn);
}
