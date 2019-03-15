<template>
    <div 
        class='panel' 
        @mousedown='click' 
        :class='{
            "focussed": isFocussed,
            "maxed": isMaximized,
            "active": isActive,
        }' 
        :style="style"
    >
        <jt-area :area='area'/>
        <span class='handle handle-tl' @mousedown.prevent='startResizeTL' />
        <span class='handle handle-tc' @mousedown.prevent='startResizeT' />
        <span class='handle handle-tr' @mousedown.prevent='startResizeTR' />
        <span class='handle handle-ml' @mousedown.prevent='startResizeL' />
        <span class='handle handle-mr' @mousedown.prevent='startResizeR' />
        <span class='handle handle-bl' @mousedown.prevent='startResizeBL' />
        <span class='handle handle-bc' @mousedown.prevent='startResizeB' />
        <span class='handle handle-br' @mousedown.prevent='startResizeBR' />
    </div>
</template>

<script>
// import PanelOne from './PanelOne.vue';
// import PanelTwo from './PanelTwo.vue';
// import MenuEl from './MenuEl.vue';
import JtArea from './JtArea.vue';

import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faCaretRight, faCaretDown, faTable, faImage, faFile, faCircle, faCode, faFolder, faFolderOpen, faTimes
} from '@fortawesome/free-solid-svg-icons';
import { faJs, } from '@fortawesome/free-brands-svg-icons';
// import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
library.add(faJs, faCaretRight, faCaretDown, faTable, faImage, faFile, faCircle, faCode, faFolder, faFolderOpen, faTimes);


