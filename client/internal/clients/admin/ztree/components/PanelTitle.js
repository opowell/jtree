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

window.customElements.define('panel-title', PanelTitle);
