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
        jt.focusPanel($(event.target).closest('.jt-panel'));
    }
}

jt.focusPanel = function(el) {

    el = $(el);

    if (el.attr('aligned') == null) {
        el.attr('aligned', 'yes');
        el.css('z-index', jt.zIndex);
        jt.zIndex++;
        el.css('top', jt.panelCount*28 + 'px');
        el.css('left', jt.panelCount*28 + 'px');
        jt.panelCount++;
    }

    var panel = $(el).closest('.jt-panel');
    let thisZ = $(el).css('z-index')-0;
    let maxZ = jt.getMaxZ('.jt-panel');

    let panels = $('.jt-panel');
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

jt.panelEnlarge = function(event) {
    var panel = $(event.target).closest('.jt-panel');
    if (panel.hasClass('panel-minimized')) {
        jt.restorePanelEv(event);
    } else {
        jt.maxPanelEv(event);
    }
}

jt.minimizePanelEv = function(event) {
    event.stopPropagation();
    event.preventDefault();
    jt.closeMenu();
    var panel = $(event.target).closest('.jt-panel');
    panel.removeClass('panel-max');
    panel.addClass('panel-minimized');
}

jt.maxPanelEv = function(event) {
    event.stopPropagation();
    event.preventDefault();
    jt.focusPanelEv(event);
    $('.jt-panel').removeClass('panel-minimized');
    $('.jt-panel').addClass('panel-max');
    $('#menu-activePanel').addClass('menu-active');
    $('#menu-minPanel').addClass('menu-active');
    $('#menu-restorePanel').addClass('menu-active');
    $('#menu-closePanel').addClass('menu-active');
    jt.closeMenu();
}

jt.restorePanelEv = function(event) {
    if (event != null) {
        event.stopPropagation();
        event.preventDefault();
    }
    $('.jt-panel').removeClass('panel-max');
    $('.jt-panel').removeClass('panel-minimized');
    $('#menu-activePanel').removeClass('menu-active');
    $('#menu-minPanel').removeClass('menu-active');
    $('#menu-restorePanel').removeClass('menu-active');
    $('#menu-closePanel').removeClass('menu-active');
    jt.closeMenu();
}

jt.closePanelEv = function(event) {
    event.stopPropagation();
    event.preventDefault();
    jt.closePanel(event.target);
}

jt.focusNextPanel = function(ev) {
    ev.stopPropagation();
    ev.preventDefault();

    // Change z-Index of current panel to minZIndex - 1.
    var minZ = jt.getMinZ('.jt-panel');
    console.log('sending focussed panel to the back, minZ=' + minZ);
    $('.focussed-panel').css('z-index', minZ - 1);

    // Focus panel with largest zIndex.
    jt.focusHighestPanel();

    // Increment all z-indexes up by 1.
    let panels = $('.jt-panel');
    for (let i=0; i<panels.length; i++) {
        var panel2 = panels[i];
        $(panel2).css('z-index', $(panel2).css('z-index')-0+1);
    }
}

jt.closePanel = function(el) {
    let panel = $(el).closest('.jt-panel');
    if (panel.attr('jt-permanent')=='yes') {
        panel.hide();
    } else {
        panel.remove();
    }
    document.title = 'jtree';
    jt.focusHighestPanel();
}

jt.focusHighestPanel = function() {
    var panels = $('.jt-panel');
    if (panels.length > 0) {
        var maxZ = jt.getMaxZ('.jt-panel');
        for (let i=0; i<panels.length; i++) {
            var panel = panels[i];
            if ($(panel).css('z-index') >= maxZ) {
                jt.focusPanel(panel);
                break;
            }
        }
    } else {
        jt.restorePanelEv();
    }
}

jt.getMaxZ = function(selector){
    return Math.max.apply(null, $(selector).map(function(){
        var z;
        return isNaN(z = parseInt($(this).css("z-index"), 10)) ? 0 : z;
    }));
};

jt.getMinZ = function(selector){
    return Math.min.apply(null, $(selector).map(function(){
        var z;
        return isNaN(z = parseInt($(this).css("z-index"), 10)) ? 0 : z;
    }));
};

window.customElements.define('jt-panel', JTPanel);

delete $.ui.resizable.prototype.options.zIndex;
