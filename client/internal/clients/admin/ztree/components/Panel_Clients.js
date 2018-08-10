jt.addClient = function(client) {
    let table = $('[panel-type=clients-panel] panel-content table');
    let link = partLink(client.pId);
    table.append(`
        <tr>
            <td>${client.pId}</td>
            <td>ready</td>
            <td>-</td>
            <td><a href='http://${link}' target='_blank'>${link}</a></td>
        </tr>
    `);
}

jt.Panel_Clients = function() {

    var panel = $('<jt-panel>');
    $('#content-window').append(panel);
    panel.attr('panel-type', 'clients-panel');
    panel.attr('jt-permanent', 'yes');

    panel.resizable({
        handles: "all"
    });
    panel.draggable({
        containment : "#content-window",
        handle: "panel-title"
    });
    panel.find('.menu-text .fa').addClass('fa-align-center');
    panel.find('.panel-title-text').text('Clients');
    panel.css('top', jt.panelCount*28 + 'px');
    panel.css('left', jt.panelCount*28 + 'px');

    jt.panelCount++;

    jt.focusPanel(panel);

    if ($('jt-panel').hasClass('panel-max')) {
        panel.addClass('panel-max');
    }

    return panel;
}

jt.Panel_Clients_init = function() {
    let panel = jt.Panel_Clients();
    jt.Panel_Clients_loadAndShow();
}

jt.Panel_Clients_loadAndShow = function(sessionId) {
    jt.socket.emit("getClients", {sessionId: sessionId, cb: "jt.Panel_Clients_show(message.clients)"});
}

jt.Panel_Clients_show = function(clients) {
    jt.data.clients = ko.observableArray(clients);
    let panel = $('[panel-type=clients-panel]');
    let content = $('[panel-type=clients-panel] panel-content');
    content.html(`
        <table>
            <tr>
                <th><span data-bind='text: jt.data.clients().length'>number</span> clients</th>
                <th>state</th>
                <th>time</th>
                <th>link</th>
            </tr>
        </table>
    `);
    panel.show();
    for (let i=0; i<clients.length; i++) {
        jt.addClient(clients[i]);
    }

    ko.applyBindings(jt.data.clients);
}
