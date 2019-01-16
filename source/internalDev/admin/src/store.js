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
      'nextWindowX',
      'nextWindowY',
      'fontSize',
      'windowFocussedBGColor',
      'windowBGColor',
    ],
  })],
  state: {
    queues: [],
    apps: [],
    isMenuOpen: false,
    activeMenu: null,
    activeWindow: null,

    games: [],

    // After panels are mounted, they register here. Order determines z-index.
    windows: [],

    containerHeight: 5000,
    containerWidth: 5000,
    nextWindowXIncrement: 40,
    nextWindowYIncrement: 40,
    nextWindowId: 0,

    // PERSISTENT SETTINGS
    // must be added to 'paths' option.
    windowsMaximized: true,
    // Meta-data for created panels.
    windowDescs: [],
    // Language items.
    appName: 'Game',
    windowFocussedBGColor: '#737373',
    windowBGColor: '#b5b5b5',

    // Coordinates of where to open panels.
    nextWindowX: 20,
    nextWindowY: 20,
    fontSize: '10pt',

    session: {
      gameTree: [],
    },

  },
  actions: {
    dropOnTab: ({commit}, {sourceWindowId, sourceAreaPath, sourcePanelIndex, targetWindowId, targetAreaPath, targetIndex}) => {
      commit('addTabToPanel', {
        sourceWindowId, sourceAreaPath, sourcePanelIndex, targetWindowId, targetAreaPath, targetIndex,
      });

      // If inserted before its current position, increase source panel index.
      if (
        sourceWindowId === targetWindowId &&
        sourceAreaPath === targetAreaPath &&
        sourcePanelIndex > targetIndex
      ) {
        sourcePanelIndex++;
      }

      commit('closePanel', {
        panelIndex: sourcePanelIndex, 
        areaPath: sourceAreaPath, 
        windowId: sourceWindowId
      });
    },
  },
  mutations: {
    addPanelToActiveWindow(state, panelInfo) {
      for (let i=0; i<state.windowDescs.length; i++) {
        if (state.windowDescs[i].id === state.activeWindow.panelId) {
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
    addQueues(state, queues) {
      state.queues.splice(0, state.queues.length);
      for (let q in queues) {
        state.queues.push(queues[q]);
      }
    },
    addTabToPanel(state, {
      sourceWindowId, sourceAreaPath, sourcePanelIndex, targetWindowId, targetAreaPath, targetIndex,
    }) {
      let sourceArea = getArea(state, sourceWindowId, sourceAreaPath);
      let sourcePanel = sourceArea.panels[sourcePanelIndex];
      let targetArea = getArea(state, targetWindowId, targetAreaPath);
      targetArea.panels.splice(targetIndex, 0, sourcePanel);
      targetArea.activePanelInd = targetIndex;
      // if (
      //   sourceArea === targetArea &&
      //   sourceWindowId === targetWindowId &&
      //   targetIndex > sourcePanelIndex
      // ) {
      //   targetArea.activePanelInd++;
      // }
    },
    addWindow(state, panel) {
      state.activeWindow = panel;
      state.windows.push(panel);
    },
    changeSelectedIndex(state, {areaPath, windowId, change}) {
      let area = getArea(state, windowId, areaPath);
      area.activePanelInd = area.activePanelInd + change;
      if (area.activePanelInd < 0) {
        area.activePanelInd = area.panels.length - 1;
      }
      else if (area.activePanelInd > area.panels.length - 1) {
        area.activePanelInd = 0;
      }
    },
    closeArea(state, {areaPath, windowId}) {
      closeAreaMethod(state, areaPath, windowId);
    },
    closePanel(state, {panelIndex, areaPath, windowId}) {
      let area = getArea(state, windowId, areaPath);
      area.panels.splice(panelIndex, 1);
      if (area.panels.length < 1) {
          closeAreaMethod(state, areaPath, windowId);
      }
      if (panelIndex === area.activePanelInd) {
          area.activePanelInd = Math.max(0, panelIndex-1);
      } else if (panelIndex < area.activePanelInd) {
        area.activePanelInd--;
      }
    },
    newSiblingOfParent(state, {areaPath, windowId, panelInd}) {
      let areaIndex = areaPath.splice(areaPath.length-1, 1);
      let parent = getArea(state, windowId, areaPath);
      let area = parent.areas[areaIndex];
      
      // Nothing to do if not more than one panel.
      if (area.panels.length < 2) {
        return;
      }

      let panel = area.panels.splice(panelInd, 1)[0];
      parent.areas.push({
          panels: [panel],
          areas: [],
          activePanelInd: 0,
          flex: '1 1 100px',
          rowChildren: true,
      });
      area.activePanelInd = Math.max(0, panelInd-1);
    },
    createChild(state, {areaPath, windowId, panelInd, rowChildren}) {
      let area = getArea(state, windowId, areaPath);
      area.rowChildren = rowChildren;
      let curActivePanel = area.panels.splice(panelInd, 1)[0];

      let firstChildArea = {
          panels: [],
          areas: [],
          activePanelInd: 0,
          flex: '1 1 100px',
          rowChildren: true,
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
          flex: '1 1 100px',
          rowChildren: true,
      });

    },
    resetWindowIds(state) {
      for (let i=0; i<state.windowDescs.length; i++) {
        state.windowDescs[i].id = state.nextWindowId;
        state.nextWindowId++;
      }
    },
    saveWindowInfo(state, windowDataIn) {
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
    setActivePanelIndex(state, {index, areaPath, windowId}) {
      let area = getArea(state, windowId, areaPath);
      area.activePanelInd = index;
    },
    setApps(state, apps) {
      state.apps.splice(0, state.apps.length);
      for (let q in apps) {
        state.apps.push(apps[q]);
      }
    },
    setContainerDimensions(state, container) {
      state.containerWidth = container.clientWidth - 5;
      state.containerHeight = container.clientHeight - 5;
    },
    setFocussedWindow(state, window) {
      let curPos = window.zIndex;
      state.windows.splice(curPos, 1); 
      state.windows.push(window);
      state.activeWindow = window;
      state.isMenuOpen = false;
    },
    setAreaSize(state, {windowId, areaPath, size}) {
      let area = getArea(state, windowId, areaPath);
      area.flex = '0 0 ' + size + 'px';
    },
    setSetting(state, {key, value}) {
      state[key] = value;
    },
    showWindow(state, windowInfo) {
      windowInfo.id = state.nextWindowId;
      if (state.nextWindowX + windowInfo.w > state.containerWidth) {
        state.nextWindowX = 25;
      }
      if (state.nextWindowY + windowInfo.h > state.containerHeight) {
        state.nextWindowY = 25;
      }
      windowInfo.x = state.nextWindowX;
      windowInfo.y = state.nextWindowY;
      windowInfo.activePanelInd = 0;
      state.nextWindowX += state.nextWindowXIncrement;
      state.nextWindowY += state.nextWindowYIncrement;
      state.nextWindowId++;
      state.windowDescs.push(windowInfo);
    },
    toggleWindowsMaximized(state) {
      state.windowsMaximized = !state.windowsMaximized;
    },
    toggleRowChildren(state, {windowId, areaPath}) {
      let area = getArea(state, windowId, areaPath);
      area.rowChildren = !area.rowChildren;
    },
  },
})

function getWindowDataIndex(state, windowId) {
  for (let i=0; i<state.windowDescs.length; i++) {
    if (state.windowDescs[i].id === windowId) {
      return i;
    }
  }
}

function getArea(state, windowId, areaPath) {
  let win = getWindowData(state, windowId);
  let area = win;
  for (let i=0; i<areaPath.length; i++) {
    area = area.areas[areaPath[i]];
  }
  return area;
}

function getWindowData(state, windowId) {
  let win = null;
  let index = getWindowDataIndex(state, windowId);
  if (index > -1) {
    win = state.windowDescs[index];
  }
  return win;
}

function closeAreaMethod(state, areaPath, windowId) {
  let winIndex = getWindowDataIndex(state, windowId);
  let win = state.windowDescs[winIndex];
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

}