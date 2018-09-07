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
    panel.find('.panel-title-text').text('Clients ({{clients.length}})');
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
    let content = panel.find('panel-content');
    content.html(`
        <table id='clients'>
            <tr>
                <th>id</th>
                <th>state</th>
                <th>time</th>
                <th>link</th>
            </tr>
            <tr is='client-row' v-for='client in clients' :client='client'>
            </tr>
        </table>
    `);
    panel.show();

    const store = new Vuex.Store({
        state: {
          count: 0
        },
        mutations: {
          increment (state) {
            state.count++
          }
        }
      })

    new Vue({
        el: panel.find('.panel-title-text')[0],
        data: jt.models
    });

    jt.vue = new Vue({
        el: '#clients',
        data: jt.models
    });

    jt.Panel_Clients_loadAndShow();
}

jt.Panel_Clients_loadAndShow = function(sessionId) {
    jt.socket.emit("getClients", {sessionId: sessionId, cb: "jt.Panel_Clients_show(message.clients)"});
}

jt.Panel_Clients_show = function(clients) {
    for (let i in clients) {
        jt.models.clients.push(clients[i]);
    }
};
