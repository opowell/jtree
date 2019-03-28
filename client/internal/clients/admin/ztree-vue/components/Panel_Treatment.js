jt.Panel_Treatment_NewCount = 1;

jt.Panel_Treatment = function(app) {

    var trmtDiv = $('<jt-panel>');
    trmtDiv.attr('panel-type', 'treatment-panel');
    $('#content-window').append(trmtDiv);

    trmtDiv.attr('treatment-id', app.id);
    trmtDiv.attr('treatment-path', app.appPath);

    trmtDiv.resizable({
        handles: "all"
    });
    trmtDiv.draggable({
        containment : "#content-window",
        handle: "panel-title"
    });
    trmtDiv.find('.menu-text .fa').addClass('fa-align-center');
    let updateTree = false;
    var title = '';
    if (app.id == null) {
        title = 'Untitled Treatment ' + jt.Panel_Treatment_NewCount;
        jt.Panel_Treatment_NewCount++;
    } else {
        // updateTree = true;
        updateTree = false;

        // No path in app title.
        //var lastIndex = app.appPath.lastIndexOf('\\');
        //title = app.appPath.substring(lastIndex+1);

        // Show path in app title.
        title = app.appPath;
    }
    trmtDiv.find('.panel-title-text').text(title);
    trmtDiv.css('top', jt.panelCount*28 + 'px');
    trmtDiv.css('left', jt.panelCount*28 + 'px');

    jt.panelCount++;

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
    .bind('keydown', 'down', function(e) {
        e.stopPropagation();
        var activeNodeId = $('.jstree-hovered').attr('id');
        console.log('key down, selecting ' + activeNodeId);
        $(e.target).closest('jt-panel').jstree('select_node', activeNodeId);
        return false;
    })
    .on("dblclick.jstree", function (event, data) {
        var tree = $(this).jstree();
        var node = tree.get_node(event.target);
        tree.edit(node);
        console.log('double click' + JSON.stringify(node));
        const app = $(this).data('app');
        switch (node.text) {
            case 'Background':
                jt.Modal_AppProperties_show(app);
                break;
            case 'Active screen':
                jt.Modal_HTMLEditor_EditStageActiveScreen(node.data);
                break;
        }
    })
    .on('ready.jstree', function(e, data) {
        trmtDiv.find('a').dblclick(function (ev) {
            var node = $(ev.target).closest("li");
            var type = node.attr('rel');
            var item = node[0].id;
            console.log('dblclick' + item);
            jt.showModal('table');
        })
    });

    if ($('jt-panel').hasClass('panel-max')) {
        trmtDiv.addClass('panel-max');
    }

    trmtDiv.find('panel-content').jstree({
        "core" : {
            "multiple" : false,
            "animation" : 0,
            'data': [],
            'dblclick_toggle': false
        },
        "types" : {
            "background" : {
                "icon" : "fas fa-tree",
            },
            "table" : {
                "icon" : "far fa-hdd",
            },
            'field': {
                'icon': 'fas fa-greater-than'
            },
            "function": {
                'icon': 'fab fa-facebook-f'
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

    if (updateTree) {
        jt.updateAppPreview(app.id);
    } else {
        let appData = [];
        jt.Panel_Treatment_SetTree(trmtDiv.find('panel-content'), app);
    }

}

jt.Panel_Treatment_SetTreeId = function(appPath, appData) {
    let safeAppPath = appPath.replace(/\\/, "\\\\");
    let panel = $('[panel-type=treatment-panel][treatment-path="' + safeAppPath + '"]').find('panel-content');
    jt.Panel_Treatment_SetTree(panel, appData);
}

jt.Panel_Treatment_SetTree = function(panel, appData) {
    $(panel).jstree(true).settings.core.data = jt.getTreeFromApp(appData);
    $(panel).data('app', appData);
    $(panel).jstree(true).refresh();
}

jt.getTreeFromApp = function(app) {
    const out = [
        {
            "text":"Background",
            "type":"background",
            "state":{
                "opened": true,
                'selected': true
            },
            "children": [
                // {
                //     'id': 'abc',
                //     "text":"Properties",
                //     "type":"table",
                //     "children": [
                //
                //     ]
                // },
                {
                    "text": "Active screen",
                    "type": "screen",
                },
                {
                    "text": "Waiting screen",
                    "type": "screen",
                }
            ]
        }
    ];

    // const appFieldsToSkip = ['id', 'stages', 'options', 'periods', 'indexInSession'];
    // for (var i in app) {
    //     if (!appFieldsToSkip.includes(i)) {
    //         let name = i;
    //         let type = 'field';
    //         if (i.startsWith('__func_')) {
    //             name = i.slice('__func_'.length);
    //             type = 'function';
    //         }
    //         out[0].children[0].children.push({
    //             "text": name,
    //             "type": type
    //         });
    //     }
    // }

    if (app.stages != null) {
        for (let i=0; i<app.stages.length; i++) {
            let stage = app.stages[i];
            var stageOut = {
                "id": "stage_" + stage.id,
                'data': stage,
                "text": stage.id,
                "type": "background",
                "children": [
                    {
                        'id': 'properties',
                        'text': 'Properties',
                        'type': 'table'
                    },
                    {
                        'id': 'stage_' + stage.id + '_active-screen',
                        'data': stage,
                        'text': 'Active screen',
                        'type': 'screen'
                    },
                    {
                        'id': 'stage_' + stage.id + '_waiting-screen',
                        'data': stage,
                        'text': 'Waiting screen',
                        'type': 'screen'
                    }
                ]
            }
            out.push(stageOut);
        }
    }

    return out;
}


//         var treeData = [
                //     {
                //         "text":"Background",
                //         "type":"background",
                //         "state":{
                //             "opened": true,
                //             'selected': true
                //         },
                //         "children": [
                //             {
                //                 'id': 'abc',
                //                 "text":"globals",
                //                 "type":"table",
                //             },
                //             {
                //                 "text":"subjects",
                //                 "type":"table",
                //             },
                //             {
                //                 "text":"summary",
                //                 "type":"table",
                //             },
                //             {
                //                 "text":"contracts",
                //                 "type":"table",
                //             },
                //             {
                //                 "text":"session",
                //                 "type":"table",
                //             },
                //             {
                //                 "text":"logfile",
                //                 "type":"table",
                //             },
                //             {
                //                 "text": "Active screen",
                //                 "type": "screen",
                //                 'state': {
                //                     'opened': true
                //                 },
                //                 'children': [
                //                     {
                //                         'text': 'Header',
                //                         'type': 'header-box'
                //                     }
                //                 ]
                //             },
                //             {
                //                 "text":"Waiting screen",
                //                 "type":"screen",
                //                 'state': {
                //                     'opened': true
                //                 },
                //                 'children': [
                //                     {
                //                         'text': 'Text',
                //                         'type': 'standard-box',
                //                         'state': {
                //                             'opened': true
                //                         },
                //                         'children': [
                //                             {
                //                                 'text': 'Please wait for the experiment to continue.',
                //                                 'type': 'item'
                //                             }
                //                         ]
                //                     }
                //                 ]
                //             },
                //         ]
                //     }
                // ];
