class JTPanel extends HTMLElement {

    constructor() {
        super();
        this.innerHTML = `
          <panel-title>
          </panel-title>
          <panel-content>
          </panel-content>
        `;
        this.classList.add('jt-panel');
        $(this).css('z-index', jt.zIndex);
        jt.zIndex++;
        $(this).click(function() {
            jt.focusPanelEv(event);
        });
        $(this).mousedown(function() {
            jt.focusPanelEv(event);
        });
    }

    connectedCallback() {
      jt.focusPanel(this);
    }

  setTitle(x) {
  }
}

jt.zIndex = 10;

jt.focusPanelEv = function(event) {
    if (event != null) {
        jt.focusPanel($(event.target).closest('jt-panel'));
    }
}

jt.focusPanel = function(el) {

    var panel = $(el).closest('jt-panel');
    let thisZ = $(el).css('z-index')-0;
    let maxZ = jt.getMaxZ('jt-panel');

    let panels = $('jt-panel');
    for (let i=0; i<panels.length; i++) {
        var panel2 = panels[i];
        if ($(panel2).css('z-index') > thisZ) {
            $(panel2).css('z-index', $(panel2).css('z-index')-1);
        }
    }

    if (!panel.hasClass('focussed-panel')) {
        $('.focussed-panel').removeClass('focussed-panel');
        panel.addClass('focussed-panel');
        panel.css('z-index', maxZ);
    }
    document.title = 'jtree - ' + $(el).find('.panel-title-text').text();
    // if (panel.attr('panel-type') === 'treatment-panel') {
    //     panel.find('panel-content').jstree("deselect_all");
    //     panel.find('panel-content').jstree('select_node', 'abc');
    //     panel.find('#abc-anchor').focus();
    // }
}

window.customElements.define('jt-panel', JTPanel);

delete $.ui.resizable.prototype.options.zIndex;
