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
                <span class='px-1' style='border: 1px solid; border-radius: 0.3rem;'>A</span>&nbsp;&nbsp;start autoplay
            </b-button>
            <b-button variant="outline-secondary" size="sm" id='stopAutoplay' onclick='server.setAutoplayForAll(false);'>
                <span>A</span>&nbsp;&nbsp;stop autoplay
            </b-button>
            <b-button variant="outline-secondary" size="sm" onclick='jt.showSetAutoplayFreqModal()'>
                <font-awesome-icon :icon="['fas', 'stopwatch']"/>&nbsp;&nbsp;Set autoplay delay...
            </b-button>
            <b-button variant="outline-secondary" size="sm" onclick='jt.setViewSize()'>
                <font-awesome-icon :icon="['fas', 'expand']"/>&nbsp;&nbsp;Set size...
            </b-button>
        </b-button-group>
        <div id='views'>
                <div 
                    class="card panel ui-widget-content participant-view" 
                    v-for='player in openPlayers' 
                    :key='player.id' 
                    :style='participantViewStyle'
                >
                    <div class="card-header" style="background-color: rgb(207, 232, 207);">
                        <span>Participant {{player.id}}</span>
                        <button type="button" class="headerBtn close float-right" @click='hideParticipant(player.id)'>
                            <font-awesome-icon title='close' :icon="['fas', 'times']"/>
                        </button>
                        <button type="button" class="headerBtn close float-right">
                            <font-awesome-icon title="open in new window" :icon="['fas', 'external-link-alt']"/>
                        </button>
                        <button title="toggle autoplay" :id="player.id + '-autoplay'" type="button" class="headerBtn close float-right">A</button>
                        <button type="button" class="headerBtn close float-right">
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
  },
  mounted() {
      this.panel.id = 'Session Activity';
  },
  methods: {
      hideParticipant(id) {
        store.commit('hideParticipant', id);          
      },

  },
}

import jt from '@/webcomps/jtree.js'
import 'jquery'
let $ = window.jQuery
import server from '@/webcomps/msgsToServer.js'
// import Vue from 'vue'
import store from '@/store.js'

jt.viewAllParticipants = function() {
    let openPlayers = window.vue.$store.state.openPlayers;
    openPlayers.splice(0, openPlayers.length);
    for (var pId in jt.data.session.participants) {
        var participant = jt.data.session.participants[pId];
        openPlayers.push(participant);
    }
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