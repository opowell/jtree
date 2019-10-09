
<template>
    <!-- SINGLE AREA -->
    <div v-if='areas.length < 1' class='area' :style='areaStyle'>
        <!-- TABS -->
        <div class='tabs'>
            <menu-el
                :dblclickFunc="close"
                :menu='{
                icon: ["fas", "align-center"],
                hasParent: false,
                showIcon: true,
                children: [
                    {
                        text: "Next Panel",
                        action: changeSelectedIndex,
                        clickData: 1,
                    },
                    {
                        text: "Previous Panel",
                        action: changeSelectedIndex,
                        clickData: -1,
                    },
                    {
                        icon: ["fas", "angle-double-right"],
                        action: createChild,
                        text: "Create child (Col)",
                        clickData: false,
                        hasParent: false,
                    },
                    {
                        icon: ["fas", "angle-double-down"],
                        action: createChild,
                        text: "Create child (Row)",
                        clickData: true,
                        hasParent: false,
                    },
                    {
                        text: "New sibling of parent",
                        hasParent: false,
                        action: newSiblingOfParent,
                    },
                    "divider",
                    {
                        text: "Close Area",
                        action: close,
                    },
                    {
                        text: "Close Window",
                        action: closeWindow,
                    },
                    {
                        icon: ["fas", "exchange-alt"],
                        text: "Toggle parent dir.",
                        action: toggleRowChildren,
                    },
                    "divider",
                    {
                        text: "(Next Window)",
                    },
                    {
                        text: "(Previous Window)",
                    },
                    "divider",
                    {
                        icon: ["far", "window-minimize"],
                        hasParent: false,
                        text: "(Minimize)",
                    },
                    {
                        icon: ["far", "window-restore"],
                        action: restore,
                        text: "Restore",
                    },
                ],
            }' />

            <!-- SINGLE TAB -->
            <template v-if='hideTabsWhenSinglePanel && panels.length === 1'>
                <jt-spacer
                    @mousedown.native='startMove'
                    :window='window'
                    :area='area'
                >
                    {{panels[0].id}}
                </jt-spacer>
                <menu-el
                    :menu='{
                        icon: "fas fa-times",
                        hasParent: false,
                        showIcon: true,
                        action: closeActivePanel,
                    }'
                    class='closeIcon title-bar-icon'
                />
            </template>
            <!-- MULTIPLE TABS -->
            <template v-else>
                <span 
                    v-for='(panel, index) in panels'
                    :key='index'
                    class='tab tabHover'
                    :class='{"selected": isSelected(panel)}'
                    @mousedown='setActivePanelIndex(index)'
                    draggable="true"
                    @dragstart='dragStart(index)'
                    @dragleave="dragLeaveTab"
                    @drop='dropOnTab(index, $event)'
                    @dragover='dragOver'
                    @dragenter="dragEnterTab(index, $event)"
                >
                    {{panel.id}}
                    <span style='width: 20px; display: flex; margin-left: 5px;'>
                        <font-awesome-icon
                            class='closeButton'
                            @click.stop='closePanel(index)'
                            icon="times"
                            style='width: 20px'
                        />
                    </span>
                </span>
                <jt-spacer
                    @mousedown.native='startMove'
                    :windowDesc='windowDesc'
                    :area='area'
                />
            </template>
        </div>
        <!-- CONTENT -->
            <!-- v-show='activePanelInd === index' -->

        <div 
            v-for='(panel, index) in panels'
            v-bind:style='[activePanelInd === index ? {} : {"z-index": -1, "width": "1px", "height": "1px", "position": "absolute"}]'
            class='content'
            :is='panel.type'
            :dat='panel.data'
            :panel='panel'
            :key='"panel-" + index' /> 
    </div>
    <!-- MULTIPLE AREAS -->
    <div v-else 
        class='areas'
        :class='{
            "flex-direction-column": isRowChildren,
            "flex-direction-row": !isRowChildren,
        }'
        :style='areaStyle'
    >
        <template v-for='(curArea, index) in areas' >
            <jt-area
                :key='"area-" + index'
                :areaProp='curArea'
                :parent='area'
                :windowDesc='windowDesc'
                :indexOnParent='index'
                @startmove='startMove'
                :rowChildren='curArea.rowChildren'
                :isLastArea='index === areas.length - 1'
                :flex='curArea.flex'
                :activePanelInd='curArea.activePanelInd'
            />
            <div 
                v-if='index < areas.length - 1'
                class='adjuster'
                :key='index'
                :style='adjusterStyle'
                @mousedown.stop.prevent='startAdjust(index, curArea, index, area, $event)'
            />
        </template>
    </div>
