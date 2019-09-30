import Vue from 'vue'
import Vuex from 'vuex'
import jt from '@/webcomps/jtree.js'

Vue.use(Vuex)

let defaultPanels = [
  { title: 'Home',     type: 'ViewHome'     },
]

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
  {
    name: 'Include session id in participant links',
    type: 'checkbox',
    key: 'includeSessionIdInPartLinks',
    default: false, 
  },

];

let settingsPresets = [
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

let persistPaths = [
  'sessionId',
];

let stateObj = {
  app: null,
  appInfos: [],
  log: [],
  panels: defaultPanels,
  shownPanel: 0,
  session: null,
  sessions: [],
  openPlayers: [],
  settings: [],

  allFields: [],
  fields: [
    {
        key: 'id',
        label: 'id',
        sortable: true,
    },
    {
        key: 'link',
        label: 'link',
    },
    {
        key: 'numClients',
        label: 'clients',
    },
    {
        key: 'appIndex',
        label: 'app',
    },
    {
        key: 'periodIndex',
        label: 'period',
    },
    {
        key: 'player.group.id',
        label: 'group'
    },
    {
        key: 'player.stage.id',
        label: 'stage'
    },
    {
        key: 'time',
    },
    {
        key: 'player.status',
        label: 'status'
    },
],

  // carried over from 0.8
  windows: [],
  activeMenu: null,
  isMenuOpen: false,
  persistentSettings,
  settingsPresets
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

function storeFields(path, obj, outKeys, state) {
  for (var i in obj) {
    if (!outKeys.includes(path + i)) {
      if (
        typeof(obj[i]) === 'object' &&
        !Array.isArray(obj[i])
      ) {
        storeFields(path + i + '.', obj[i], outKeys, state);
      } else {
        outKeys.push(path + i);
        state.allFields.push({
            key: path + i,
            label: path + i,
        });
      }
    }
  }

} 

export default new Vuex.Store({
  state: stateObj,
  mutations: {
    addPanel (state, panelInfo) {
      state.panels.push(panelInfo);
    },
    setApp(state, app) {
      state.app = app;
    },
    setPanel (state, index) {
      state.shownPanel = (index - 0);
    },
    setParticipant (state, participant) {
      Vue.set(state.session.participants, participant.id, participant);
      state.allFields.splice(0, state.allFields.length);
      if (jt.settings.sessionShowFullLinks) {
          state.allFields[1].key = 'full link';
      } 
  
        // let out = [];
        let outKeys = []; // Track which fields have already been found.
        for (let f in state.fields) {
            state.allFields.push(state.fields[f]);
            outKeys.push(state.fields[f].key);
        }
        for (let p in state.session.participants) {
            let part = state.session.participants[p];
            storeFields('', part, outKeys, state);
          }
        // state.allFields = out;

    },
    setSession (state, session) {
      state.session = session;
    },
    setSessionId (state, oldId, newId) {
      for (let i in state.sessions) {
        let session = state.sessions[i];
        if (session.id === oldId) {
          session.id = newId;
          return;
        }
      }
    },
    setSettings (state, settings) {
      state.settings = settings;
    }
  },
  actions: {

  }
})
