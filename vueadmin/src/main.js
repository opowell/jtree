import Vue from 'vue'
import MainApp from './MainApp.vue'

import store from './store'
// store.commit('closeAllWindows', {});

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import { 
  BButton,
  BButtonGroup,
  BTable, 
  BRow, 
  BCol, 
  BFormSelect, 
  BFormCheckbox, 
  BFormInput,
  BModal,
  ModalPlugin,
} from 'bootstrap-vue'
Vue.component('b-button', BButton)
Vue.component('b-button-group', BButtonGroup)
Vue.component('b-table', BTable)
Vue.component('b-row', BRow)
Vue.component('b-col', BCol)
Vue.component('b-form-select', BFormSelect)
Vue.component('b-form-checkbox', BFormCheckbox)
Vue.component('b-form-input', BFormInput)
Vue.component('b-modal', BModal)

Vue.use(ModalPlugin)

import jt from '@/webcomps/jtree.js'
import '@/webcomps/utilities.js'
import '@/webcomps/View.js'
import '@/webcomps/admin.js'
document.write('<script src="/socket.io/socket.io.js"></script>');
document.write('<script src="/shared/shared.js"></script>');

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
import {faEdit}                 from '@fortawesome/free-solid-svg-icons/faEdit'
import {faExpand}               from '@fortawesome/free-solid-svg-icons/faExpand'
import {faExternalLinkAlt}      from '@fortawesome/free-solid-svg-icons/faExternalLinkAlt'
import {faEye}                  from '@fortawesome/free-solid-svg-icons/faEye'
import {faExchangeAlt}          from '@fortawesome/free-solid-svg-icons/faExchangeAlt'
import {faExclamationTriangle}  from '@fortawesome/free-solid-svg-icons/faExclamationTriangle'
import {faFile}                 from '@fortawesome/free-solid-svg-icons/faFile'
import {faFolder}               from '@fortawesome/free-solid-svg-icons/faFolder'
import {faImage}                from '@fortawesome/free-solid-svg-icons/faImage'
import {faPlay}                 from '@fortawesome/free-solid-svg-icons/faPlay'
import {faPlus}                 from '@fortawesome/free-solid-svg-icons/faPlus'
import {faRedoAlt}              from '@fortawesome/free-solid-svg-icons/faRedoAlt'
import {faSave}                 from '@fortawesome/free-solid-svg-icons/faSave'
import {faStopwatch}            from '@fortawesome/free-solid-svg-icons/faStopwatch'
import {faTable}                from '@fortawesome/free-solid-svg-icons/faTable'
import {faTimes}                from '@fortawesome/free-solid-svg-icons/faTimes'
import {faTrash}                from '@fortawesome/free-solid-svg-icons/faTrash'
import {faUndoAlt}              from '@fortawesome/free-solid-svg-icons/faUndoAlt'

import {faFolderOpen}           from '@fortawesome/free-regular-svg-icons/faFolderOpen'
import {faMinusSquare}          from '@fortawesome/free-regular-svg-icons/faMinusSquare'
import {faPlusSquare}           from '@fortawesome/free-regular-svg-icons/faPlusSquare'
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
  faEdit,
  faExpand,
  faExternalLinkAlt,
  faEye,
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
  faStopwatch,
  faTable,
  faTimes,
  faTrash,
  faUndoAlt,

  faMinusSquare,
  faPlusSquare,
  faWindowClose,
  faWindowMinimize,
  faWindowRestore,

)

import AppRow from '@/components/AppRow.vue'
import QueueRow from '@/components/QueueRow.vue'

Vue.component('font-awesome-icon', FontAwesomeIcon)
Vue.component('AppRow', AppRow)
Vue.component('QueueRow', QueueRow)

window.jt = jt;

Vue.config.productionTip = false

window.vue = new Vue({
  store,
  render: h => h(MainApp),
  mounted() {
    if (store.state.windowDescs.length === 0) {
      store.dispatch('resetWindows');
    }
  },
}).$mount('#app')