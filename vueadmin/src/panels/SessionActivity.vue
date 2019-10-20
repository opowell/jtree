<template>
    <div style='display: block'>
        <b-button-group class='mb-1 flex-wrap'>
            <b-button variant="outline-secondary" size="sm" onclick='jt.viewAllParticipants()'>
                <font-awesome-icon :icon="['fas', 'eye']"/>&nbsp;&nbsp;Show all
            </b-button>
            <b-button variant="outline-secondary" size="sm" onclick='jt.hideAllParticipants()'>
                <font-awesome-icon :icon="['fas', 'times']"/>&nbsp;&nbsp;Close all
            </b-button>
            <b-button variant="outline-secondary" size="sm" id='startAutoplay' onclick='server.setAutoplayForAll(true);'>
                <span class='px-1' style='border: 1px solid; border-radius: 0.3rem;'>A</span>&nbsp;&nbsp;Start autoplay
            </b-button>
            <b-button variant="outline-secondary" size="sm" id='stopAutoplay' onclick='server.setAutoplayForAll(false);'>
                <span>A</span>&nbsp;&nbsp;Stop autoplay
            </b-button>
            <b-button variant="outline-secondary" size="sm" onclick='jt.showSetAutoplayFreqModal()'>
                <font-awesome-icon :icon="['fas', 'stopwatch']"/>&nbsp;&nbsp;Set autoplay delay...
            </b-button>
            <b-button variant="outline-secondary" size="sm" onclick='jt.setViewSize()'>
                <font-awesome-icon :icon="['fas', 'expand']"/>&nbsp;&nbsp;Set size...
            </b-button>
        </b-button-group>
        <div style='display: flex; flex-wrap: wrap;'>
                <div 
                    class="card panel ui-widget-content participant-view" 
                    v-for='player in openPlayers' 
                    :key='player.id' 
                    :style='participantViewStyle'
                >
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
                    <div class="card-header" :style='headerStyle'>
                        <span>Participant {{player.id}}</span>
                        <button type="button" class="headerBtn close float-right" @click='hideParticipant(player.id)'>
                            <font-awesome-icon title='close' :icon="['fas', 'times']"/>
                        </button>
                        <button type="button" class="headerBtn close float-right"
                        @click='participantOpenInNewTab(player.id)'>
                            <font-awesome-icon title="open in new window" :icon="['fas', 'external-link-alt']"/>
                        </button>
                        <button title="toggle autoplay" :id="player.id + '-autoplay'" type="button" class="headerBtn close float-right">A</button>
                        <button type="button" class="headerBtn close float-right" @click='refreshParticipantView(player.id)'>
                            <font-awesome-icon title="refresh" :icon="['fas', 'redo-alt']"/>
                        </button>
                    </div>
                    <iframe :id="'participant-frame-' + player.id" :src="'http://' + settings.server.ip + ':' + settings.server.port + '/session/' + sessionId + '/' + player.id" class="participant-frame panel-content2"></iframe>
                </div>
        </div>
    </div>
</template>

<script>

export default {
  name: 'ViewSessionActivity',
  props: [
    'dat',
    'panel',
  ],
  data() {
    return {
        session: this.$store.state.session,
        settings: this.$store.state.settings,
    }
  },
  computed: {
      sessionId() {
          return this.session == null ? 'none' : this.session.id;
      },
      openPlayers() {
          return this.$store.state.openPlayers;
      },
      participantViewStyle() {
          return {
              "height": this.$store.state.viewsHeight + 'px',
              "flex": (this.$store.state.stretchViews ? '1' : '0') + ' 0 ' + this.$store.state.viewsWidth + 'px',
          }
      },
      headerStyle() {
          let bg = this.allowAdminClientsToPlay ? '#cfe8cf' : '';
          return {
              'background-color': bg,
          }
      },
        allowAdminClientsToPlay() {
            if (this.session == null) {
                return false;
            }
            return this.session.allowAdminClientsToPlay;
        }
  },
  mounted() {
      this.panel.id = 'Session Activity';
  },
  methods: {
      hideParticipant(id) {
        store.commit('hideParticipant', id);          
      },
      participantOpenInNewTab(id) {
        window.open("http://" + jt.partLink(id));
      },
      refreshParticipantView(id) {
        var panel = $('#participant-frame-' + id)[0];
        // eslint-disable-next-line
        panel.src = panel.src;
      },
		startResizeTL(ev) {
			document.documentElement.addEventListener('mousemove', this.resizeTL);
			document.documentElement.addEventListener('mouseup', this.stopResizeTL);
			jt.coverUpParticipantViews(true);
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
			jt.coverUpParticipantViews(false);
			this.$store.commit('saveWindowInfo', this);
		},

		startResizeT(ev) {
			document.documentElement.addEventListener('mousemove', this.resizeT);
			document.documentElement.addEventListener('mouseup', this.stopResizeT);
			jt.coverUpParticipantViews(true);
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
			jt.coverUpParticipantViews(false);
			this.$store.commit('saveWindowInfo', this);
		},

		startResizeTR(ev) {
			document.documentElement.addEventListener('mousemove', this.resizeTR);
			document.documentElement.addEventListener('mouseup', this.stopResizeTR);
			jt.coverUpParticipantViews(true);
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
			jt.coverUpParticipantViews(false);
		},

		startResizeL(ev) {
			document.documentElement.addEventListener('mousemove', this.resizeL);
			document.documentElement.addEventListener('mouseup', this.stopResizeL);
			jt.coverUpParticipantViews(true);
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
			jt.coverUpParticipantViews(false);
		},

		startResizeR(ev) {
			document.documentElement.addEventListener('mousemove', this.resizeR);
			document.documentElement.addEventListener('mouseup', this.stopResizeR);
			jt.coverUpParticipantViews(true);
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
			// jt.coverUpParticipantViews(false);
		},

		startResizeBL(ev) {
			document.documentElement.addEventListener('mousemove', this.resizeBL);
			document.documentElement.addEventListener('mouseup', this.stopResizeBL);
			jt.coverUpParticipantViews(false);
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
			jt.coverUpParticipantViews(false);
		},

		startResizeB(ev) {
			document.documentElement.addEventListener('mousemove', this.resizeB);
			document.documentElement.addEventListener('mouseup', this.stopResizeB);
			jt.coverUpParticipantViews(true);
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
			jt.coverUpParticipantViews(false);
			this.$store.commit('saveWindowInfo', this);
		},

		startResizeBR(ev) {
			document.documentElement.addEventListener('mousemove', this.resizeBR);
			document.documentElement.addEventListener('mouseup', this.stopResizeBR);
			jt.coverUpParticipantViews(true);
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
			jt.coverUpParticipantViews(false);
		}

  },
}

