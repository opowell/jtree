import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate'

Vue.use(Vuex)

const OPEN_NEW_PANELS_IN_ACTIVE_WINDOW = 0;
const OPEN_NEW_PANELS_IN_NEW_WINDOW = 1;
const OPEN_NEW_PANELS_IN_ACTIVE_WINDOW_IF_MAXED = 2;

const persistentSettings = [
  {
    name: 'Font size',
    type: 'text',
    key: 'fontSize',
  },
  {
    name: 'Main hover background color',
    type: 'text',
    key: 'menuHoverBGColor',
  },
  {
    name: 'Container background color',
    type: 'text',
    key: 'containerBGColor',
  },
  {
    name: 'Container border',
    type: 'text',
    key: 'containerBorder',
  },
  {
    name: 'Menu hover border color',
    type: 'text',
    key: 'menuHoverBorderColor',
  },
  {
    name: 'Main menu padding',
    type: 'text',
    key: 'mainMenuPadding',
  },
  {
    name: 'Menu text padding',
    type: 'text',
    key: 'menuTextPadding',
  },
  {
    name: 'Menu color',
    type: 'text',
    key: 'menuColor',
  },
  {
    name: 'Menu background color',
    type: 'text',
    key: 'menuBGColor',
  },
  {
    name: 'Window font color',
    type: 'text',
    key: 'windowFontColor',
  },// eslint-disable-next-line
  {
    name: 'Area action bar background color',
    type: 'text',
    key: 'areaActionBarBGColor',
  },
  {
    name: 'Area content background color',
    type: 'text',
    key: 'areaContentBGColor',
  },
  {
      name: 'Game name',
      type: 'text',
      key: 'appName',
      default: 'Game',
      isStyle: false,
  },
  {
      key: 'windowDescs',
      editable: false,
      isStyle: false,
      default: [],
  },
  {
      key: 'nextWindowX',
      editable: false,
      isStyle: false,
  },
  {
    key: 'nextWindowY',
    editable: false,
    isStyle: false,
  },
{
      name: 'Windows maximized',
      type: 'checkbox',
      key: 'windowsMaximized',
      default: true,
      isStyle: false,
  },
  {
      name: 'Window, background color',
      type: 'text',
      key: 'windowBGColor',
  },
  {
      name: 'Focussed window, background color top',
      type: 'text',
      key: 'windowFocussedBGColorTop',
  },
  {
      name: 'Focussed window, background color',
      type: 'text',
      key: 'windowFocussedBGColor',
  },
  {
      name: 'Allow multiple areas in a window',
      type: 'checkbox',
      key: 'allowMultipleAreasInAWindow',
      isStyle: false,
  },
  {
      name: 'Allow multiple panels in an area',
      type: 'checkbox',
      key: 'allowMultiplePanelsInAnArea',
      isStyle: false,
  },
  {
      name: 'Open new panels in',
      type: 'select',
      options: [
        {
          value: OPEN_NEW_PANELS_IN_ACTIVE_WINDOW,
          text: 'Active window',
         },
         {
           value: OPEN_NEW_PANELS_IN_ACTIVE_WINDOW_IF_MAXED,
           text: 'Active window when in maximized mode, otherwise new window',
         },
         {
           value: OPEN_NEW_PANELS_IN_NEW_WINDOW,
           text: 'New window',
         }
      ],
      key: 'openNewPanelsIn',
      isStyle: false,
      default: OPEN_NEW_PANELS_IN_ACTIVE_WINDOW,
  },
  {
      name: 'Hide tabs when only single panel in area',
      type: 'checkbox',
      key: 'hideTabsWhenSinglePanel',
      isStyle: false,
      default: false,
  },
  {
      name: 'Selected tab font color',
      type: 'text',
      key: 'tabSelectedFontColor',
  },
  {
      name: 'Tab font color',
      type: 'text',
      key: 'tabFontColor',
  },
  {
    name: 'Selected tab background color',
    type: 'text',
    key: 'tabSelectedBGColor',
},
{
      name: 'Tab background color',
      type: 'text',
      key: 'tabBGColor',
  },
  {
    name: 'Tab hover background color',
    type: 'text',
    key: 'tabHoverBGColor',
  },
  {
    name: 'Panel content background color',
    type: 'text',
    key: 'panelContentBGColor',
  },
  {
    name: 'Node title hover background color',
    type: 'text',
    key: 'nodeTitleHoverBGColor',
  },
  {
    name: 'Node selected background color',
    type: 'text',
    key: 'nodeSelectedBGColor',
  },
  {
    name: 'Node selected hover background color',
    type: 'text',
    key: 'nodeSelectedHoverBGColor',
  },
  {
    name: 'Node title hover color',
    type: 'text',
    key: 'nodeTitleHoverColor',
  },
  {
    name: 'Node selected color',
    type: 'text',
    key: 'nodeSelectedColor',
  },
  {
    name: 'Node selected hover color',
    type: 'text',
    key: 'nodeSelectedHoverColor',
  },
  {
    name: 'Panel close button color',
    type: 'text',
    key: 'panelCloseButtonColor',
  },
  {
    name: 'Panel close button background color',
    type: 'text',
    key: 'panelCloseButtonBGColor',
  },
  {
    name: 'Area content font color',
    type: 'text',
    key: 'areaContentFontColor',
  },
  {
    name: 'Action bar background color',
    type: 'text',
    key: 'actionBarBGColor',
  },
  {
    name: 'Panel close button hover background color',
    type: 'text',
    key: 'panelCloseButtonHoverBGColor',
  },
  {
    name: 'Node selected and focussed background color',
    type: 'text',
    key: 'nodeSelectedFocussedBGColor',
  },
];

