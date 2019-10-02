<template>
  <div
    class="window"
    @mousedown="click"
    :class='{"focussed": isFocussed, "maxed": isMaximized, "active": isActive}'
    :style="style"
  >
    <div class="body">
      <jt-area 
		:areaProp="area"
		:window="window"
		:indexOnParent=0
		@startmove='startMove'
		:flex="flex"
		:activePanelInd="activePanelInd"
		:rowChildren='rowChildren'
		/>
    </div>
    <span class="handle handle-tl" @mousedown.prevent="startResizeTL">
		<span class='handleInside handleInside-tl'></span>
	</span>
    <span class="handle handle-tc" @mousedown.prevent="startResizeT">
		<span class='handleInside handleInside-tc'></span>
	</span>
    <span class="handle handle-tr" @mousedown.prevent="startResizeTR">
		<span class='handleInside handleInside-tr'></span>
	</span>
    <span class="handle handle-ml" @mousedown.prevent="startResizeL">
		<span class='handleInside handleInside-ml'></span>
	</span>
    <span class="handle handle-mr" @mousedown.prevent="startResizeR">
		<span class='handleInside handleInside-mr'></span>
	</span>
    <span class="handle handle-bl" @mousedown.prevent="startResizeBL">
		<span class='handleInside handleInside-bl'></span>
	</span>
    <span class="handle handle-bc" @mousedown.prevent="startResizeB">
		<span class='handleInside handleInside-bc'></span>
	</span>
    <span class="handle handle-br" @mousedown.prevent="startResizeBR">
		<span class='handleInside handleInside-br'></span>
	</span>
  </div>
</template>
<script>
import JtArea from './JtArea.vue';

