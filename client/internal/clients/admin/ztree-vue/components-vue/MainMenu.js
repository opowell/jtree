import MenuEl from './MenuEl.js';

// shortcuts are bound automatically.
let menus = [
  {
      id: 'activePanel',
      icon: 'fa fa-align-center',
      isActive: false,
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
      icon: 'far fa-window-minimize',
      isActive: false
  },
  {
      id: 'restorePanel',
      icon: 'far fa-window-restore',
      fn: 'jt.restorePanelEv(event);',
      isActive: false
  },
  {
      id: 'closePanel',
      icon: 'far fa-window-close',
      fn: 'jt.closeFocussedPanel();',
      isActive: false
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
    `
  };
