import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate'

Vue.use(Vuex)

export default new Vuex.Store({
  plugins: [createPersistedState({
    paths: [
      'panelsMaximized',
      'panelDescs',
      'appName',
      'nextPanelX',
      'nextPanelY',
    ],
  })],
  state: {
    queues: [],
    apps: [],
    isMenuOpen: false,
    activeMenu: null,
    activePanel: null,
    // After panels are mounted, they register here. Order determines z-index.
    panels: [],
    containerHeight: 5000,
    containerWidth: 5000,

    // PERSISTENT SETTINGS
    // must be added to 'paths' option.
    panelsMaximized: true,
    // Meta-data for created panels.
    panelDescs: [],
    // Language items.
    appName: 'Game',
    // Coordinates of where to open panels.
    nextPanelX: 25,
    nextPanelY: 25,
    nextPanelId: 0,
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
    removePanel(state, panel) {
      for (let i=0; i<state.panelDescs.length; i++) {
        if (state.panelDescs[i].id === panel.panelId) {
          state.panelDescs.splice(i, 1);
          // New active panel, if necessary.
          if (state.panels[state.panels.length-1] === panel) {
            if (state.panels.length > 1) {
              state.activePanel = state.panels[state.panels.length-2];
            }
          }
          return;
        }
      }
    },
    addActivePanel(state, panel) {
      state.activePanel = panel;
      state.panels.push(panel);
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
      state.nextPanelX += 50;
      state.nextPanelY += 50;
      state.nextPanelId++;
      state.panelDescs.push(panelInfo);
    },
    togglePanelsMaximized(state) {
      state.panelsMaximized = !state.panelsMaximized;
    },
    setContainerDimensions(state, container) {
      state.containerWidth = container.clientWidth - 5;
      state.containerHeight = container.clientHeight - 5;
    },

  },
  actions: {

  }
})
