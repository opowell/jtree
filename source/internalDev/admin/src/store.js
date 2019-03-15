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
      if (window == null) {
        debugger;
      }
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
      area.areas.push(firstChildArea);
      area.areas.push({
          panels: [curActivePanel],
          areas: [],
          activePanelInd: Math.max(0, panelInd-1),
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
