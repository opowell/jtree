<template>
    <div v-if='areas.length < 1' class='area'>
        <div class='tabs'>
            <div style='display: flex'>
                <menu-el :menu='{
                    icon: "fas fa-exchange-alt",
                    action: toggleSplitDirection,
                    hasParent: false,
                }' />
                <menu-el :menu='{
                    icon: "fas fa-times",
                    action: closeSelf,
                    hasParent: false,
                }' />
                <menu-el :menu='{
                    icon: "fas fa-arrow-left",
                    action: sendPanelsToPreviousSibling,
                    hasParent: false,
                }' />
            </div>
            <span 
                v-for='panel in panels'
                :key='panel.id'
                class='tab'
                :class='{"selected": isSelected(panel)}'
                @click='setActivePanel(panel)'
            >
                {{panel.id}}
                <span style='width: 20px; display: flex; margin-left: 5px;'>
                    <font-awesome-icon
                        class='closeButton'
                        @click.stop='closePanel({area, panel})'
                        icon="times"
                        style='width: 20px'
                    />
                </span>
            </span>
            <span class='tab spacer'>
            </span>
        </div>
        <div class='action-bar'>
                <menu-el :menu='{
                    icon: "fas fa-times",
                    action: closeActivePanel,
                    clickData: area,
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
        <template v-for='(area, index) in areas' >
            <jt-area
                :key='"area-" + index'
                :area='area'
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
      MenuEl,
      PanelOne,
      PanelTwo,
      'font-awesome-icon': FontAwesomeIcon
  },
  props: [
      'area',
  ],
  data() {
      return {
        areas: [],
        panels: this.area.panels,
        activePanel: this.area.panels[0],
        splitDirection: 'horizontal', // or "vertical"
      }
  },
  computed: {
      isSplitVertical() {
          return this.splitDirection === 'vertical';
      },
      isSplitHorizontal() {
          return this.splitDirection === 'horizontal';
      },
      isSplit() {
          return this.isSplitVertical || this.isSplitHorizontal;
      },
      isActive() {
          return !this.isMaximized || this === this.$store.state.activePanel;
      },
      isFocussed() {
          return this === this.$store.state.activePanel;
      },
      isMaximized() {
          return this.$store.state.panelsMaximized;
      },
      zIndex() {
            const panels = this.$store.state.panels;
            for (var i=0; i < panels.length; i++) { 
                if (panels[i].panelId === this.panelId) {
                    return i; 
                }
            }
            return -1;
      },
    style() {
        if (this.isMaximized) {
            return {
                position: 'unset',
                width: 'auto',
                height: 'auto',
                flex: '1 1 auto',
                'box-shadow': 'none',
                border: 'none',
                'flex-direction': this.flexDirection,
            }
        } else {
            return {
                top: this.top + 'px',
                left: this.left + 'px',
                width: this.width + 'px',
                height: this.height + 'px',
                zIndex: this.zIndex,
                'flex-direction': this.flexDirection,
            }
        }
    },
  },

  methods: {
      closeActivePanel(area) {
          this.closePanel({
              area: area, 
              panel: area.activePanel
          });
      },
    closePanel({area, panel}) {
      for (let i=0; i<area.panels.length; i++) {
        if (area.panels[i] === panel) {
          area.panels.splice(i, 1);
          if (area.panels.length < 1) {
              this.closeArea(area);
          } else if (panel === area.activePanel) {
            let nextIndex = Math.max(0, i-1);
            area.activePanel = area.panels[nextIndex];
          }
          break;
        }
      }
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
    setActivePanel(panel) {
      this.activePanel = panel;
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
      this.closePanel({area, panel});
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
      state.panelsMaximized = !state.panelsMaximized;
      state.activePanel = this; // the jt-panel.
    },
    click() {
      this.$store.commit('setPanelFocussed', this);
    },
  },
}
</script>

<style scoped>
.panel {
    background-color: #d5dce8;
    display: none; /* must be explicitly displayed using "active" class */
    flex-direction: column;
    position: absolute;
    border: 1px outset #ddd;
    border-top-left-radius: 4px;
    border-top-right-radius: 4px;
    border-bottom-left-radius: 1px;
    border-bottom-right-radius: 1px;
    width: 800px;
    height: 400px;
    top: 100px;
    left: 100px;
}

.panel.focussed {
    background-color: #9ec1de;
}

.handle {
  background-color: inherit;
  border-style: outset;
  border-width: 0px;
  margin: 0px;
  display: block;
  width: 7px;
  height: 7px;
  border-color: #dae1e7;
  position: absolute;
}

.handle-tl {
  border-top-left-radius: 5px;
  border-top: 1px outset;
  border-left: 1px outset;
    top: -5px;
    left: -5px;
    cursor: nwse-resize;
}

.handle-tc {
  border-top: 1px outset;
    width: calc(100% - 4px);
    left: 2px;
    top: -5px;
    cursor: ns-resize;
}

.handle-tr {
  border-top: 1px outset;
  border-right: 1px outset;
  border-top-right-radius: 5px;
    right: -5px;
    top: -5px;
        cursor: nesw-resize;

}

.handle-ml {
    border-left: 1px outset;
    height: calc(100% - 4px);
    top: 2px;
    left: -5px;
    cursor: ew-resize;
}

.handle-mr {
    border-right: 1px outset;
    height: calc(100% - 4px);
    top: 2px;
    right: -5px;
    cursor: ew-resize;
}

.handle-bl {
  border-left: 1px outset;
  border-bottom: 1px outset;
  border-bottom-left-radius: 5px;
  bottom: -5px;
  left: -5px;
  cursor: nesw-resize;
}

.handle-bc {
    width: calc(100% - 4px);
    left: 2px;
  bottom: -5px;
  border-bottom: 1px outset;
    cursor: ns-resize;
}

.handle-br {
  right: -5px;
  bottom: -5px;
  border-right: 1px outset;
  border-bottom: 1px outset;
  border-bottom-right-radius: 5px;
  cursor: nwse-resize;
}

.maxed > .handle {
    display: none;
}

.active {
    display: flex;
}

.tabs {
    display: flex;
    flex: 0 0 auto;
}

.tab {
    background-color: #CCC;
    border-bottom: 1px solid #888;
    padding-top: 5px;
    padding-bottom: 5px;
    padding-left: 25px;
    padding-right: 5px;
    cursor: default;
    border-right: 1px solid;
    display: flex;
}

.tab:hover {
    background-color: #DDD;
}

.tab.selected {
    background-color: #FFF;
    border-bottom-color: #FFF;
}

.tab.spacer {
    flex: 1 1 auto;
    background-color: #888;
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
    flex: 1 1 auto;
}

.area {
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    flex-basis: 300px;
}

.adjuster {
    background-color: #dadada;
    flex-basis: 1px;
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