export default {
	name: 'JtWindow',
	components: {
		JtArea,
	},
	props: [
		'window',
		'activePanelInd',
		'index',
		'rowChildren',
	],
	data() {
		return {
			area: {
				panels: this.window.panels,
				areas: this.window.areas,
				// activePanelInd: this.activePanelInd,
			},
			menus: [
				{
					text: 'Start',
					hasParent: false
				},
				{
					text: 'New',
					hasParent: false
				}
			],
			panelId: this.window.id,
			dataTitle: this.window.title,
			left: this.window.x,
			top: this.window.y,
			width: this.window.w,
			height: this.window.h,

			minHeight: 100,
			minWidth: 200,
			minTop: 5,
			minLeft: 5,

			resizeStartX: null,
			resizeStartY: null,
			moveStartX: null,
			moveStartY: null,
		};
	},
	computed: {
		parentWidth() {
			return this.$store.state.containerWidth;
		},
		parentHeight() {
			return this.$store.state.containerHeight;
		},
		flex() {
			return this.window.flex;
		},
		isActive() {
			return !this.isMaximized || this === this.$store.state.activeWindow;
		},
		isFocussed() {
			return this === this.$store.state.activeWindow;
		},
		isMaximized() {
			return this.$store.state.windowsMaximized;
		},
		zIndex() {
			const windows = this.$store.state.windows;
			for (var i = 0; i < windows.length; i++) {
				if (windows[i].panelId === this.panelId) {
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
					'border-radius': '0px',
				};
			} else {
				return {
					top: this.top + 'px',
					left: this.left + 'px',
					width: this.width + 'px',
					height: this.height + 'px',
					zIndex: this.zIndex,
					'flex-direction': this.flexDirection,
				};
			}
		}
	},
	methods: {
		closejt() {
			this.$store.commit('removePanel', this);
		},
		focus() {
			this.click();
		},

		click() {
			if (!this.isFocussed) {
				this.$store.commit('setFocussedWindow', this);
			}
		},

		startMove(ev) {
			if (this.isMaximized) {
				return;
			}
			document.documentElement.addEventListener('mousemove', this.move);
			document.documentElement.addEventListener('mouseup', this.stopMove);
			this.moveStartX =
				typeof ev.pageX !== 'undefined' ? ev.pageX : ev.touches[0].pageX;
			this.moveStartY =
				typeof ev.pageY !== 'undefined' ? ev.pageY : ev.touches[0].pageY;
			this.origTop = this.top;
			this.origLeft = this.left;
		},
		move(ev) {
			const pageX =
				typeof ev.pageX !== 'undefined' ? ev.pageX : ev.touches[0].pageX;
			let newLeft = this.origLeft + pageX - this.moveStartX;
			newLeft = Math.max(newLeft, this.minLeft);
			newLeft = Math.min(newLeft, this.parentWidth - this.width);
			this.left = newLeft;

			const pageY =
				typeof ev.pageY !== 'undefined' ? ev.pageY : ev.touches[0].pageY;
			let newTop = this.origTop + pageY - this.moveStartY;
			newTop = Math.max(newTop, this.minTop);
			newTop = Math.min(newTop, this.parentHeight - this.height);
			this.top = newTop;
		},
		stopMove() {
			document.documentElement.removeEventListener('mousemove', this.move);
			document.documentElement.removeEventListener('mouseup', this.stopMove);
			this.$store.commit('saveWindowInfo', this);
		},

		startResizeTL(ev) {
			document.documentElement.addEventListener('mousemove', this.resizeTL);
			document.documentElement.addEventListener('mouseup', this.stopResizeTL);
			this.resizeStartX =
				typeof ev.pageX !== 'undefined' ? ev.pageX : ev.touches[0].pageX;
			this.resizeStartY =
				typeof ev.pageY !== 'undefined' ? ev.pageY : ev.touches[0].pageY;
			this.origTop = this.top;
			this.origLeft = this.left;
			this.origWidth = this.width;
			this.origHeight = this.height;
		},
		resizeTL(ev) {
			const pageX =
				typeof ev.pageX !== 'undefined' ? ev.pageX : ev.touches[0].pageX;
			const deltaX = pageX - this.resizeStartX;
			if (this.origWidth - deltaX >= this.minWidth) {
				this.left = this.origLeft + deltaX;
				this.width = this.origWidth - deltaX;
			}
			const pageY =
				typeof ev.pageY !== 'undefined' ? ev.pageY : ev.touches[0].pageY;
			const deltaY = pageY - this.resizeStartY;
			if (this.origHeight - deltaY >= this.minHeight) {
				this.top = this.origTop + deltaY;
				this.height = this.origHeight - deltaY;
			}
		},
		stopResizeTL() {
			document.documentElement.removeEventListener('mousemove', this.resizeTL);
			document.documentElement.removeEventListener('mouseup',	this.stopResizeTL);
			this.$store.commit('saveWindowInfo', this);
		},

		startResizeT(ev) {
			document.documentElement.addEventListener('mousemove', this.resizeT);
			document.documentElement.addEventListener('mouseup', this.stopResizeT);
			this.resizeStartY =
				typeof ev.pageY !== 'undefined' ? ev.pageY : ev.touches[0].pageY;
			this.origTop = this.top;
			this.origHeight = this.height;
		},
		resizeT(ev) {
			const pageY =
				typeof ev.pageY !== 'undefined' ? ev.pageY : ev.touches[0].pageY;
			const deltaY = pageY - this.resizeStartY;
			if (this.origHeight - deltaY >= this.minHeight) {
				this.top = this.origTop + deltaY;
				this.height = this.origHeight - deltaY;
			}
		},
		stopResizeT() {
			document.documentElement.removeEventListener('mousemove', this.resizeT);
			document.documentElement.removeEventListener('mouseup', this.stopResizeT);
			this.$store.commit('saveWindowInfo', this);
		},

		startResizeTR(ev) {
			document.documentElement.addEventListener('mousemove', this.resizeTR);
			document.documentElement.addEventListener('mouseup', this.stopResizeTR);
			this.resizeStartX =
				typeof ev.pageX !== 'undefined' ? ev.pageX : ev.touches[0].pageX;
			this.resizeStartY =
				typeof ev.pageY !== 'undefined' ? ev.pageY : ev.touches[0].pageY;
			this.origTop = this.top;
			this.origLeft = this.left;
			this.origWidth = this.width;
			this.origHeight = this.height;
		},
		resizeTR(ev) {
			// Resize top
			const pageX =
				typeof ev.pageX !== 'undefined' ? ev.pageX : ev.touches[0].pageX;
			const deltaX = pageX - this.resizeStartX;
			if (this.origWidth + deltaX >= this.minWidth) {
				this.width = this.origWidth + deltaX;
			}
			// Resize RIGHT
			const pageY =
				typeof ev.pageY !== 'undefined' ? ev.pageY : ev.touches[0].pageY;
			const deltaY = pageY - this.resizeStartY;
			if (this.origHeight - deltaY >= this.minHeight) {
				this.top = this.origTop + deltaY;
				this.height = this.origHeight - deltaY;
			}
		},
		stopResizeTR() {
			document.documentElement.removeEventListener('mousemove', this.resizeTR);
			document.documentElement.removeEventListener('mouseup',	this.stopResizeTR);
			this.$store.commit('saveWindowInfo', this);
		},

		startResizeL(ev) {
			document.documentElement.addEventListener('mousemove', this.resizeL);
			document.documentElement.addEventListener('mouseup', this.stopResizeL);
			this.resizeStartX =
				typeof ev.pageX !== 'undefined' ? ev.pageX : ev.touches[0].pageX;
			this.origLeft = this.left;
			this.origWidth = this.width;
		},
		resizeL(ev) {
			const pageX =
				typeof ev.pageX !== 'undefined' ? ev.pageX : ev.touches[0].pageX;
			const deltaX = pageX - this.resizeStartX;
			if (this.origWidth - deltaX >= this.minWidth) {
				this.left = this.origLeft + deltaX;
				this.width = this.origWidth - deltaX;
			}
		},
		stopResizeL() {
			document.documentElement.removeEventListener('mousemove', this.resizeL);
			document.documentElement.removeEventListener('mouseup', this.stopResizeL);
			this.$store.commit('saveWindowInfo', this);
		},

		startResizeR(ev) {
			document.documentElement.addEventListener('mousemove', this.resizeR);
			document.documentElement.addEventListener('mouseup', this.stopResizeR);
			this.resizeStartX =
				typeof ev.pageX !== 'undefined' ? ev.pageX : ev.touches[0].pageX;
			this.origLeft = this.left;
			this.origWidth = this.width;
		},
		resizeR(ev) {
			const pageX =
				typeof ev.pageX !== 'undefined' ? ev.pageX : ev.touches[0].pageX;
			const deltaX = pageX - this.resizeStartX;
			if (this.origWidth + deltaX >= this.minWidth) {
				this.width = this.origWidth + deltaX;
			}
		},
		stopResizeR() {
			document.documentElement.removeEventListener('mousemove', this.resizeR);
			document.documentElement.removeEventListener('mouseup', this.stopResizeR);
			this.$store.commit('saveWindowInfo', this);
		},

		startResizeBL(ev) {
			document.documentElement.addEventListener('mousemove', this.resizeBL);
			document.documentElement.addEventListener('mouseup', this.stopResizeBL);
			this.resizeStartX =
				typeof ev.pageX !== 'undefined' ? ev.pageX : ev.touches[0].pageX;
			this.resizeStartY =
				typeof ev.pageY !== 'undefined' ? ev.pageY : ev.touches[0].pageY;
			this.origLeft = this.left;
			this.origWidth = this.width;
			this.origHeight = this.height;
		},
		resizeBL(ev) {
			// LEFT
			const pageX =
				typeof ev.pageX !== 'undefined' ? ev.pageX : ev.touches[0].pageX;
			const deltaX = pageX - this.resizeStartX;
			if (this.origWidth - deltaX >= this.minWidth) {
				this.left = this.origLeft + deltaX;
				this.width = this.origWidth - deltaX;
			}
			// BOTTOM
			const pageY =
				typeof ev.pageY !== 'undefined' ? ev.pageY : ev.touches[0].pageY;
			const deltaY = pageY - this.resizeStartY;
			if (this.origHeight + deltaY >= this.minHeight) {
				this.height = this.origHeight + deltaY;
			}
		},
		stopResizeBL() {
			document.documentElement.removeEventListener('mousemove', this.resizeBL);
			document.documentElement.removeEventListener('mouseup', this.stopResizeBL);
			this.$store.commit('saveWindowInfo', this);
		},

		startResizeB(ev) {
			document.documentElement.addEventListener('mousemove', this.resizeB);
			document.documentElement.addEventListener('mouseup', this.stopResizeB);
			this.resizeStartY =
				typeof ev.pageY !== 'undefined' ? ev.pageY : ev.touches[0].pageY;
			this.origHeight = this.height;
		},
		resizeB(ev) {
			// BOTTOM
			const pageY =
				typeof ev.pageY !== 'undefined' ? ev.pageY : ev.touches[0].pageY;
			const deltaY = pageY - this.resizeStartY;
			if (this.origHeight + deltaY >= this.minHeight) {
				this.height = this.origHeight + deltaY;
			}
		},
		stopResizeB() {
			document.documentElement.removeEventListener('mousemove', this.resizeB);
			document.documentElement.removeEventListener('mouseup', this.stopResizeB);
			this.$store.commit('saveWindowInfo', this);
		},

		startResizeBR(ev) {
			document.documentElement.addEventListener('mousemove', this.resizeBR);
			document.documentElement.addEventListener('mouseup', this.stopResizeBR);
			this.resizeStartX =
				typeof ev.pageX !== 'undefined' ? ev.pageX : ev.touches[0].pageX;
			this.resizeStartY =
				typeof ev.pageY !== 'undefined' ? ev.pageY : ev.touches[0].pageY;
			this.origWidth = this.width;
			this.origHeight = this.height;
		},
		resizeBR(ev) {
			// RIGHT
			const pageX =
				typeof ev.pageX !== 'undefined' ? ev.pageX : ev.touches[0].pageX;
			const deltaX = pageX - this.resizeStartX;
			if (this.origWidth + deltaX >= this.minWidth) {
				this.width = this.origWidth + deltaX;
			}
			// BOTTOM
			const pageY =
				typeof ev.pageY !== 'undefined' ? ev.pageY : ev.touches[0].pageY;
			const deltaY = pageY - this.resizeStartY;
			if (this.origHeight + deltaY >= this.minHeight) {
				this.height = this.origHeight + deltaY;
			}
		},
		stopResizeBR() {
			document.documentElement.removeEventListener('mousemove', this.resizeBR);
			document.documentElement.removeEventListener('mouseup', this.stopResizeBR);
			this.$store.commit('saveWindowInfo', this);
		}
	},
  mounted() {
		this.$store.commit('addWindow', this);
	},

};
</script>

