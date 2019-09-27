jt.getRoom = function(roomId) {
    for (var r in jt.data.rooms) {
        if (jt.data.rooms[r].id === roomId) {
            return jt.data.rooms[r];
        }
    }
    return null;
}

jt.queue = function(id) {
    for (var r in jt.data.queues) {
        if (jt.data.queues[r].id === id) {
            return jt.data.queues[r];
        }
    }
    return null;
}

jt.app = function(appId) {
    return jt.data.appInfos[appId];
}