let persistPaths = [
  'sessionId',
];

let stateObj = {
  persistentSettings: persistentSettings,
  queues: [],
  apps: [],
  sessions: [],
  isMenuOpen: false,
  activeMenu: null,
  activeWindow: null,
  sessionId: null,

  games: [],

  // After panels are mounted, they register here. Order determines z-index.
  windows: [],

  containerHeight: 5000,
  containerWidth: 5000,
  nextWindowXIncrement: 40,
  nextWindowYIncrement: 40,
  nextWindowId: 0,

  // Meta-data for created panels.
  windowDescs: [],

  // Coordinates of where to open panels.
  nextWindowX: 20,
  nextWindowY: 20,
  
  session: {
    state: {
      gameTree: [],
      participants: [],
    },
    messages: [],
    messageIndex: 0,
    messageLatest: true,
    started: false,
    objectList: [],
  },
  // messageIndex: 0,
  // messageLatest: true,

  settingsPresets: [
    {
      name: 'ztree',
      values: {
        appName: 'Treatment',
        containerBGColor: 'rgb(171, 171, 171)',
        containerBorder: '2px inset #fff',
        fontSize: '9pt',
        hideTabsWhenSinglePanel: true,
        mainMenuPadding: '0px 5px',
        menuBGColor: 'white',
        menuColor: 'black',
        menuHoverBGColor: 'rgb(229, 243, 255)',
        menuHoverBorderColor: 'rgb(204, 232, 255)',
        menuTextPadding: '2px 1px',
        tabFontColor: 'rgb(0, 0, 0)',
        tabSelectedFontColor: '#000',
        windowBGColor: 'rgb(205, 219, 232)',
        windowFocussedBGColorTop: 'rgb(153,180,209)',
        windowFocussedBGColor: 'rgb(185,209,234)',
        windowFocussedFontColor: '#000',
        windowFontColor: 'rgb(171, 171, 171)',
        areaActionBarBGColor: '#fff',
        areaContentBGColor: '#fff',
        areaContentFontColor: '#000',
        tabBGColor: 'rgba(245, 245, 245, 0.7)',
        tabHoverBGColor: '#fff',
        panelContentBGColor: '#fff',
        nodeTitleHoverBGColor: 'unset',
        nodeSelectedBGColor: '#888',
        nodeSelectedHoverBGColor: 'rgb(51, 153, 255)',
        nodeTitleHoverColor: 'unset',
        nodeSelectedColor: '#fff',
        nodeSelectedHoverColor: '#fff',
        panelCloseButtonBGColor: '#ec6666',
        panelCloseButtonHoverBGColor: '#ff3043',
        panelCloseButtonColor: 'white',
        actionBarBGColor: '#f5f5f5',
        nodeSelectedFocussedBGColor: 'rgb(51, 153, 255)',
        openNewPanelsIn: OPEN_NEW_PANELS_IN_NEW_WINDOW,
        tabSelectedBGColor: '#f5f5f5'
      }
    },
    {
      name: 'modern',
      values: {
        windowFocussedBGColorTop: '#b5b5b5',
        windowFocussedBGColor: '#b5b5b5',
        menuBGColor: "rgb(90, 90, 90)",
        menuColor: 'rgb(185, 185, 185)',
        fontSize: '10pt',
        mainMenuPadding: '0px 7px',
        menuTextPadding: '4px 3px',
        appName: 'Game',
        menuHoverBGColor: 'rgb(109, 109, 109)',
        menuHoverBorderColor: 'rgb(155, 155, 155)',
        containerBGColor: 'rgb(71, 71, 71)',
        containerBorder: 'none',
        hideTabsWhenSinglePanel: false,
        tabSelectedFontColor: '#CCC',
        tabFontColor: '#888',
        tabBGColor: '#666',
        tabHoverBGColor: '#AAA',
        areaContentBGColor: '#353535',
        areaContentFontColor: '#CCC',
        panelContentBGColor: 'rgb(37, 37, 37)',
        nodeTitleHoverBGColor: '#424242',
        nodeSelectedBGColor: '#888',
        nodeSelectedFocussedBGColor: 'blue',
        nodeSelectedHoverBGColor: 'blue',
        nodeTitleHoverColor: '#fff',
        nodeSelectedColor: '#fff',
        nodeSelectedHoverColor: '#fff',
        panelCloseButtonBGColor: 'inherit',
        panelCloseButtonHoverBGColor: 'inherit',
        panelCloseButtonColor: 'inherit',
        actionBarBGColor: '#555',
        windowBGColor: '#333',
        openNewPanelsIn: OPEN_NEW_PANELS_IN_ACTIVE_WINDOW_IF_MAXED,
        tabSelectedBGColor: '#f5f5f5',
      }
    }
  ]

}

