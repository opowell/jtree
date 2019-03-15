
<template>
    <div v-if='areas.length < 1' class='area'>
        <div class='tabs'>
            <div style='display: flex'>
                <menu-el :menu='{
                    icon: "fa fa-align-center",
                    hasParent: false,
                }'></menu-el>
            </div>
            <span 
                v-for='(panel, index) in panels'
                :key='index'
                class='tab'
                :class='{"selected": isSelected(panel)}'
                @click='setActivePanelIndex(index)'
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
             @mousedown.native.prevent='startMove'
            />
            <menu-el :menu='{
            icon: "far fa-window-minimize",
            hasParent: false,
            }'></menu-el>
            <menu-el :menu='{
            icon: "far fa-window-restore",
            action: restore,
            hasParent: false,
            }'></menu-el>
            <menu-el :menu='{
            icon: "far fa-window-close",
            action: close,
            hasParent: false,
            }'></menu-el>
        </div>
        <div class='action-bar'>
                <menu-el :menu='{
                    icon: "fas fa-angle-double-right",
                    action: createChild,
                    clickData: "horizontal",
                    hasParent: false,
                }' />
                <menu-el :menu='{
                    icon: "fas fa-angle-double-down",
                    action: createChild,
                    clickData: "vertical",
                    hasParent: false,
                }' />
                <menu-el :menu='{
                    icon: "fas fa-columns",
                    action: splitAsSibling,
                    hasParent: false,
                }' />
                <menu-el :menu='{
                    icon: "fas fa-arrow-left",
                    action: sendActivePanelToPreviousSibling,
                    clickData: area,
                    hasParent: false,
                }' />
        </div>
        <div v-if='activePanel != null' class='content' :is='activePanel.type' :dat='activePanel.data' /> 
    </div>
    <div v-else class='areas' :class='{
            "split-horizontal": isSplitHorizontal,
            "split-vertical": isSplitVertical,}
        '>
        <template v-for='(curArea, index) in areas' >
            <jt-area
                :key='"area-" + index'
                :areaProp='curArea'
                :parent='area'
                :window='window'
                :indexOnParent='index'
                @startmove='startMove'
                :activePanelInd='curArea.activePanelInd'
            />
            <div 
                v-if='index < areas.length - 1'
                class='adjuster'
                :key='"adjuster-" + index'
            />
        </template>
    </div>
</template>

