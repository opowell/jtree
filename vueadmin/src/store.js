import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    appInfos: [],
    log: [],
    session: {
      participants: {},
    },
    view: 'home',
  },
  mutations: {

  },
  actions: {

  }
})