import jt from '@/webcomps/jtree.js'
import 'jquery'
let $ = window.jQuery
import server from '@/webcomps/msgsToServer.js'
import store from '@/store.js'

jt.viewAllParticipants = function() {
    let openPlayers = window.vue.$store.state.openPlayers;
	openPlayers.splice(0, openPlayers.length);
	window.vue.$nextTick(function() {
		let participants = jt.data.session.proxy.state.participants;
		for (var pId in participants) {
			var participant = participants[pId];
			openPlayers.push(participant);
		}
	});
}

jt.hideAllParticipants = function() {
    store.commit('hideAllParticipants');
}

jt.closeParticipantView = function(pId) {
    for (let i in this.openPlayers) {
        if (this.openPlayers[i].id === pId) {
            this.openPlayers.splice(i, 1);
            return;
        }
    }
}

jt.refreshParticipantView = function(pId) {
    var panel = $('#participant-frame-' + pId)[0];
    // eslint-disable-next-line no-self-assign
    panel.src = panel.src;
}

jt.toggleParticipantAutoplay = function(pId) {
    // const elId = 'panel-session-participant-' + jt.safePId(pId);
    // const el = $('#' + elId);
    const apEl = $('#' + jt.safePId(pId) + '-autoplay');
    jt.setParticipantAutoplay(pId, !apEl.hasClass('headerBtn-on'));
}

jt.setParticipantAutoplay = function(pId, b) {
    // const elId = 'panel-session-participant-' + pId;
    // const el = $('#' + elId);
    const apEl = $('#' + pId + '-autoplay');
    if (b) {
        apEl.addClass('headerBtn-on');
    } else {
        apEl.removeClass('headerBtn-on');
    }
    server.setAutoplay(pId, b);
    // let iframe = el.find('iframe')[0];
    // if (iframe.contentWindow.setAutoplay !== undefined) {
    //     iframe.contentWindow.setAutoplay(b);
    // }
}

</script>

<style scoped>
.handle {
  background-color: transparent;
  border-style: outset;
  border-width: 0px;
  margin: 0px;
  display: flex;
  width: 4px;
  height: 4px;
  border-color: #dae1e7;
  position: absolute;
}

.handle-tl {
  border-top-left-radius: 3px;
  border-top: 1px solid transparent;
  border-left: 1px solid transparent;
    top: -3px;
    left: -3px;
    cursor: nwse-resize;
}

.handle-tc {
  border-top: 1px solid transparent;
    width: calc(100% - 2px);
    left: 1px;
    top: -3px;
    cursor: ns-resize;
}

.handleInside {
    width: 100%;
}

.handleInside-tc {
    border-top: 1px solid transparent;
}

.handleInside-tl {
    border-top: 1px solid transparent;
    border-left: 1px solid transparent;
	border-top-left-radius: 3px;
}

.handleInside-tr {
    border-top: 1px solid transparent;
    border-right: 1px solid transparent;
	border-top-right-radius: 3px;
}

.handleInside-ml {
    border-left: 1px solid transparent;
}

.handleInside-mr {
    border-right: 1px solid transparent;
}

.handleInside-bc {
    border-bottom: 1px solid transparent;
}

.handleInside-bl {
	border-bottom-left-radius: 3px;
    border-bottom: 1px solid transparent;
    border-left: 1px solid transparent;
}

.handleInside-br {
	border-bottom-right-radius: 3px;
    border-bottom: 1px solid transparent;
    border-right: 1px solid transparent;
}

.handle-tr {
  border-top: 1px solid transparent;
  border-right: 1px solid transparent;
  border-top-right-radius: 3px;
    right: -3px;
    top: -3px;
        cursor: nesw-resize;

}

.handle-ml {
    border-left: 1px solid transparent;
    height: calc(100% - 2px);
    top: 1px;
    left: -3px;
    cursor: ew-resize;
}

.handle-mr {
    border-right: 1px solid transparent;
    height: calc(100% - 2px);
    top: 1px;
    right: -3px;
    cursor: ew-resize;
}

.handle-bl {
  border-left: 1px solid transparent;
  border-bottom: 1px solid transparent;
  border-bottom-left-radius: 3px;
  bottom: -3px;
  left: -3px;
  cursor: nesw-resize;
}

.handle-bc {
    width: calc(100% - 2px);
    left: 1px;
  bottom: -3px;
  border-bottom: 1px solid transparent;
    cursor: ns-resize;
}

.handle-br {
  right: -3px;
  bottom: -3px;
  border-right: 1px solid transparent;
  border-bottom: 1px solid transparent;
  border-bottom-right-radius: 3px;
  cursor: nwse-resize;
}
</style>