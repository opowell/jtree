import Vue from 'vue'
import App from './App.vue'

import store from './store'
store.commit('closeAllWindows', {});

import BootstrapVue from 'bootstrap-vue'

import jt from '@/webcomps/jtree.js'
import '@/webcomps/utilities.js'
import '@/webcomps/View.js'
import '@/webcomps/admin.js'
import '@/webcomps/shared.js'

import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

import {faAlignCenter}          from '@fortawesome/free-solid-svg-icons/faAlignCenter'
import {faAngleDoubleDown}      from '@fortawesome/free-solid-svg-icons/faAngleDoubleDown'
import {faAngleDoubleRight}     from '@fortawesome/free-solid-svg-icons/faAngleDoubleRight'
import {faCaretDown}            from '@fortawesome/free-solid-svg-icons/faCaretDown'
import {faCaretRight}           from '@fortawesome/free-solid-svg-icons/faCaretRight'
import {faCheck}                from '@fortawesome/free-solid-svg-icons/faCheck'
import {faChevronRight}         from '@fortawesome/free-solid-svg-icons/faChevronRight'
import {faCircle}               from '@fortawesome/free-solid-svg-icons/faCircle'
import {faCode}                 from '@fortawesome/free-solid-svg-icons/faCode'
import {faExchangeAlt}          from '@fortawesome/free-solid-svg-icons/faExchangeAlt'
import {faExclamationTriangle}  from '@fortawesome/free-solid-svg-icons/faExclamationTriangle'
import {faFile}                 from '@fortawesome/free-solid-svg-icons/faFile'
import {faFolder}               from '@fortawesome/free-solid-svg-icons/faFolder'
import {faFolderOpen}           from '@fortawesome/free-solid-svg-icons/faFolderOpen'
import {faImage}                from '@fortawesome/free-solid-svg-icons/faImage'
import {faPlay}                 from '@fortawesome/free-solid-svg-icons/faPlay'
import {faPlus}                 from '@fortawesome/free-solid-svg-icons/faPlus'
import {faRedoAlt}              from '@fortawesome/free-solid-svg-icons/faRedoAlt'
import {faSave}                 from '@fortawesome/free-solid-svg-icons/faSave'
import {faTable}                from '@fortawesome/free-solid-svg-icons/faTable'
import {faTimes}                from '@fortawesome/free-solid-svg-icons/faTimes'
import {faUndoAlt}              from '@fortawesome/free-solid-svg-icons/faUndoAlt'

import {faWindowClose}          from '@fortawesome/free-regular-svg-icons/faWindowClose'
import {faWindowMinimize}       from '@fortawesome/free-regular-svg-icons/faWindowMinimize'
import {faWindowRestore}        from '@fortawesome/free-regular-svg-icons/faWindowRestore'

library.add(
  faAlignCenter,
  faAngleDoubleRight,
  faAngleDoubleDown,
  faCaretDown,
  faCaretRight,
  faChevronRight,
  faCheck,
  faCircle,
  faCode,
  faExchangeAlt,
  faExclamationTriangle,
  faFile,
  faFolder,
  faFolderOpen,
  faImage,
  faPlay,
  faPlus,
  faRedoAlt,
  faSave,
  faTable,
  faTimes,
  faUndoAlt,

  faWindowClose,
  faWindowMinimize,
  faWindowRestore,

)

Vue.component('font-awesome-icon', FontAwesomeIcon)

window.jt = jt;

Vue.config.productionTip = false
Vue.use(BootstrapVue);

window.vue = new Vue({
  store,
  render: h => h(App),
}).$mount('#app')