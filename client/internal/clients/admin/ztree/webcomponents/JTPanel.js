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
    if (!panel.hasClass('focussed-panel')) {
        $('.focussed-panel').removeClass('focussed-panel');
        panel.addClass('focussed-panel');
        panel.css('z-index', jt.zIndex);
        jt.zIndex++;
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