</template>

<script>
import MenuEl from './MenuEl.vue';
import JtSpacer from './JtSpacer.vue';
// Panels
// import FilesPanel from '@/components/FilesPanel.vue'
// import GamesPanel from '@/components/GamesPanel.vue'
// import GameTreePanel from '@/components/GameTreePanel.vue'
// import SessionInfoPanel from '@/components/SessionInfoPanel.vue'
// import SessionActionsPanel from '@/components/SessionActionsPanel.vue'
// import SessionParticipantsPanel from '@/components/SessionParticipantsPanel.vue'
// import SessionMonitorPanel from '@/components/SessionMonitorPanel.vue'
// import SessionsPanel from '@/components/SessionsPanel.vue'

import SettingsPanel            from '@/panels/Settings.vue'
import ViewApp                  from '@/panels/App.vue'
import ViewApps                 from '@/panels/Apps.vue'
import ViewWelcome              from '@/panels/Welcome.vue'
import ViewLog                  from '@/panels/Log.vue'
import ViewQueue                from '@/panels/Queue.vue'
import ViewQueues               from '@/panels/Queues.vue'
import ViewSessions             from '@/panels/Sessions.vue'
import ViewSessionActivity      from '@/panels/SessionActivity.vue'
import ViewSessionApps          from '@/panels/SessionApps.vue'
import ViewSessionControls      from '@/panels/SessionControls.vue'
import ViewSessionSettings      from '@/panels/SessionSettings.vue'
import ViewSessionParticipants  from '@/panels/SessionParticipants.vue'

import jt from '@/webcomps/jtree.js';

