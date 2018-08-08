jt.Modal_HTMLEditor = function() {
    var out = jt.Modal('html-editor', 'HTML Editor', {draggable: false});

    $('#content-window').append(out);

    var body = out.find('.modal-body');

    let editor = $(`<div id='html-editor' class='jt-editor'></div>`);

    body.append(editor);

    var right = jt.Box_Standard(body);
    jt.Item_Button('OK', function(ev) {
        ev.stopPropagation();
        jt.storeHTML();
        jt.closeModal();
    }, right);

    var cancelBtn = jt.Item_Button('Cancel', function(ev) {
        ev.stopPropagation();
        jt.closeModal();
    }, right);

    ace.edit(editor[0], {
        mode: 'ace/mode/html',
        selectionStyle: 'text',
        autoScrollEditorIntoView: true
    });
};


// jt.Util_ProcessHTMLStr = function(str) {
//
//     while (str.startsWith('\n')) {
//         str = str.substring(1);
//     }
//     str = str.trim();
//
//     var div = document.createElement('div');
//     div.innerHTML = str.trim();
//
//     return jt.Util_FormatHTMLStr(div, 0).innerHTML;
// }
//
// jt.Util_FormatHTMLStr = function(node, level) {
//
//     var indentBefore = new Array(level++ + 1).join('  '),
//         indentAfter  = new Array(level - 1).join('  '),
//         textNode;
//
//     for (var i = 0; i < node.children.length; i++) {
//
//         textNode = document.createTextNode('\n' + indentBefore);
//         node.insertBefore(textNode, node.children[i]);
//
//         jt.Util_FormatHTMLStr(node.children[i], level);
//
//         if (node.lastElementChild == node.children[i]) {
//             textNode = document.createTextNode('\n' + indentAfter);
//             node.appendChild(textNode);
//         }
//     }
//
//     return node;
// }

jt.Modal_HTMLEditor_EditStageActiveScreen = function(stage) {
    var editor = ace.edit('html-editor');

    // Ignore first warning about missing Doc type.
    var session = editor.getSession();
    session.on("changeAnnotation", function () {
        let annotations = session.getAnnotations() || [];
        let i = annotations.length;
        let len = annotations.length;
        while (i--) {
            if (/doctype first\. Expected/.test(annotations[i].text)) {
                annotations.splice(i, 1);
            }
            else if (/Unexpected End of file\. Expected/.test(annotations[i].text)) {
                annotations.splice(i, 1);
            }
        }
        if (len > annotations.length) {
            session.setAnnotations(annotations);
        }
    });

    // var str = jt.Util_ProcessHTMLStr(data);
    // var str = data;
    // while (str.startsWith('\n')) {
    //     str = str.substring(1);
    // }
    //
    // while (str.endsWith('\n')) {
    //     str = str.substring(0, str.length-1);
    // }
    $('#html-editor-modal').find('.modal-title').html('Stage ' + stage.id + ': Active Screen');
    editor.setValue(stage.activeScreen);
    editor.clearSelection();
    editor.moveCursorTo(0, 0);
    editor.focus();
    $('#html-editor-modal').modal('show');
}

jt.Modal_HTMLEditor_init = function() {
    var modal = jt.Modal_HTMLEditor();
}

jt.storeHTML = function() {

}
