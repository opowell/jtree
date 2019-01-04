import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    queues: [],
    apps: [],
    panelsMaximized: true,
    isMenuOpen: false,
    activeMenu: null,
    activePanel: null,
    panels: [],
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
    }
  },
  actions: {

  }
})
