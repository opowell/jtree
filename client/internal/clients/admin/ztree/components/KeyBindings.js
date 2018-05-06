// In Chrome, cannot override Ctrl-N, Ctrl-Shift-N, Ctrl-T, Ctrl-Shift-T, Ctrl-W
// https://github.com/liftoff/GateOne/issues/290

jt.keyBindings = [
    ['Ctrl+B',      'jt.TreatmentPanel();'      ],
    ['Ctrl+O',      'jt.openTreatment();'       ],
    ['Ctrl+L',      'jt.closeFocussedPanel();'  ],
    ['Ctrl+Z',      'jt.undo();'                ],
    ['Ctrl+X',      'jt.cut();'                 ],
    ['Ctrl+C',      'jt.copy();'                ],
    ['Ctrl+V',      'jt.paste();'               ],
    ['Ctrl+F',      'jt.find();'                ],
    ['Ctrl+G',      'jt.findNext();'            ],
    ['Ctrl+F6',     'jt.focusNextPanel(event);' ],
    ['F5',          'jt.startTreatment();'      ],
    ['esc',         'jt.closeModal();'          ]
]

jt.bindKey = function(item) {
    console.log('binding ' + item.key + ' to ' + item.fn);
    $(document).bind('keydown', item.key, function(event) {
        console.log('binding ' + item.key + ' to ' + item.fn);
        event.preventDefault();
        event.stopPropagation();
        jt.closeMenu();
        eval(item.fn);
        return false;
    });
}

jt.openTreatment = function() {
    // $("#openFileDialog").trigger("click");
    var selectAppFn = function() {
        var optionEls = $(this).find('[app-option-name]');
        var options = jt.deriveAppOptions(optionEls);
        server.sessionAddApp($(this).data('appId'), options);
    }
    jt.showSelectAppModal('Open Treatment', selectAppFn);
}

for (var i in jt.keyBindings) {
    var key = jt.keyBindings[i][0];
    var fn = jt.keyBindings[i][1];
    var item = {key: key, fn: fn};
    jt.bindKey(item);
}
