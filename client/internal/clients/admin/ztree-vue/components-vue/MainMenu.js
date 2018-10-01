import MenuEl from './MenuEl.js';

// shortcuts are bound automatically.
let menus = [
  {
      id: 'activePanel',
      icon: 'fa fa-align-center',
      children: [
          {
              id: 'Restore',
              fn: 'jt.restorePanelEv(event);'
          },
          {
              id: 'Maximize'
          }
      ]
  },
  {
      id: 'File',
      underline: true,
      children: [
          {
              id: 'New Treatment',
              shortcut: 'Ctrl+B',
              fn: 'jt.Panel_Treatment();'
          },
          {
              id: 'Open Treatment...',
              shortcut: 'Ctrl+O',
              fn: 'jt.socket.emit("getAppMetadatas", "jt.showOpenTreatmentModal(message.metadatas)");'
          },
          {
              id: 'Close',
              shortcut: 'Ctrl+L',
              fn: 'jt.closeFocussedPanel();'
          },
          'divider',
          {
              id: 'Save',
              shortcut: 'Ctrl+S',
              fn: 'jt.saveApp();'
          },
          'divider',
          {
              id: 'Apps',
              fn: 'jt.showAppsPanel();'
          },
          {
              id: 'Sessions',
              fn: 'jt.showSessionsPanel();'
          },
      ]
  },
  {
      id: 'Edit',
      underline: true,
      children: [
          {
              id: 'Undo',
              shortcut: 'Ctrl+Z',
              fn: 'jt.undo();'
          },
          'divider',
          {
              id: 'Cut',
              shortcut: 'Ctrl+X',
              fn: 'jt.cut();'
          },
          {
              id: 'Copy',
              shortcut: 'Ctrl+C',
              fn: 'jt.copy();'
          },
          {
              id: 'Paste',
              shortcut: 'Ctrl+V',
              fn: 'jt.paste();'
          },
          'divider',
          {
              id: 'Find...',
              shortcut: 'Ctrl+F',
              fn: 'jt.find();'
          },
          {
              id: 'Find Next',
              shortcut: 'Ctrl+G',
              fn: 'jt.findNext();'
          }
      ]
  },
  {
      id: 'Treatment',
      children: [
          {
              id: 'Info',
              shortcut: 'Ctrl+I',
              fn: 'jt.showTreatmentInfo();'
          },
          {
              id: 'View code',
              shortcut: 'Ctrl+J',
              fn: 'jt.showFocussedTreatmentCode();'
          },
          'divider',
          {
              id: 'New Stage...',
              shortcut: 'Ctrl+Shift+B',
              fn: 'server.appAddStage();'
          },
          {
              id: 'New Table...',
              shortcut: 'Ctrl+??',
              fn: 'jt.copy();'
          },
          {
              id: 'New Box',
              children: [
                  {
                      id: 'Header Box...',
                      fn: 'jt.TreatmentNewHeaderBox();'
                  },
                  {
                      id: 'Standard Box...',
                      fn: 'jt.TreatmentNewStandardBox();'
                  }
              ]
          },
          'divider',
          {
              id: 'Expand All',
              shortcut: 'Ctrl+E',
              fn: 'jt.expandAll();'
          }
      ]
  },
  {
      id: 'Run',
      children: [
          {
              id: 'Clients',
              fn: 'jt.showClientsPanel();'
          },
          {
              id: 'Session Info',
              fn: 'jt.showActiveSession();'
          },
          'divider',
          {
              id: 'Shuffle Clients',
              fn: 'jt.shuffleClients();'
          },
          {
              id: 'Sort Clients',
              fn: 'jt.sortClients();'
          },
          {
              id: 'Save Client Order',
              fn: 'jt.saveClientOrder();'
          },
          'divider',
          {
              id: 'Start Treatment',
              shortcut: 'F5',
              fn: 'jt.startTreatment();'
          },
          'divider',
          {
              id: 'globals Table',
              fn: 'jt.openGlobalsTable();'
          },
          {
              id: 'subjects Table',
              fn: 'jt.openSubjectsTable();'
          },
          {
              id: 'contracts Table',
              fn: 'jt.openContractsTable();'
          },
          {
              id: 'summary Table',
              fn: 'jt.openSummaryTable();'
          },
          {
              id: 'session Table',
              fn: 'jt.openSessionTable();'
          },
          {
              id: 'logfile Table',
              fn: 'jt.openLogFileTable();'
          }

      ]
  },
  {
      id: 'Tools',
      children: [
          {
              id: 'Info',
              fn: 'jt.undo();'
          },
          'divider',
          {
              id: 'New Stage...',
              fn: 'jt.cut();'
          },
          {
              id: 'New Table...',
              fn: 'jt.copy();'
          },
          {
              id: 'New Table Loader...',
              fn: 'jt.paste();'
          }
      ]
  },
  {
      id: 'View',
      children: [
          {
              id: 'Info',
              fn: 'jt.undo();'
          },
          'divider',
          {
              id: 'New Stage...',
              fn: 'jt.cut();'
          },
          {
              id: 'New Table...',
              fn: 'jt.copy();'
          },
          {
              id: 'New Table Loader...',
              fn: 'jt.paste();'
          }
      ]
  },
  {
      id: '?',
      children: [
          {
              id: 'About jtree...',
              fn: 'jt.about();'
          },
          {
              id: 'shortcutboard shortcuts',
              shortcut: 'Ctrl+H',
              fn: 'jt.Modal_shortcutboardShortcuts_show();'
          }
      ]
  },
  {
      id: 'minPanel',
      icon: 'far fa-window-minimize'
  },
  {
      id: 'restorePanel',
      icon: 'far fa-window-restore',
      fn: 'jt.restorePanelEv(event);'
  },
  {
      id: 'closePanel',
      icon: 'far fa-window-close',
      fn: 'jt.closeFocussedPanel();'
  },

]

