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

    panel.find('panel-content').text('hi!');
    return panel;
}

jt.Panel_Clients_init = function() {
    let panel = jt.Panel_Clients();
}

jt.Panel_Clients_show = function() {
    $('[panel-type=clients-panel]').show();
}