<style>
.window.focussed .closeIcon {
	background-color: var(--panelCloseButtonBGColor);
	border-color: rgba(0,0,0,0.6);
}
.closeIcon:hover {
	background-color: var(--panelCloseButtonHoverBGColor);
}
.window.focussed .closeIcon:hover {
	background-color: var(--panelCloseButtonHoverBGColor);
}

.window.window.focussed .node-title.selected {
	background-color: var(--nodeSelectedFocussedBGColor);
}

</style>

<style scoped>
.window {
    background-color: var(--windowBGColor);
    display: none;
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
    color: var(--windowFontColor);
}

.window.focussed {
    background-color: var(--windowFocussedBGColor);
    color: var(--windowFocussedFontColor);
}

.handle {
  background-color: inherit;
  border-style: outset;
  border-width: 0px;
  margin: 0px;
  display: flex;
  width: 7px;
  height: 7px;
  border-color: #dae1e7;
  position: absolute;
}

.handle-tl {
  border-top-left-radius: 5px;
  border-top: 1px solid #000;
  border-left: 1px solid #000;
    top: -5px;
    left: -5px;
    cursor: nwse-resize;
}

.handle-tc {
  border-top: 1px solid #000;
    width: calc(100% - 4px);
    left: 2px;
    top: -5px;
    cursor: ns-resize;
}