export default {
  name: 'MultiPanel',
  components: {
      JtArea,
    //   MenuEl,
    //   PanelOne,
    //   PanelTwo,
    //   'font-awesome-icon': FontAwesomeIcon
  },
  data() {
      return {
          area: {
            panels: [
                {
                    id: 'panel1',
                    type: 'panel-one',
                    data: {
                        x: 8,
                    },
                },
                {
                    id: 'panel2',
                    type: 'panel-two',
                    data: {
                        y: 183,
                    },
                },
                {
                    id: 'panel3',
                    type: 'panel-one',
                    data: {
                        x: 18,
                    },
                },
                {
                    id: 'sec1',
                    type: 'panel-one',
                    data: {
                        x: 8324324,
                    },
                },
                {
                    id: 'sec2',
                    type: 'panel-two',
                    data: {
                        y: 18434433,
                    },
                },
            ],
        },
        dataTitle: 'Multipanel',
        left: this.x,
        top: this.y,
        width: this.w,
        height: this.h,
        resizeStartX: null,
        resizeStartY: null,
        moveStartX: null,
        moveStartY: null,
        minHeight: 100,
        minWidth: 200,
        minTop: 5,
        minLeft: 5,
        parentHeight: null,
        parentWidth: null,
      }
  },
    computed: {
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

  mounted() {
    this.parentElement = this.$el.parentNode.parentNode; // the panel container.
    this.parentWidth = this.parentElement.clientWidth - 5;
    this.parentHeight = this.parentElement.clientHeight - 5;
    this.$store.commit('addActivePanel', this);
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
    isSelected(area, panel) {
      return area.activePanel === panel;
    },
    setActivePanel(area, panel) {
      area.activePanel = panel;
    },
    sendPanelsToPreviousSibling(area) {
        console.log(area);
    },
    sendPanelToPreviousSibling(area, panel) {
        console.log(area);
        console.log(panel);
    },
    sendActivePanelToPreviousSibling(area) {
        console.log(area);
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
    startMove(ev) {
      if (this.isMaximized) {
        return;
      }
      document.documentElement.addEventListener('mousemove', this.move);
      document.documentElement.addEventListener('mouseup', this.stopMove);
      this.moveStartX = typeof ev.pageX !== 'undefined' ? ev.pageX : ev.touches[0].pageX;
      this.moveStartY = typeof ev.pageY !== 'undefined' ? ev.pageY : ev.touches[0].pageY;
      this.origTop = this.top;
      this.origLeft = this.left;
    },
    move(ev) {
      const pageX = typeof ev.pageX !== 'undefined' ? ev.pageX : ev.touches[0].pageX;
      let newLeft = this.origLeft + pageX - this.moveStartX;
      newLeft = Math.max(newLeft, this.minLeft);
      newLeft = Math.min(newLeft, this.parentWidth - this.width);
      this.left = newLeft;

      const pageY = typeof ev.pageY !== 'undefined' ? ev.pageY : ev.touches[0].pageY;
      let newTop = this.origTop + pageY - this.moveStartY;
      newTop = Math.max(newTop, this.minTop);
      newTop = Math.min(newTop, this.parentHeight - this.height);
      this.top = newTop;
    },
    stopMove() {
        document.documentElement.removeEventListener('mousemove', this.move);
        document.documentElement.removeEventListener('mouseup', this.stopMove);
        this.$store.commit('savePanelInfo', this);
    },

    startResizeTL(ev) {
        document.documentElement.addEventListener('mousemove', this.resizeTL);
        document.documentElement.addEventListener('mouseup', this.stopResizeTL);
        this.resizeStartX = typeof ev.pageX !== 'undefined' ? ev.pageX : ev.touches[0].pageX;
        this.resizeStartY = typeof ev.pageY !== 'undefined' ? ev.pageY : ev.touches[0].pageY;
        this.origTop = this.top;
        this.origLeft = this.left;
        this.origWidth = this.width;
        this.origHeight = this.height;
    },
    resizeTL(ev) {
        const pageX = typeof ev.pageX !== 'undefined' ? ev.pageX : ev.touches[0].pageX;
        const deltaX = pageX - this.resizeStartX;
        if (this.origWidth - deltaX >= this.minWidth) {
            this.left = this.origLeft + deltaX;
            this.width = this.origWidth - deltaX;
        }
        const pageY = typeof ev.pageY !== 'undefined' ? ev.pageY : ev.touches[0].pageY;
        const deltaY = pageY - this.resizeStartY;
        if (this.origHeight - deltaY >= this.minHeight) {
            this.top = this.origTop + deltaY;
            this.height = this.origHeight - deltaY;
        }
    },
    stopResizeTL() {
        document.documentElement.removeEventListener('mousemove', this.resizeTL);
        document.documentElement.removeEventListener('mouseup', this.stopResizeTL);
    },

    startResizeT(ev) {
        document.documentElement.addEventListener('mousemove', this.resizeT);
        document.documentElement.addEventListener('mouseup', this.stopResizeT);
        this.resizeStartY = typeof ev.pageY !== 'undefined' ? ev.pageY : ev.touches[0].pageY;
        this.origTop = this.top;
        this.origHeight = this.height;
    },
    resizeT(ev) {
        const pageY = typeof ev.pageY !== 'undefined' ? ev.pageY : ev.touches[0].pageY;
        const deltaY = pageY - this.resizeStartY;
        if (this.origHeight - deltaY >= this.minHeight) {
            this.top = this.origTop + deltaY;
            this.height = this.origHeight - deltaY;
        }
    },
    stopResizeT() {
        document.documentElement.removeEventListener('mousemove', this.resizeT);
        document.documentElement.removeEventListener('mouseup', this.stopResizeT);
    },

    startResizeTR(ev) {
        document.documentElement.addEventListener('mousemove', this.resizeTR);
        document.documentElement.addEventListener('mouseup', this.stopResizeTR);
        this.resizeStartX = typeof ev.pageX !== 'undefined' ? ev.pageX : ev.touches[0].pageX;
        this.resizeStartY = typeof ev.pageY !== 'undefined' ? ev.pageY : ev.touches[0].pageY;
        this.origTop = this.top;
        this.origLeft = this.left;
        this.origWidth = this.width;
        this.origHeight = this.height;
    },
    resizeTR(ev) {
        // Resize top
        const pageX = typeof ev.pageX !== 'undefined' ? ev.pageX : ev.touches[0].pageX;
        const deltaX = pageX - this.resizeStartX;
        if (this.origWidth + deltaX >= this.minWidth) {
            this.width = this.origWidth + deltaX;
        }
        // Resize RIGHT
        const pageY = typeof ev.pageY !== 'undefined' ? ev.pageY : ev.touches[0].pageY;
        const deltaY = pageY - this.resizeStartY;
        if (this.origHeight - deltaY >= this.minHeight) {
            this.top = this.origTop + deltaY;
            this.height = this.origHeight - deltaY;
        }
    },
    stopResizeTR() {
        document.documentElement.removeEventListener('mousemove', this.resizeTR);
        document.documentElement.removeEventListener('mouseup', this.stopResizeTR);
    },

    startResizeL(ev) {
        document.documentElement.addEventListener('mousemove', this.resizeL);
        document.documentElement.addEventListener('mouseup', this.stopResizeL);
        this.resizeStartX = typeof ev.pageX !== 'undefined' ? ev.pageX : ev.touches[0].pageX;
        this.origLeft = this.left;
        this.origWidth = this.width;
    },
    resizeL(ev) {
        const pageX = typeof ev.pageX !== 'undefined' ? ev.pageX : ev.touches[0].pageX;
        const deltaX = pageX - this.resizeStartX;
        if (this.origWidth - deltaX >= this.minWidth) {
            this.left = this.origLeft + deltaX;
            this.width = this.origWidth - deltaX;
        }
    },
    stopResizeL() {
        document.documentElement.removeEventListener('mousemove', this.resizeL);
        document.documentElement.removeEventListener('mouseup', this.stopResizeL);
    },

    startResizeR(ev) {
        document.documentElement.addEventListener('mousemove', this.resizeR);
        document.documentElement.addEventListener('mouseup', this.stopResizeR);
        this.resizeStartX = typeof ev.pageX !== 'undefined' ? ev.pageX : ev.touches[0].pageX;
        this.origLeft = this.left;
        this.origWidth = this.width;
    },
    resizeR(ev) {
        const pageX = typeof ev.pageX !== 'undefined' ? ev.pageX : ev.touches[0].pageX;
        const deltaX = pageX - this.resizeStartX;
        if (this.origWidth + deltaX >= this.minWidth) {
            this.width = this.origWidth + deltaX;
        }
    },
    stopResizeR() {
        document.documentElement.removeEventListener('mousemove', this.resizeR);
        document.documentElement.removeEventListener('mouseup', this.stopResizeR);
    },

    startResizeBL(ev) {
        document.documentElement.addEventListener('mousemove', this.resizeBL);
        document.documentElement.addEventListener('mouseup', this.stopResizeBL);
        this.resizeStartX = typeof ev.pageX !== 'undefined' ? ev.pageX : ev.touches[0].pageX;
        this.resizeStartY = typeof ev.pageY !== 'undefined' ? ev.pageY : ev.touches[0].pageY;
        this.origLeft = this.left;
        this.origWidth = this.width;
        this.origHeight = this.height;
    },
    resizeBL(ev) {
        // LEFT
        const pageX = typeof ev.pageX !== 'undefined' ? ev.pageX : ev.touches[0].pageX;
        const deltaX = pageX - this.resizeStartX;
        if (this.origWidth - deltaX >= this.minWidth) {
            this.left = this.origLeft + deltaX;
            this.width = this.origWidth - deltaX;
        }
        // BOTTOM
        const pageY = typeof ev.pageY !== 'undefined' ? ev.pageY : ev.touches[0].pageY;
        const deltaY = pageY - this.resizeStartY;
        if (this.origHeight + deltaY >= this.minHeight) {
            this.height = this.origHeight + deltaY;
        }
    },
    stopResizeBL() {
        document.documentElement.removeEventListener('mousemove', this.resizeBL);
        document.documentElement.removeEventListener('mouseup', this.stopResizeBL);
    },

    startResizeB(ev) {
        document.documentElement.addEventListener('mousemove', this.resizeB);
        document.documentElement.addEventListener('mouseup', this.stopResizeB);
        this.resizeStartY = typeof ev.pageY !== 'undefined' ? ev.pageY : ev.touches[0].pageY;
        this.origHeight = this.height;
    },
    resizeB(ev) {
        // BOTTOM
        const pageY = typeof ev.pageY !== 'undefined' ? ev.pageY : ev.touches[0].pageY;
        const deltaY = pageY - this.resizeStartY;
        if (this.origHeight + deltaY >= this.minHeight) {
            this.height = this.origHeight + deltaY;
        }
    },
    stopResizeB() {
        document.documentElement.removeEventListener('mousemove', this.resizeB);
        document.documentElement.removeEventListener('mouseup', this.stopResizeB);
    },

    startResizeBR(ev) {
        document.documentElement.addEventListener('mousemove', this.resizeBR);
        document.documentElement.addEventListener('mouseup', this.stopResizeBR);
        this.resizeStartX = typeof ev.pageX !== 'undefined' ? ev.pageX : ev.touches[0].pageX;
        this.resizeStartY = typeof ev.pageY !== 'undefined' ? ev.pageY : ev.touches[0].pageY;
        this.origWidth = this.width;
        this.origHeight = this.height;
    },
    resizeBR(ev) {
        // RIGHT
        const pageX = typeof ev.pageX !== 'undefined' ? ev.pageX : ev.touches[0].pageX;
        const deltaX = pageX - this.resizeStartX;
        if (this.origWidth + deltaX >= this.minWidth) {
            this.width = this.origWidth + deltaX;
        }
        // BOTTOM
        const pageY = typeof ev.pageY !== 'undefined' ? ev.pageY : ev.touches[0].pageY;
        const deltaY = pageY - this.resizeStartY;
        if (this.origHeight + deltaY >= this.minHeight) {
            this.height = this.origHeight + deltaY;
        }
    },
    stopResizeBR() {
        document.documentElement.removeEventListener('mousemove', this.resizeBR);
        document.documentElement.removeEventListener('mouseup', this.stopResizeBR);
    },
  },
  props: [
      'title',
      'x',
      'y',
      'w',
      'h',
      'menus',
      'panelId',
  ],
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