import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate'

Vue.use(Vuex)

export default new Vuex.Store({
  plugins: [createPersistedState({
    paths: [
      'panelsMaximized',
      'windowsMaximized',
      'panelDescs',
      'windowDescs',
      'appName',
      'nextPanelX',
      'nextPanelY',
      'fontSize',
      'panelFocussedBGColor',
      'panelBGColor',
    ],
  })],
  state: {
    queues: [],
    apps: [],
    isMenuOpen: false,
    activeMenu: null,
    activePanel: null,

    games: [],

    // After panels are mounted, they register here. Order determines z-index.
    panels: [],
    windows: [],

    containerHeight: 5000,
    containerWidth: 5000,
    nextPanelXIncrement: 40,
    nextPanelYIncrement: 40,
    nextPanelId: 0,

    // PERSISTENT SETTINGS
    // must be added to 'paths' option.
    panelsMaximized: true,
    windowsMaximized: true,
    // Meta-data for created panels.
    panelDescs: [],
    windowDescs: [],
    // Language items.
    appName: 'Game',
    panelFocussedBGColor: '#737373',
    panelBGColor: '#b5b5b5',

    // Coordinates of where to open panels.
    nextPanelX: 20,
    nextPanelY: 20,
    fontSize: '10pt',

  },
  mutations: {
    addQueues(state, queues) {
      state.queues.splice(0, state.queues.length);
      for (let q in queues) {
        state.queues.push(queues[q]);
      }
    },
    setApps(state, apps) {
      state.apps.splice(0, state.apps.length);
      for (let q in apps) {
        state.apps.push(apps[q]);
      }
    },
    setFocussedWindow(state, window) {
      let curPos = window.zIndex;
      state.windows.splice(curPos, 1); 
      state.windows.push(window);
      state.activePanel = window;
      state.isMenuOpen = false;
    },
    removePanel(state, panel) {
      for (let i=0; i<state.panelDescs.length; i++) {
        if (state.panelDescs[i].id === panel.panelId) {
          state.panelDescs.splice(i, 1);
          // New active panel, if necessary.
          if (state.windows[state.windows.length-1] === panel) {
            if (state.windows.length > 1) {
              state.activePanel = state.windows[state.windows.length-2];
            }
          }
          return;
        }
      }
    },
    addActivePanel(state, panel) {
      state.activePanel = panel;
      state.windows.push(panel);
    },
    resetPanelIds(state) {
      for (let i=0; i<state.windowDescs.length; i++) {
        state.windowDescs[i].id = state.nextPanelId;
        state.nextPanelId++;
      }
    },
    showPanel(state, panelInfo) {
      panelInfo.id = state.nextPanelId;
      if (state.nextPanelX + panelInfo.w > state.containerWidth) {
        state.nextPanelX = 25;
      }
      if (state.nextPanelY + panelInfo.h > state.containerHeight) {
        state.nextPanelY = 25;
      }
      panelInfo.x = state.nextPanelX;
      panelInfo.y = state.nextPanelY;
      state.nextPanelX += state.nextPanelXIncrement;
      state.nextPanelY += state.nextPanelYIncrement;
      state.nextPanelId++;
      state.panelDescs.push(panelInfo);
    },
    addPanelToActiveWindow(state, panelInfo) {
      for (let i=0; i<state.windowDescs.length; i++) {
        if (state.windowDescs[i].id === state.activePanel.panelId) {
          let area = state.windowDescs[i];
          let jtarea = state.activePanel.$refs.area;
          while (area.areas.length > 0) {
            area = area.areas[0];
            jtarea = jtarea.$refs['area-0'];
          }
          area.panels.push(panelInfo);
          
          jtarea.activePanelInd = area.panels.length - 1;
          break;
        }
      }
    },
    showWindow(state, windowInfo) {
      windowInfo.id = state.nextPanelId;
      if (state.nextPanelX + windowInfo.w > state.containerWidth) {
        state.nextPanelX = 25;
      }
      if (state.nextPanelY + windowInfo.h > state.containerHeight) {
        state.nextPanelY = 25;
      }
      windowInfo.x = state.nextPanelX;
      windowInfo.y = state.nextPanelY;
      state.nextPanelX += state.nextPanelXIncrement;
      state.nextPanelY += state.nextPanelYIncrement;
      state.nextPanelId++;
      state.windowDescs.push(windowInfo);
    },
    savePanelInfo(state, panel) {
      console.log('save panel info');
      for (let i=0; i < state.panelDescs.length; i++) {
        let panelDesc = state.panelDescs[i];
        if (panelDesc.id === panel.panelId) {
          panelDesc.x = panel.left;
          panelDesc.y = panel.top;
          panelDesc.w = panel.width;
          panelDesc.h = panel.height;
          return;
        }
      }
    },
    toggleWindowsMaximized(state) {
      state.windowsMaximized = !state.windowsMaximized;
    },
    setContainerDimensions(state, container) {
      state.containerWidth = container.clientWidth - 5;
      state.containerHeight = container.clientHeight - 5;
    },

  },
  actions: {

  }
})
