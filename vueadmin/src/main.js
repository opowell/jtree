import Vue from 'vue'
import App from './App.vue'
import store from './store'
import BootstrapVue from 'bootstrap-vue'

import jt from '@/webcomps/jtree.js'
import '@/webcomps/utilities.js'
import '@/webcomps/View.js'
import '@/webcomps/admin.js'
import '@/webcomps/shared.js'

window.jt = jt;

store.commit('closeAllWindows', {});

Vue.config.productionTip = false
Vue.use(BootstrapVue);

window.vue = new Vue({
  store,
  render: h => h(App),
}).$mount('#app')