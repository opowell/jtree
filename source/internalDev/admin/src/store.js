import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate'

Vue.use(Vuex)

export default new Vuex.Store({
  plugins: [createPersistedState({
    paths: [
      'windowsMaximized',
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
    windows: [],

    containerHeight: 5000,
    containerWidth: 5000,
    nextPanelXIncrement: 40,
    nextPanelYIncrement: 40,
    nextPanelId: 0,

    // PERSISTENT SETTINGS
    // must be added to 'paths' option.
    windowsMaximized: true,
    // Meta-data for created panels.
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
    setActivePanelIndex(state, {index, areaPath, window}) {
      let win = null;
      for (let i=0; i<state.windowDescs.length; i++) {
        if (state.windowDescs[i].id === window.id) {
          win = state.windowDescs[i];
          break;
        }
      }
      let area = win;
      for (let i=0; i<areaPath.length; i++) {
        area = area.areas[areaPath[i]];
      }
      area.activePanelInd = index;
    },
    closePanel(state, {panelIndex, areaPath, window}) {
      let win = null;
      for (let i=0; i<state.windowDescs.length; i++) {
        if (state.windowDescs[i].id === window.id) {
          win = state.windowDescs[i];
          break;
        }
      }
      let area = win;
      for (let i=0; i<areaPath.length; i++) {
        area = area.areas[areaPath[i]];
      }
      area.panels.splice(panelIndex, 1);
      if (area.panels.length < 1) {
          this.commit('closeArea', {areaPath, window});
      } 
      if (panelIndex === area.activePanelInd) {
          area.activePanelInd = Math.max(0, panelIndex-1);
      }
    },
    closeArea(state, {areaPath, window}) {
      let win = null;
      let winIndex = null;
      for (let i=0; i<state.windowDescs.length; i++) {
        if (state.windowDescs[i].id === window.id) {
          win = state.windowDescs[i];
          winIndex = i;
          break;
        }
      }
      let area = win;
      let parent = null;
      let lastIndex = null;
      for (let i=0; i<areaPath.length; i++) {
        parent = area;
        area = area.areas[areaPath[i]];
        lastIndex = areaPath[i];
      }
      if (parent != null) {
        parent.areas.splice(lastIndex, 1);
        if (parent.areas.length < 2) {
          for (let i=0; i<parent.areas[0].panels.length; i++) {
            parent.panels.push(parent.areas[0].panels[i]);
          }
          parent.activePanelInd = parent.areas[0].activePanelInd;
          parent.areas.splice(0, 1);
        }
      } else {
        state.windowDescs.splice(winIndex, 1);
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
    addPanelToActiveWindow(state, panelInfo) {
      for (let i=0; i<state.windowDescs.length; i++) {
        if (state.windowDescs[i].id === state.activePanel.panelId) {
          let area = state.windowDescs[i];
          while (area.areas.length > 0) {
            area = area.areas[0];
          }
          area.panels.push(panelInfo);
          area.activePanelInd = area.panels.length - 1;
          break;
        }
      }
    },
    createChild(state, {splitDirection, areaPath, window, panelInd}) {
      let win = null;
      for (let i=0; i<state.windowDescs.length; i++) {
        if (state.windowDescs[i].id === window.id) {
          win = state.windowDescs[i];
          break;
        }
      }
      let area = win;
      for (let i=0; i<areaPath.length; i++) {
        area = area.areas[areaPath[i]];
      }
      area.splitDirection = splitDirection;
      let curActivePanel = area.panels.splice(panelInd, 1)[0];

      let firstChildArea = {
          panels: [],
          areas: [],
          activePanelInd: 0,
      };
      let numPanels = area.panels.length;
      for (let i=0; i<numPanels; i++) {
          let panel = area.panels.splice(0, 1)[0];
          firstChildArea.panels.push(panel);
      }
      firstChildArea.activePanelInd = Math.max(0, panelInd-1),
      area.areas.push(firstChildArea);

      area.areas.push({
          panels: [curActivePanel],
          areas: [],
          activePanelInd: 0,
      });

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
      windowInfo.activePanelInd = 0;
      state.nextPanelX += state.nextPanelXIncrement;
      state.nextPanelY += state.nextPanelYIncrement;
      state.nextPanelId++;
      state.windowDescs.push(windowInfo);
    },
    savePanelInfo(state, windowDataIn) {
      for (let i=0; i < state.windowDescs.length; i++) {
        let windowData = state.windowDescs[i];
        if (windowData.id === windowDataIn.panelId) {
          windowData.x = windowDataIn.left;
          windowData.y = windowDataIn.top;
          windowData.w = windowDataIn.width;
          windowData.h = windowDataIn.height;
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
