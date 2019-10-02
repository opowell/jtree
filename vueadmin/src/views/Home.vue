<template>
  <div>
    <!-- <keep-alive>
      <component class='panel' v-show='selPanelType != null' :is='selPanelType'/>
    </keep-alive> -->

    <appsetvariable-modal/>
    <createapp-modal/>
    <renameapp-modal/>
    <editappoptions-modal/>
    <view-queue/>
    <addapptoqueue-modal/>
    <addapptosession-modal/>
    <addqueuetosession-modal/>
    <setviewsize-modal/>
    <setautoplayfreq-modal/>
    <view-login/>

    <div style='display: none' id='logMessage' class='popup'>
      <div id='logMessageText' class="alert-box success">
      </div>
    </div>

    <ConfirmModal/>

  </div>
</template>

<script>

import ViewHome from '@/components/ViewHome.vue'
import ViewLog from '@/components/ViewLog.vue'
import ConfirmModal from '@/components/ConfirmModal.vue'

import '@/webcomps/ViewAppEditModal.js'
import '@/webcomps/AppSetVariableModal.js'
import '@/webcomps/CreateAppModal.js'
import '@/webcomps/RenameAppModal.js'
import '@/webcomps/ViewQueue.js'
import '@/webcomps/AddAppToQueueModal.js'
import '@/webcomps/ViewQueues.js'
import '@/webcomps/AddAppToSessionModal.js'
import '@/webcomps/AddQueueToSessionModal.js'
import '@/webcomps/SetViewSizeModal.js'
import '@/webcomps/SetAutoplayFreqModal.js'
import '@/webcomps/EditAppOptionsModal.js'
import '@/webcomps/ViewSessions.js'
import '@/webcomps/ViewLogin.js'
import '@/webcomps/ViewAppPreview.js'

import '@/webcomps/Model.js'
import '@/webcomps/circularjson.js'



export default {
  name: 'home',
  components: {
    ViewHome,
    ViewLog,
    ConfirmModal,
  },
  computed: {
    selPanelType() {
      let state = this.$store.state;
      if (state.shownPanel < 0) {
        return 'test';
      }
      return state.panels[state.shownPanel].type;
    }
  },
}
</script>

<style scoped>
.panel {
  padding: 1rem;
}
</style>

<style>
.panel-container {
  background-color: var(--containerBGColor);
  flex: 1 1 auto;
  position: relative;
  display: flex;
  border: var(--container-border);
  overflow-y: auto;
}

body {
  display: flex;
  flex-direction: column;
  width: 100vw;
  height: 100vh;
  padding-bottom: 0px;
  font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol";
}

#app {
  display: flex;
  flex-direction: column;
  height: 100%;
  font-size: var(--fontSize);
}

.no-text-select {
  cursor: default;
   -webkit-touch-callout: none; /* iOS Safari */
    -webkit-user-select: none; /* Safari */
     -khtml-user-select: none; /* Konqueror HTML */
       -moz-user-select: none; /* Firefox */
        -ms-user-select: none; /* Internet Explorer/Edge */
            user-select: none; /* Non-prefixed version, currently
                                  supported by Chrome and Opera */
}


.tree-anchor {
    color: inherit;
}






.vb > .vb-dragger {
    z-index: 5;
    width: 12px;
    right: 0;
}

.vb > .vb-dragger > .vb-dragger-styler {
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
    -webkit-transform: rotate3d(0,0,0,0);
    transform: rotate3d(0,0,0,0);
    -webkit-transition:
        background-color 100ms ease-out,
        margin 100ms ease-out,
        height 100ms ease-out;
    transition:
        background-color 100ms ease-out,
        margin 100ms ease-out,
        height 100ms ease-out;
    background-color: rgba(48, 121, 244,.1);
    margin: 5px 5px 5px 0;
    border-radius: 20px;
    height: calc(100% - 10px);
    display: block;
}

.vb.vb-scrolling-phantom > .vb-dragger > .vb-dragger-styler {
    background-color: rgba(48, 121, 244,.3);
}

.vb > .vb-dragger:hover > .vb-dragger-styler {
    background-color: rgba(48, 121, 244,.5);
    margin: 0px;
    height: 100%;
}

.vb.vb-dragging > .vb-dragger > .vb-dragger-styler {
    background-color: rgba(48, 121, 244,.5);
    margin: 0px;
    height: 100%;
}

.vb.vb-dragging-phantom > .vb-dragger > .vb-dragger-styler {
    background-color: rgba(48, 121, 244,.5);
}

</style>