export default {
  name: 'JtArea',
  components: {
    JtSpacer,
    MenuEl,
    ViewApp,
    ViewApps,
    ViewWelcome,
    ViewLog,
    ViewQueue,
    ViewQueues,
    ViewSessions,
    ViewSessionActivity,
    ViewSessionApps,
    ViewSessionControls,
    ViewSessionParticipants,
    ViewSessionSettings,
    // FilesPanel,
    // GameTreePanel,
    // GamesPanel,
    // SessionInfoPanel,
    // SessionActionsPanel,
    // SessionMonitorPanel,
    // SessionParticipantsPanel,
    // SessionsPanel,
    SettingsPanel,
  },
  props: [
      'areaProp',
      'parent',
      'windowDesc',
      'indexOnParent', // Non-array fields must be listed explicitly for some reason, otherwise they do not update.
      'activePanelInd',
      'isLastArea',
      'flex',
      'rowChildren',
  ],
  data() {
      return {
        area: {
            panels: this.areaProp.panels,
            areas: this.areaProp.areas,  
            indexOnParent: this.indexOnParent,
        },
      }
  },
  mounted() {
      this.area.parent = this.parent;
      this.area.windowDesc = this.windowDesc;
  },
  computed: {
      hideTabsWhenSinglePanel() {
          return this.$store.state.hideTabsWhenSinglePanel;
      },
      panels() {
          return this.area.panels;
      },
      areas() {
        return this.area.areas;
      },
      isRowChildren() {
        return this.rowChildren;
      },
      activePanel() {
          if (this.activePanelInd < 0 || this.panels == null || this.activePanelInd >= this.panels.length) {
              return null;
          } else {
            return this.panels[this.activePanelInd];
          }
      },
    //   activePanelInd() {
    //       return this.areaProp.activePanelInd;
    //   },
    areaStyle() {
        if (this.isLastArea) {
            return {
                'flex': '1 1 100px',
            }
        } else {
            return {
                'flex': this.flex,
            }
        }
    },
    adjusterStyle() {
        let cursor = this.isRowChildren ? 'ns-resize' : 'ew-resize';
        return {
            cursor: cursor,
        }
    },
    areaPath() {
            let areaPath = [];
            let curArea = this.area;
            while (curArea.parent != null) {
                areaPath.unshift(curArea.indexOnParent);
                curArea = curArea.parent;
            }
        return areaPath;
    },
  },

  methods: {
        dragStart(index) {
            this.$store.state.dragData = {
                windowId: this.windowDesc.id,
                areaPath: this.areaPath,
                index,
            }
        },
        dropOnTab(index, ev) {
            ev.preventDefault();
            ev.stopPropagation();
            ev.target.classList.remove('highlight');
            let targetData = {
                windowId: this.windowDesc.id,
                areaPath: this.areaPath,
                index,
            };
            let same = this.samePanel(this.$store.state.dragData, targetData);
            if (same === false) {
                this.$store.dispatch('dropOnTab', {
                    sourceWindowId: this.$store.state.dragData.windowId,
                    sourceAreaPath: this.$store.state.dragData.areaPath,
                    sourcePanelIndex: this.$store.state.dragData.index,
                    targetWindowId: this.windowDesc.id,
                    targetAreaPath: this.areaPath,
                    targetIndex: index,
                });
            }
        },
        dragOver(ev) {
            ev.preventDefault();
        },
        samePanel(panel1Data, panel2Data) {
            let out = (panel1Data.windowId === panel2Data.windowId &&
                panel1Data.areaPath === panel2Data.areaPath && 
                panel1Data.index === panel2Data.index);
            return out;
        },
        dragEnterTab(index, ev) {
            let targetData = {
                windowId: this.windowDesc.id,
                areaPath: this.areaPath,
                index,
            };
            let samePanel = this.samePanel(this.$store.state.dragData, targetData);
            if (samePanel === false) {
                let el = ev.target;
                el.classList.add('highlight');
            }
        },
        dragLeaveTab(ev) {
            ev.target.classList.remove('highlight');
        },
      newSiblingOfParent() {
          this.$store.commit('newSiblingOfParent', {
              areaPath: this.areaPath,
              windowId: this.windowDesc.id,
              panelInd: this.activePanelInd,
          });
      },
      changeSelectedIndex(change) {
          this.$store.commit('changeSelectedIndex', {
              areaPath: this.areaPath,
              windowId: this.windowDesc.id,
              change,
          })
      },
      startAdjust(index, curArea, indexOnParent, parent, ev) {
			let startX =
				typeof ev.pageX !== 'undefined' ? ev.pageX : ev.touches[0].pageX;
			let startY =
                typeof ev.pageY !== 'undefined' ? ev.pageY : ev.touches[0].pageY;
                let el = ev.currentTarget.previousSibling;
          this.adjustData = {
              index,
              curArea,
              indexOnParent,
              parent,
              startX,
              startY,
              origWidth: el.clientWidth,
              origHeight: el.clientHeight,
          }
			document.documentElement.addEventListener('mousemove', this.adjust);
            document.documentElement.addEventListener('mouseup', this.stopAdjust);
            jt.coverUpParticipantViews(true);
      },
      adjust(ev) {
          ev.preventDefault();
          ev.stopPropagation();
			let adjustX =
				typeof ev.pageX !== 'undefined' ? ev.pageX : ev.touches[0].pageX;
			let adjustY =
				typeof ev.pageY !== 'undefined' ? ev.pageY : ev.touches[0].pageY;
        let size = null;
        if (this.rowChildren) {
            size = this.adjustData.origHeight + (adjustY - this.adjustData.startY);
        } else {
            size = this.adjustData.origWidth + (adjustX - this.adjustData.startX);
        }
          this.adjustData.newSize = size;
          this.adjustData.curArea.flex = '0 0 ' + size + 'px';
      },
      stopAdjust(ev) {
          ev.preventDefault();
          ev.stopPropagation();
			document.documentElement.removeEventListener('mousemove', this.adjust);
			document.documentElement.removeEventListener('mouseup', this.stopAdjust);
            let areaPath = [];
            let parent = this.adjustData.parent;
            let curArea = this.adjustData.curArea;
            let indexOnParent = this.adjustData.indexOnParent;
            while (parent != null) {
                areaPath.unshift(indexOnParent);
                curArea = parent;
                parent = curArea.parent;
                indexOnParent = curArea.indexOnParent;
            }
          this.$store.commit('setAreaSize', {
              windowId: this.windowDesc.id,
              areaPath,
              size: this.adjustData.newSize,
          });
            jt.coverUpParticipantViews(false);
      },
      startMove(ev) {
          this.$emit('startmove', ev);
      },
        restore() {
            this.$store.commit('toggleWindowsMaximized');
        },
    setActivePanelIndex(index) {
        this.$store.commit('setActivePanelIndex', {
                index,
                areaPath: this.areaPath,
                windowId: this.windowDesc.id,
            });
        },
        close() {
            this.$store.commit('closeArea', {
                areaPath: this.areaPath,
                windowId: this.windowDesc.id,
            });
        },
        closeWindow() {
            this.$store.commit('closeWindow', this);
        },
      createChild(rowChildren) {
            this.$store.commit('createChild', {
              areaPath: this.areaPath,
              windowId: this.windowDesc.id,
              panelInd: this.activePanelInd,
              rowChildren,
            });
      },
      closeActivePanel() {
          this.closePanel(this.activePanelInd);
      },
    closePanel(index) {
        this.$store.commit('closePanel', {
            panelIndex: index,
            areaPath: this.areaPath,
            windowId: this.windowDesc.id,
        });
    },
    closeArea(area) {
        for (let i=0; i<this.areas.length; i++) {
            if (this.areas[i] === area) {
                this.areas.splice(i, 1);
                if (this.areas.length < 1) {
                    this.closeSelf();
                }
                break;
            }
        }
    },
    closeSelf() {
        // Tell parent to drop this MultiPanel.
    },
    isSelected(panel) {
      return this.activePanel === panel;
    },
    // eslint-disable-next-line
    sendPanelsToPreviousSibling(area) {

    },
    // eslint-disable-next-line
    sendPanelToPreviousSibling(area, panel) {

    },
    // eslint-disable-next-line
    sendActivePanelToPreviousSibling(area) {

    },
    focus() {
      this.click();            
    },
    click() {
      this.$store.commit('setWindowFocussed', this);
    },
    toggleRowChildren() {
        let parentAreaPath = [];
        for (let i=0; i<this.areaPath.length - 1; i++) {
            parentAreaPath.push(this.areaPath[i]);
        }
        this.$store.commit('toggleRowChildren', {
            windowId: this.windowDesc.id,
            areaPath: parentAreaPath,
        });
    },
  },
}
</script>

