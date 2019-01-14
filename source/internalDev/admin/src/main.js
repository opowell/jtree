import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import BootstrapVue from 'bootstrap-vue'

Vue.use(BootstrapVue);
Vue.config.productionTip = false

window.$ = window.jQuery = require('jquery');

window.vue = new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')