export default {
    name: 'MainMenu',
    components: {
      MenuEl
    },
    data() {
      return {
        menus,
      };
    },
    template: `
      <div id='jt-menu'>
        <menu-el v-for="menu in menus" :menu='menu' :key='menu.id'></menu-el>
      </div>
    `,
  };

$(document).click(function() {
    jt.closeMenu();
})

jt.closeMenu = function() {
    // console.log('closing menu');
    $('.menu').removeClass('show');
    $('.menu-dropdown').removeClass('show');
    $('.menu-focussed').removeClass('menu-focussed');
    jt.selMenu = null;
    if ($(document.activeElement).closest('.menu').length > 0) {
        document.activeElement.blur();
    }
    $('#jt-menu').removeClass('menubar-focussed');
}

jt.closeMenuItem = function() {
    $('.menudditem').removeClass('show');
    $('.menudditem .menu-dropdown').removeClass('show');
    $('.menudditem .menu-focussed').removeClass('menu-focussed');
    // if ($(document.activeElement).closest('.menu').length > 0) {
    //     document.activeElement.blur();
    // }
    // $('#jt-menu').removeClass('menubar-focussed');
}

jt.openMenu = function(el) {
    jt.closeMenu();
    $(el).addClass('show');
    var menuEl = $(el).find('.menu-text');
    jt.selMenu = menuEl[0];
    menuEl.addClass('menu-focussed');
    menuEl.focus();
    var dropdown = $(el).find('.menu-dropdown')[0];
    $(dropdown).addClass('show');
}

jt.openMenuItem = function(el) {
    jt.closeMenuItem();
    $(el).addClass('show');
    var menuEl = $(el).find('.menu-text');
    jt.selMenu = menuEl[0];
    menuEl.addClass('menu-focussed');
    menuEl.focus();
    var dropdown = $(el).find('.menu-dropdown')[0];
    $(dropdown).addClass('show');
}

jt.registerKeyEvents = function() {

    $(document).bind('keydown', 'alt', function(e) {
        // console.log('pressed alt');
        e.preventDefault();
        jt.toggleMainMenuFocus();
        return false;
    });

}

jt.toggleMainMenuFocus = function() {
    var focMenus = $('.menu-text.menu-focussed');
    // If a menu element has focus, close it and clear focus.
    if (focMenus.length > 0) {
        jt.closeMenu();
    }
    // If no menu is open, focus on first active menu element.
    else {
        jt.focusMenuButton($('#jt-menu .menu-active').find('.menu-text')[0]);
    }
}

jt.selMenu = null;

jt.openSelectedFile = function() {
    var file = $('#openFileDialog')[0].files[0];

    var r = new FileReader();
    r.onload = function(e) {
	    var contents = e.target.result;
        server.createAppFromFile(file.name, contents);
    }
    r.readAsText(file);
}

jt.closeFocussedPanel = function() {
    jt.closePanel($('.focussed-panel'));
}

jt.isMenuFocussed = function() {
    return $('#jt-menu').hasClass('menubar-focussed')
}

jt.focusMenuButton = function(el) {
    jt.selMenu = $(el)[0];
    $(el).addClass('menu-focussed');
    jt.selMenu.focus();
    $('#jt-menu').addClass('menubar-focussed');
}

jt.openMenuName = function(x) {
    $('#menu-' + x).click();
}
