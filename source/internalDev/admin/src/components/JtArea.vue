
<template>
    <div v-if='areas.length < 1' class='area' :style='style'>
        <div class='tabs'>
            <menu-el :menu='{
                icon: "fa fa-align-center",
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
                        icon: "fas fa-angle-double-right",
                        action: createChild,
                        text: "Create child (Col)",
                        clickData: false,
                        hasParent: false,
                    },
                    {
                        icon: "fas fa-angle-double-down",
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
                        icon: "far fa-window-close",
                        text: "Close Area",
                        action: close,
                    },
                    {
                        icon: "fas fa-exchange-alt",
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
                        icon: "far fa-window-minimize",
                        hasParent: false,
                        text: "(Minimize)",
                    },
                    {
                        icon: "far fa-window-restore",
                        action: restore,
                        text: "Restore",
                    },
                ],
            }' />

            <!-- TABS -->
            <span 
                v-for='(panel, index) in panels'
                :key='index'
                class='tab'
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
                :window='window'
                :area='area'
            />
        </div>
        <div class='action-bar'>
        </div>
        <div class='content-vbar elone'>
            <div 
                v-for='(panel, index) in panels'
                v-show='activePanelInd === index'
                class='content eltwo'
                :is='panel.type'
                :dat='panel.data'
                :key='"panel-" + index' /> 
        </div>
    </div>
    <div v-else 
        class='areas'
        :class='{
            "flex-direction-column": isRowChildren,
            "flex-direction-row": !isRowChildren,
        }'
        :style='style'
    >
        <template v-for='(curArea, index) in areas' >
            <jt-area
                :key='"area-" + index'
                :areaProp='curArea'
                :parent='area'
                :window='window'
                :indexOnParent='index'
                @startmove='startMove'
                :activePanelInd='curArea.activePanelInd'
                :rowChildren='curArea.rowChildren'
                :flex='curArea.flex'
                :isLastArea='index === areas.length - 1'
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
import FilesPanel from '@/components/FilesPanel.vue'
import GamesPanel from '@/components/GamesPanel.vue'
import GameTreePanel from '@/components/GameTreePanel.vue'
import SessionInfoPanel from '@/components/SessionInfoPanel.vue'
import SessionsPanel from '@/components/SessionsPanel.vue'
import SettingsPanel from '@/components/SettingsPanel.vue'

import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faCaretRight, faCaretDown, faTable, faImage, faFile, faCircle, faCode, faFolder, faFolderOpen, faTimes
} from '@fortawesome/free-solid-svg-icons';
import { faJs, } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
library.add(faJs, faCaretRight, faCaretDown, faTable, faImage, faFile, faCircle, faCode, faFolder, faFolderOpen, faTimes);


export default {
  name: 'JtArea',
  components: {
      JtSpacer,
      MenuEl,
      'font-awesome-icon': FontAwesomeIcon,
    FilesPanel,
    GameTreePanel,
    GamesPanel,
    SessionInfoPanel,
    SessionsPanel,
    SettingsPanel,
  },
  props: [
      'areaProp',
      'parent',
      'window',
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
      this.area.window = this.window;
  },
  computed: {
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
    style() {
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
                windowId: this.window.id,
                areaPath: this.areaPath,
                index,
            }
        },
        dropOnTab(index, ev) {
            ev.preventDefault();
            ev.target.classList.remove('highlight');
            let targetData = {
                windowId: this.window.id,
                areaPath: this.areaPath,
                index,
            };
            let same = this.samePanel(this.$store.state.dragData, targetData);
            if (same === false) {
                this.$store.dispatch('dropOnTab', {
                    sourceWindowId: this.$store.state.dragData.windowId,
                    sourceAreaPath: this.$store.state.dragData.areaPath,
                    sourcePanelIndex: this.$store.state.dragData.index,
                    targetWindowId: this.window.id,
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
                windowId: this.window.id,
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
              windowId: this.window.id,
              panelInd: this.activePanelInd,
          });
      },
      changeSelectedIndex(change) {
          this.$store.commit('changeSelectedIndex', {
              areaPath: this.areaPath,
              windowId: this.window.id,
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
              windowId: this.window.id,
              areaPath,
              size: this.adjustData.newSize,
          });
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
                windowId: this.window.id,
            });
        },
        close() {
            this.$store.commit('closeArea', {
                areaPath: this.areaPath,
                windowId: this.window.id,
            });
        },
      createChild(rowChildren) {
            this.$store.commit('createChild', {
              areaPath: this.areaPath,
              windowId: this.window.id,
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
            windowId: this.window.id,
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
            windowId: this.window.id,
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
    color: #CCC;
}

.tabs > span:hover {
    color: #fff;
}

.tab {
    background-color: #888;
    padding-top: 5px;
    padding-bottom: 5px;
    padding-left: 25px;
    padding-right: 5px;
    cursor: default;
    border-right: 1px solid;
    display: flex;
    white-space: nowrap;
}

.tab:hover {
    color: #fff;
}

.tab.selected {
    background-color: #353535;
    border-bottom-color: #353535;
    color: #fff;
}

.tab.spacer {
    flex: 1 1 auto;
    background-color: transparent;
    border-right-width: 0px;
    padding: 0px;
    margin: 0px;
}

.content-vbar {
    flex: 1 1 auto;
    display: flex;    
}

.content {
    background-color: #353535;
    color: #CCC;
    flex: 1 1 auto;
    overflow: auto;
    display: flex;
    flex-direction: column;
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
}

.area {
    display: flex;
    flex-direction: column;
    overflow: auto;
}

.adjuster {
    flex: 0 0 1px;
    padding: 3px;
}

.closeButton {
    display: none;
    align-self: center;
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

</style>