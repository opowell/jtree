
<template>
<!-- For some reason, needs to be its own component for click + dblclick to work. -->
    <span
        class='tab spacer'
        @dblclick='restore'
        @dragenter="dragEnterTab(null, $event)"
        @dragleave="dragLeaveTab"
        @drop='dropOnTab(numPanels, $event)'
        @dragover='dragOver'
    >
        <slot></slot>
    </span>
</template>

<script>
export default {
    name: 'JtSpacer',
    props: [
        'window',
        'area',
    ],
    computed: {
        areaPath() {
                let areaPath = [];
                let curArea = this.area;
                while (curArea.parent != null) {
                    areaPath.unshift(curArea.indexOnParent);
                    curArea = curArea.parent;
                }
            return areaPath;
        },
        numPanels() {
            return this.area.panels.length;
        }
    },
    methods: {
        restore() {
            this.$store.commit('toggleWindowsMaximized');
        },
        dropOnTab(index, ev) {
            ev.preventDefault();
            ev.stopPropagation();
            ev.target.classList.remove('highlight');
            let targetData = {
                windowId: this.window.id,
                areaPath: this.areaPath,
                index,
            };
            let same = this.samePanel(this.$store.state.dragData, targetData);
            if (same === false && this.$store.state.dragData != null) {
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
            let out = false;
            try {
                out = (panel1Data.windowId === panel2Data.windowId &&
                    panel1Data.areaPath === panel2Data.areaPath && 
                    panel1Data.index === panel2Data.index);
            } 
            // eslint-disable-next-line
            catch (err) {

            }
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
    },
}
</script>

<style scoped>
.spacer {
    flex: 1 1 auto;
}
</style>
