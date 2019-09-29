<template>
  <div>
    <!-- <AllLinks/> -->
    <MainMenu/>
    <TabBar/>

    <keep-alive>
      <component class='panel' v-show='selPanelType != null' :is='selPanelType'/>
    </keep-alive>

    <viewappeditor-modal/>
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

import MainMenu from '@/components/MainMenu.vue'
import ViewApps from '@/components/ViewApps.vue'
import ViewApp from '@/components/ViewApp.vue'
import ViewHome from '@/components/ViewHome.vue'
import ViewLog from '@/components/ViewLog.vue'
import ViewSessionActivity from '@/components/ViewSessionActivity.vue'
import ViewSessionApps from '@/components/ViewSessionApps.vue'
import ViewSessionControls from '@/components/ViewSessionControls.vue'
import ViewSessionSettings from '@/components/ViewSessionSettings.vue'
import ViewSessionParticipants from '@/components/ViewSessionParticipants.vue'
import ConfirmModal from '@/components/ConfirmModal.vue'
import TabBar from '@/components/TabBar.vue'

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

import '@/webcomps/Model.js'
import '@/webcomps/circularjson.js'





import '@/webcomps/ViewAppPreview.js'

export default {
  name: 'home',
  components: {
    // AllLinks,
    MainMenu,
    ViewApp,
    ViewApps,
    ViewHome,
    ViewLog,
    ConfirmModal,
    TabBar,
    ViewSessionActivity,
    ViewSessionApps,
    ViewSessionControls,
    ViewSessionParticipants,
    ViewSessionSettings,
  },
  computed: {
    selPanelType() {
      let state = this.$store.state;
      if (state.shownPanel < 0) {
        return 'test';
      }
      return state.panels[state.shownPanel].type;
    }
  }
}
</script>

<style scoped>
.panel {
  padding: 1rem;
}
</style>
