<template>
    <div style='display: block'>
        <div class='mb-1 btn-group flex-wrap'>
            <span class="btn btn-outline-secondary btn-sm" onclick='jt.viewAllParticipants()'>
                <i class="fa fa-eye"></i>&nbsp;&nbsp;show all
            </span>
            <span class="btn btn-outline-secondary btn-sm" onclick='jt.hideAllParticipants()'>
                <i class="fa fa-times"></i>&nbsp;&nbsp;close all
            </span>
            <span class='btn btn-outline-secondary btn-sm' id='startAutoplay' onclick='server.setAutoplayForAll(true);'>
                <span class='px-1' style='border: 1px solid; border-radius: 0.3rem;'>A</span>&nbsp;&nbsp;start autoplay
            </span>
            <span class='btn btn-outline-secondary btn-sm' id='stopAutoplay' onclick='server.setAutoplayForAll(false);'>
                <span>A</span>&nbsp;&nbsp;stop autoplay
            </span>
            <span class="btn btn-outline-secondary btn-sm" onclick='jt.showSetAutoplayFreqModal()'>
                <i class="fa fa-stopwatch"></i>&nbsp;&nbsp;set autoplay delay...
            </span>
            <span class="btn btn-outline-secondary btn-sm" onclick='jt.setViewSize()'>
                <i class="fa fa-expand"></i>&nbsp;&nbsp;set size...
            </span>
        </div>
        <div id='views'>
                <div 
                    class="card panel ui-widget-content participant-view" 
                    v-for='player in openPlayers' 
                    :key='player.id' 
                    :style='participantViewStyle'
                >
                    <div class="card-header" style="background-color: rgb(207, 232, 207);">
                        <span>Participant {{player.id}}</span>
                        <button type="button" class="headerBtn close float-right">
                            <i title="close" class="fa fa-times"/>
                        </button>
                        <button type="button" class="headerBtn close float-right">
                            <i title="open in new window" class="fa fa-external-link-alt"/>
                        </button>
                        <button title="toggle autoplay" :id="player.id + '-autoplay'" type="button" class="headerBtn close float-right">A</button>
                        <button type="button" class="headerBtn close float-right">
                            <i title="refresh" class="fa fa-redo-alt"/>
                        </button>
                    </div>
                    <iframe :id="'participant-frame-' + player.id" :src="'http://' + settings.server.ip + ':' + settings.server.port + '/session/' + session.id + '/' + player.id" class="participant-frame panel-content2"></iframe>
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
      openPlayers() {
          return this.$store.state.openPlayers;
      },
      participantViewStyle() {
          return {
              "height": this.$store.state.viewsHeight + 'px',
              "flex": (this.$store.state.stretchViews ? '1' : '0') + ' 0 ' + this.$store.state.viewsWidth + 'px',
          }
      }
  },
  mounted() {
      this.panel.id = 'Session Activity';
  },
}

import jt from '@/webcomps/jtree.js'
import 'jquery'
let $ = window.jQuery
import server from '@/webcomps/msgsToServer.js'
// import Vue from 'vue'

jt.viewAllParticipants = function() {
    let openPlayers = window.vue.$store.state.openPlayers;
    openPlayers.splice(0, openPlayers.length);
    for (var pId in jt.data.session.participants) {
        var participant = jt.data.session.participants[pId];
        openPlayers.push(participant);
    }
}

jt.hideAllParticipants = function() {
    this.openPlayers.splice(0, this.openPlayers.length);
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