.handleInside {
    width: 100%;
}

.handleInside-tc {
    border-top: 1px solid #fff;
}

.handleInside-tl {
    border-top: 1px solid #fff;
    border-left: 1px solid #fff;
	border-top-left-radius: 5px;
}

.handleInside-tr {
    border-top: 1px solid #fff;
    border-right: 1px solid rgb(63, 206, 242);
	border-top-right-radius: 5px;
}

.handleInside-ml {
    border-left: 1px solid #fff;
}

.handleInside-mr {
    border-right: 1px solid rgb(63, 206, 242);
}

.handleInside-bc {
    border-bottom: 1px solid rgb(63, 206, 242);
}

.handleInside-bl {
	border-bottom-left-radius: 5px;
    border-bottom: 1px solid rgb(63, 206, 242);
    border-left: 1px solid #fff;
}

.handleInside-br {
	border-bottom-right-radius: 5px;
    border-bottom: 1px solid rgb(63, 206, 242);
    border-right: 1px solid rgb(63, 206, 242);
}

.handle-tr {
  border-top: 1px solid #000;
  border-right: 1px solid #000;
  border-top-right-radius: 5px;
    right: -5px;
    top: -5px;
        cursor: nesw-resize;

}

.handle-ml {
    border-left: 1px solid #000;
    height: calc(100% - 4px);
    top: 2px;
    left: -5px;
    cursor: ew-resize;
}

.handle-mr {
    border-right: 1px solid #000;
    height: calc(100% - 4px);
    top: 2px;
    right: -5px;
    cursor: ew-resize;
}

.handle-bl {
  border-left: 1px solid #000;
  border-bottom: 1px solid #000;
  border-bottom-left-radius: 5px;
  bottom: -5px;
  left: -5px;
  cursor: nesw-resize;
}

.handle-bc {
    width: calc(100% - 4px);
    left: 2px;
  bottom: -5px;
  border-bottom: 1px solid #000;
    cursor: ns-resize;
}

.handle-br {
  right: -5px;
  bottom: -5px;
  border-right: 1px solid #000;
  border-bottom: 1px solid #000;
  border-bottom-right-radius: 5px;
  cursor: nwse-resize;
}

.maxed > .handle {
    display: none;
}

.active {
    display: flex;
}

.body {
	flex: 1 1 auto;
	border: 1px inset rgba(0, 0, 0, 0.3);
	overflow: auto;
	display: flex;
    padding: 10px;
	max-width: 100vw;
}

</style>