for (let i=0; i<persistentSettings.length; i++) {
  let setting = persistentSettings[i];
  persistPaths.push(setting.key);
  if (setting.default == null) {
    stateObj[setting.key] = stateObj.settingsPresets[0].values[setting.key];
  } else {
    stateObj[setting.key] = setting.default;
  }
}

// import axios from 'axios';

export default new Vuex.Store({
  plugins: [createPersistedState({
    paths: persistPaths,
  })],
  state: stateObj,
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
// eslint-disable-next-line
    showSessionWindow: ({ commit, state}, data) => {
      commit('showWindow',
      {
        panels: [],
        flex: '1 1 100px',
        areas: [
          // LEFT
          { 
            flex: '1 1 100px',
            areas: [],
            activePanelInd: 0,
            panels: [
              { 
                id: "Game Tree",
                type: "game-tree-panel"
              }, 
              { 
                id: "Files",
                type: "files-panel"
              },
              { 
                id: "Sessions",
                type: "sessions-panel"
              }
            ],
          }, 
          // RIGHT
          { 
            flex: '1 1 100px',
            rowChildren: true,
            panels: [],
            areas: [
              // TOP RIGHT
              { 
                flex: '1 1 100px',
                panels: [],
                areas: [
                  // TOP RIGHT - LEFT
                  {
                    activePanelInd: 0,
                    flex: '1 1 100px',
                    areas: [],
                    panels: 
                    [
                      { 
                        id: "Info", 
                        type: "session-info-panel", 
                      }
                    ], 
                  }, 
                  // TOP RIGHT - RIGHT
                  { 
                    areas: [],
                    flex: '1 1 100px',
                    activePanelInd: 0,
                    panels: [
                      { 
                        id: "Actions", 
                        type: "session-actions-panel" 
                      }
                    ], 
                  }
                ], 
              }, 
              // BOTTOM RIGHT
              { 
                panels: [],
                flex: '1 1 100px',
                areas: [
                  { 
                    flex: '1 1 100px',
                    areas: [],
                    activePanelInd: 0,
                    panels: [
                      { 
                        id: "Participants", 
                        type: "session-participants-panel" 
                      }
                    ], 
                  }, 
                  { 
                    flex: '1 1 100px',
                    areas: [],
                    activePanelInd: 0,
                    panels: [
                      {
                        id: "Monitor", 
                        type: "session-monitor-panel" 
                      }
                    ], 
                  }
                ], 
              }
            ], 
          }
        ], 
      });
    },
    showPanel: ({commit, state}, data) => {
      if (data.checkIfAlreadyOpen === true) {
        let x = findPanel(state, data.type, data.data);
        if (x.panel !== null) {
          x.area.activePanelInd = x.index;
          let curPos = x.window.zIndex;
          state.windows.splice(curPos, 1); 
          state.windows.push(x.window);
          state.activeWindow = x.window;
          state.isMenuOpen = false;
          return;
        }
      }
      if (
        (
          state.openNewPanelsIn === OPEN_NEW_PANELS_IN_ACTIVE_WINDOW &&
          state.windowDescs.length > 0
        ) ||
        (
          state.openNewPanelsIn === OPEN_NEW_PANELS_IN_ACTIVE_WINDOW_IF_MAXED &&
          state.windowsMaximized &&
          state.windowDescs.length > 0
        )
      ) {
        commit('addPanelToActiveWindow', {
          id: data.title,
          type: data.type,
          data: data.data,
        });
      } else {
        commit('showWindow', {
          panels: [
              {
                  id: data.title,
                  type: data.type,
                  data: data.data,
              },
          ],
          areas: [],
          w: 500,
          h: 300,
          flex: '1 1 100px',
        });
      }
    },
  },
  mutations: { // called by "store.commit(mutationName, payload)";
    deleteParticipant(state, pId) {
      Vue.delete(state.session.participants, pId);
    },
    setSessionId(state, sessionId) {
      state.sessionId = sessionId;
      // axios.get(
      //     'http://' + window.location.host + '/api/session/' + sessionId
      // ).then(response => {
      //     if (response.data.success === true) {
      //       state.session = response.data.session;
      //     }
      // });
      global.jt.socket.emit('openSession', sessionId);
    },
    // setActionIndex(state, index) {
    //   Vue.set(state.session, 'messageIndex', index);
    //   state.messageIndex = index;
    // },
    setSession(state, session) {
      state.session = session;
      // state.session.gameTree.splice(0, state.session.gameTree.length);
      // for (let i=0; i<session.gameTree.length; i++) {
      //   state.session.gameTree.push(session.gameTree)
      // }
      for (let i=0; i<state.sessions.length; i++) {
        if (state.sessions[i].id === session.id) {
          state.sessions[i] = session;
        }
      }
    },
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
      if (state.windowDescs == null) {
        return;
      }
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
    setFocussedWindow(state, windowPanel) {
      let curPos = windowPanel.zIndex;
      state.windows.splice(curPos, 1); 
      state.windows.push(windowPanel);
      state.activeWindow = windowPanel;
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

function findPanel(state, type, data) {
  for (let i=0; i<state.windows.length; i++) {
    let win = state.windows[i];
    let x = findPanelFromArea(state, type, data, win.area);
    if (x.panel !== null) {
      return {panel: x.panel, index: x.index, area: x.area, window: win};
    }
  }
  return {panel: null, index: null, area: null, window: null};
}

function findPanelFromArea(state, type, data, area) {
  if (area == null) {
    debugger;
  }
  for (let i=0; i<area.areas.length; i++) {
    let x = findPanelFromArea(state, type, data, area.areas[i]);
    if (x.panel != null) {
      return {panel: x.panel, index: x.index, area: x.area};
    }
  }
  for (let i=0; i<area.panels.length; i++) {
    let panel = area.panels[i];
    // if (panel.type === type && panel.data === data) {
    if (panel.type === type) {
      return {panel, index: i, area};
    }
  }
  return {panel: null, index: null, area: null};
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
    if (state.activeWindow.window.id === windowId) {
      if (state.windows.length === 1) {
        state.activeWindow = null;
        return;
      }
      state.activeWindow = state.windows[state.windows.length - 2];
    }
  }

}