<script>
import PanelOne from './PanelOne.vue';
import PanelTwo from './PanelTwo.vue';
import MenuEl from './MenuEl.vue';
import JtSpacer from './JtSpacer.vue';
// import FilesPanel from '@/components/FilesPanel.vue'
// import GamesPanel from '@/components/GamesPanel.vue'
// import SessionsPanel from '@/components/SessionsPanel.vue'
// import SettingsPanel from '@/components/SettingsPanel.vue'

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
      PanelOne,
      PanelTwo,
      'font-awesome-icon': FontAwesomeIcon,
    // FilesPanel,
    // GamesPanel,
    // SessionsPanel,
    // SettingsPanel,
  },
  props: [
      'areaProp',
      'parent',
      'window',
      'indexOnParent',
      'activePanelInd',
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
        splitDirection() {
          if (this.area.splitDirection != null) {
              return this.area.splitDirection;
          } else {
              return 'horizontal'; // or "vertical",
          }
      },
      activePanel() {
          if (this.activePanelInd < 0 || this.panels == null || this.activePanelInd >= this.panels.length) {
              return null;
          } else {
            return this.panels[this.activePanelInd];
          }
      },
      isSplitVertical() {
          return this.splitDirection === 'vertical';
      },
      isSplitHorizontal() {
          return this.splitDirection === 'horizontal';
      },
    style() {
            return {
                'flex-direction': this.flexDirection,
            }
    },
  },

  methods: {
      startMove(ev) {
          console.log('start move');
          this.$emit('startmove', ev);
      },
        restore() {
            this.$store.commit('toggleWindowsMaximized');
        },
    setActivePanelIndex(index) {
            let areaPath = [];
            let curArea = this.area;
            while (curArea.parent != null) {
                areaPath.unshift(curArea.indexOnParent);
                curArea = curArea.parent;
            }
            this.$store.commit('setActivePanelIndex', {
                index,
                areaPath,
                window: this.window,
            });
        },
        close() {
            let areaPath = [];
            let curArea = this.area;
            while (curArea.parent != null) {
                areaPath.unshift(curArea.indexOnParent);
                curArea = curArea.parent;
            }

            this.$store.commit('closeArea', {
                areaPath,
                window: this.window,
            });
        },
      createChild(dir) {
          let areaPath = [];
            let curArea = this.area;
            while (curArea.parent != null) {
                for (let i=0; i<curArea.parent.areas.length; i++) {
                    if (curArea.parent.areas[i] === curArea) {
                        areaPath.unshift(i);
                        break;
                    }
                }
                curArea = curArea.parent;
            }
            this.$store.commit('createChild', {
              splitDirection: dir,
              areaPath,
              window: this.window,
              activePanelInd: this.activePanelInd,
          });
      },
      closeActivePanel() {
          this.closePanel(this.activePanelInd);
      },
    closePanel(index) {
            let areaPath = [];
            let curArea = this.area;
            while (curArea.parent != null) {
                for (let i=0; i<curArea.parent.areas.length; i++) {
                    if (curArea.parent.areas[i] === curArea) {
                        areaPath.unshift(i);
                        break;
                    }
                }
                curArea = curArea.parent;
            }
        this.$store.commit('closePanel', {
            panelIndex: index,
            areaPath: areaPath,
            window: this.window,
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
    splitAsSibling() {
      let panel = this.activePanel;
      if (this.areas.length < 0) {
          this.areas.push({
              activePanel: null,
              panels: this.panels.splice(0, this.panels.length-1),
          });
          this.areas[0].activePanel = this.activePanel;
      }
      this.areas.push({
        activePanel: panel,
        panels: [
          panel,
        ],
      });
    //   this.closePanel({area, panel});
    },
    splitOff(index) {
      let area = this.areas[index];
      let panel = area.activePanel;
      this.areas.push({
        activePanel: panel,
        panels: [
          panel,
        ],
      });
      this.closePanel({area, panel});
    },
    toggleSplitDirection() {
      if (this.splitDirection === 'horizontal') {
        this.splitDirection = 'vertical';
      } else {
        this.splitDirection = 'horizontal';
      }
    },
    removeSplit(index) {
      let panels = this.areas[index].panels;
      let activePanel = this.areas[index].activePanel;
      let prevIndex = Math.max(0, index - 1);
      this.areas[prevIndex].panels.push(panels);
      this.areas[prevIndex].activePanel = activePanel;
    },
    closejt() {
      this.$store.commit('removePanel', this);
    },
    focus() {
      this.click();            
    },
    toggleMaximized() {
      const state = this.$store.state;
      state.windowsMaximized = !state.windowsMaximized;
      state.activePanel = this; // the jt-panel.
    },
    click() {
      this.$store.commit('setPanelFocussed', this);
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

.tab {
    background-color: #888;
    padding-top: 5px;
    padding-bottom: 5px;
    padding-left: 25px;
    padding-right: 5px;
    cursor: default;
    border-right: 1px solid;
    display: flex;
}

.tab:hover {
    color: #fff;
}

.tab.selected {
    background-color: #AAA;
    border-bottom-color: #AAA;
    color: #fff;
}

.tab.spacer {
    flex: 1 1 auto;
    background-color: transparent;
    border-right-width: 0px;
    padding: 0px;
    margin: 0px;
}

.content {
    background-color: #FFF;
    flex: 1 1 auto;
}

.split-vertical {
    flex-direction: column;
}

.split-horizontal {
    flex-direction: row;
}

.areas {
    display: flex;
    flex: 1 1 300px;
}

.area {
    flex: 1 1 300px;
    display: flex;
    flex-direction: column;
}

.adjuster {
    background-color: #dadada;
    flex: 0 0 1px;
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

</style>