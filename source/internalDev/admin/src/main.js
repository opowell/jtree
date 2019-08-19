import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import BootstrapVue from 'bootstrap-vue'
import Vuebar from 'vuebar';

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

Vue.use(Vuebar);
Vue.use(BootstrapVue);
Vue.config.productionTip = false

window.$ = window.jQuery = require('jquery');

store.commit('closeAllWindows', {});

window.vue = new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app')