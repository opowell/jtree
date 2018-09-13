// In Chrome, cannot override Ctrl-N, Ctrl-Shift-N, Ctrl-T, Ctrl-Shift-T, Ctrl-W
// https://github.com/liftoff/GateOne/issues/290

jt.keyBindings = [
    ['Ctrl+F6', 'jt.focusNextPanel(event);'],
    ['Ctrl+L', 'jt.closeFocussedPanel();'],
    ['esc', 'jt.closeModal();'],
];

// List of all keyboard shortcuts.
jt.keyboardShortcuts = [];

// Uses jQuery hotkeys package.
jt.bindKey = function(item) {
//    console.log('binding ' + item.key + ' to ' + item.fn);
    jt.keyboardShortcuts.push({
        key: item.key,
        fn: item.fn
    });
    $(document).bind('keydown', item.key, function(event) {
        console.log('executing ' + item.key + ' for ' + item.fn);
        event.preventDefault();
        event.stopPropagation();
        jt.closeMenu();
        eval(item.fn); // jshint ignore:line
        return false;
    });
};

jt.openTreatment = function(id) {
    var panel = jt.Panel_Treatment(id);
};

for (var i in jt.keyBindings) {
    var key = jt.keyBindings[i][0];
    var fn = jt.keyBindings[i][1];
    var item = {
        key: key,
        fn: fn
    };
    jt.bindKey(item);
}
