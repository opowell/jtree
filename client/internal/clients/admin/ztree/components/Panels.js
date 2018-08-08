jt.panelCount = 1;

jt.startTreatment = function() {
    let panel = $('jt-panel.focussed-panel');
    // var optionEls = $(this).find('[app-option-name]');
    // var options = jt.deriveAppOptions(optionEls);
    let options = {};
    let appPath = panel.find('panel-content').data('app').appPath;
    // server.sessionAddApp(appPath, options);
    server.createSessionAndAddApp(appPath, options);
}