<style scoped>
.active {
    display: flex;
}

.tabs {
    display: flex;
    flex: 0 0 auto;
    background-color: var(--tabsBGColor);
    border-top-right-radius: 5px;
    border-top-left-radius: 5px;
}

.tabHover:hover {
    background-color: var(--tabHoverBGColor);
}

.tab {
    background-color: var(--tabBGColor);
    padding-top: 5px;
    padding-bottom: 5px;
    padding-left: 25px;
    padding-right: 5px;
    cursor: default;
    border-right: 1px solid;
    display: flex;
    white-space: nowrap;
    color: var(--tabFontColor);
}

.tab.spacer {
    flex: 1 1 auto;
    background-color: transparent;
    border-right-width: 0px;
    padding: 0px;
    margin: 0px;
    color: inherit;
}

.content-vbar {
    flex: 1 1 auto;
    display: flex;
    background-color: var(--panelContentBGColor);
}

.content {
    background-color: var(--areaContentBGColor);
    color: var(--areaContentFontColor);
    flex: 1 1 auto;
    overflow: auto;
    display: flex;
    flex-direction: column;
    box-shadow: 0px 0px 7px 1px rgba(0, 0, 0, 0.4);
    border-radius: 5px;
    padding: 10px;
}

.flex-direction-column {
    flex-direction: column;
}

.flex-direction-row {
    flex-direction: row;
}

.areas {
    display: flex;
    flex: 1 1 300px;
    overflow: auto;
}

.area {
    display: flex;
    flex-direction: column;
    overflow: auto;
    padding: 5px;
}

.adjuster {
    flex: 0 0 1px;
    padding: 3px;
}

.closeButton {
    display: none;
    align-self: center;
    color: #AAA;
}

.closeButton:hover {
    color: #000;
}

.tab:hover .closeButton {
    display: flex;
}

.selected .closeButton {
    display: flex;
}

.action-bar {
    background-color: #AAA;
    display: flex;
}

.highlight {
    background-color: #ff00004f;
}

.tab.highlight {
    background-color: #ff00004f;
}

.singleTab {
    padding-top: 5px;
    padding-bottom: 6px;
    padding-right: 5px;
    cursor: default;
    display: flex;
    white-space: nowrap;
    flex: 1 1 auto;
}

.selected {
    background-color: var(--tabSelectedBGColor);
    /* border-bottom-color: #353535; */
    color: var(--tabSelectedFontColor);
    z-index: 0;
}

.title-bar-icon {
    color: var(--panelCloseButtonColor);
    border: 1px solid rgba(0,0,0,0.4);
    border-radius: 3px;
    align-self: center;
}

.title-bar-icon:hover {
    background-color: #36a9fb;
}

.closeIcon {
    margin-right: 2px;
}

</style>

<style>
.title-bar-icon > .icon {
    padding: 0px;
    width: 20px;
    margin-left: 3px;
    margin-right: 3px;
    padding-top: 1px;
    padding-bottom: 1px;
}

</style>