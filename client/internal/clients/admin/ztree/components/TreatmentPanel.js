jt.newTreatmentCount = 1;

jt.TreatmentPanel = function() {
    var trmtDiv = $('<jt-panel>');
    trmtDiv.attr('panel-type', 'treatment-panel');
    $('#content-window').append(trmtDiv);

    trmtDiv.resizable({
        handles: "all"
    });
    trmtDiv.draggable({
        containment : "#content-window",
        handle: "panel-title"
    });
    trmtDiv.find('.menu-text .fa').addClass('fa-align-center');
    trmtDiv.find('.panel-title-text').text('Untitled Treatment ' + jt.newTreatmentCount);
    trmtDiv.css('top', jt.newTreatmentCount*28 + 'px');
    trmtDiv.css('left', jt.newTreatmentCount*28 + 'px');
    jt.newTreatmentCount++;

    var treeData = [
        {
            "text":"Background",
            "type":"background",
            "state":{
                "opened": true,
                'selected': true
            },
            "children": [
                {
                    'id': 'abc',
                    "text":"globals",
                    "type":"table",
                },
                {
                    "text":"subjects",
                    "type":"table",
                },
                {
                    "text":"summary",
                    "type":"table",
                },
                {
                    "text":"contracts",
                    "type":"table",
                },
                {
                    "text":"session",
                    "type":"table",
                },
                {
                    "text":"logfile",
                    "type":"table",
                },
                {
                    "text": "Active screen",
                    "type": "screen",
                    'state': {
                        'opened': true
                    },
                    'children': [
                        {
                            'text': 'Header',
                            'type': 'header-box'
                        }
                    ]
                },
                {
                    "text":"Waiting screen",
                    "type":"screen",
                    'state': {
                        'opened': true
                    },
                    'children': [
                        {
                            'text': 'Text',
                            'type': 'standard-box',
                            'state': {
                                'opened': true
                            },
                            'children': [
                                {
                                    'text': 'Please wait for the experiment to continue.',
                                    'type': 'item'
                                }
                            ]
                        }
                    ]
                },
            ]
        }
    ];

    trmtDiv.find('panel-content').bind('loaded.jstree', function(e, data) {
        // invoked after jstree has loaded
        jt.focusPanel(trmtDiv);
    });

    trmtDiv.find('panel-content')
    // .on('activate_node.jstree', function (e, data) {
    //     console.log('activate node');
    // })
    // .on('select_node.jstree', function (e, data) {
    //     console.log('select node');
    // })
    // .on('hover_node.jstree', function (e, data) {
    //     console.log('hover node');
    // })
    // .bind('keydown', 'down', function(e) {
    //     e.stopPropagation();
    //     console.log('key down');
    //     var activeNodeId = $('.jstree-hovered').attr('id');
    //     $(e.target).closest('jt-panel').jstree('select_node', activeNodeId);
    //     return false;
    // })
    .jstree({
        "core" : {
            "multiple" : false,
            "animation" : 0,
            'data': treeData
        },
        "types" : {
            "background" : {
                "icon" : "fas fa-tree",
            },
            "table" : {
                "icon" : "far fa-hdd",
            },
            "screen" : {
                "icon" : "fas fa-desktop",
            },
            "header-box" : {
                "icon" : "far fa-window-maximize",
            },
            "standard-box" : {
                "icon" : "far fa-square",
            },
            "item" : {
                "icon" : "far fa-bookmark",
            }
        },
        "plugins" : [
            "types"
        ]
    });


    trmtDiv.find('panel-content').on('changed.jstree', function (e, data) {
        var i, j, r = [];
        for(i = 0, j = data.selected.length; i < j; i++) {
          r.push(data.instance.get_node(data.selected[i]).text);
        }
        console.log('Selected: ' + r.join(', '));
    });

    if ($('jt-panel').hasClass('panel-max')) {
        trmtDiv.addClass('panel-max');
    }
}
