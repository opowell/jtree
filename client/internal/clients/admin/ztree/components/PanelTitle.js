class PanelTitle extends HTMLElement {
    connectedCallback() {
      this.innerHTML = `
        <div class='panel-title-div' ondblclick='jt.panelEnlarge(event);'>
            <div class='panel-title-text'>Panel title</div>
            <div class='panel-title-control far fa-window-minimize' onclick='jt.minimizePanelEv(event);'></div>
            <div class='panel-title-control far fa-window-restore' onclick='jt.restorePanelEv(event);'></div>
            <div class='panel-title-control far fa-window-maximize' onclick='jt.maxPanelEv(event);'></div>
            <div class='panel-title-control far fa-window-close' onclick='jt.closePanelEv(event);'></div>
        </div>
      `;

      var menuDefn = {
          id: "panelTitle",
          icon: "fa",
          children: [
              {
                  id: "Restore",
                  fn: "jt.restorePanelEv(event);",
                  icon: 'far fa-window-restore'
              },
              {
                  id: "Maximize",
                  fn: "jt.maxPanelEv(event);",
                  icon: 'far fa-window-maximize'
              },
              {
                  id: "Minimize",
                  fn: "jt.minimizePanelEv(event);",
                  icon: 'far fa-window-minimize'
              },
              'divider',
              {
                  id: 'Close',
                  key: 'Ctrl+L',
                  icon: 'far fa-window-close'
              },
              'divider',
              {
                  id: 'Next',
                  key: 'Ctrl+F6',
                  fn: 'jt.focusNextPanel(event);'
              }
          ]
      }

      var focusOnHover = false;
      var icon = jt.MenuEl(menuDefn, focusOnHover);
      icon.dblclick(function(event) {
          jt.closePanelEv(event);
      })
      icon.addClass('panel-title-icon');
      $(this).find('.panel-title-div').prepend(icon);
    }
}

jt.panelEnlarge = function(event) {
    var panel = $(event.target).closest('jt-panel');
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
    var panel = $(event.target).closest('jt-panel');
    panel.removeClass('panel-max');
    panel.addClass('panel-minimized');
}

jt.maxPanelEv = function(event) {
    event.stopPropagation();
    event.preventDefault();
    jt.focusPanelEv(event);
    $('jt-panel').removeClass('panel-minimized');
    $('jt-panel').addClass('panel-max');
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
    $('jt-panel').removeClass('panel-max');
    $('jt-panel').removeClass('panel-minimized');
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
    var minZ = jt.getMinZ('jt-panel');
    console.log('sending focussed panel to the back, minZ=' + minZ);
    $('.focussed-panel').css('z-index', minZ - 1);

    // Focus panel with largest zIndex.
    jt.focusHighestPanel();

    // Increment all z-indexes up by 1.
    let panels = $('jt-panel');
    for (let i=0; i<panels.length; i++) {
        var panel2 = panels[i];
        $(panel2).css('z-index', $(panel2).css('z-index')-0+1);
    }
}

jt.closePanel = function(el) {
    let panel = $(el).closest('jt-panel');
    if (panel.attr('jt-permanent')=='yes') {
        panel.hide();
    } else {
        panel.remove();
    }
    document.title = 'jtree';
    jt.focusHighestPanel();
}

jt.focusHighestPanel = function() {
    var panels = $('jt-panel');
    if (panels.length > 0) {
        var maxZ = jt.getMaxZ('jt-panel');
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

window.customElements.define('panel-title', PanelTitle);

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
