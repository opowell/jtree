import Vue from 'vue'
import App from './App.vue'
import store from './store'

import 'jquery'
let $ = window.jQuery
import jt from '@/webcomps/jtree.js'
import '@/webcomps/utilities.js'
import '@/webcomps/View.js'
import '@/webcomps/admin.js'
import '@/webcomps/shared.js'

window.jt = jt;

jt.setSubView = function(viewName, subViewName) {
  $('.' + viewName + '-tab').addClass('hidden');
  $('#view-' + viewName + '-' + subViewName).removeClass('hidden');
  $('.' + viewName + '-tabBtn').removeClass('active');
  $('#tab-' + viewName + '-' + subViewName).addClass('active');
}

Vue.config.productionTip = false

window.vue = new Vue({
  store,
  render: h => h(App),
}).$mount('#app')