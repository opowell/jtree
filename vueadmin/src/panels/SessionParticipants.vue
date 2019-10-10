<template>
    <div style='padding: 5px; display: block'>
      <table class='table table-hover table-bordered'>
          <thead>
            <tr>
              <th v-for='(header, index) in viewedFields' :key='index' id='session-participants-headers'>
                {{header.label != null ? header.label : header.key}}
              </th>
            </tr>
          </thead>
          <tbody id='participants'>
            <tr v-for='part in partsArray' :key='part.id'>
              <td v-for='(header, index) in viewedFields' :key='index'>
                  <span v-if='header.key == "link"' v-html="linkCol(part)"/>
                  <span v-else>
                    {{displayProp(part, header.key)}}
                  </span>
              </td>
            </tr>
          </tbody>
      </table>
  </div>
</template>

<script>
import 'jquery'
let $ = window.jQuery
import jt from '@/webcomps/jtree.js'

var playerFieldsToSkip = [
    'app',
    'appIndex',
    'clients',
    'group',
    'groupId',
    'id',
    'link',
    'numPoints',
    'participantId',
    'period',
    'roomId',
    'sessionId',
    'session',
    'stageId',
    'stage',
    'stageIndex',
    'stageTimerStart',
    'stageTimerDuration',
    'stageTimerTimeLeft',
    'stageTimerRunning',
    'status',
    'time',
    'participant',
    'full link',
    'playerIds',
    'players',
    'player.id',
    'player.stageIndex',
    'player.group',
    'player.stage',
    'player.participantId',
    'player.sessionId',
    'numClients',
];

export default {
  name: 'ParticipantsTable',
  data() {
    let linkType = 'link';
    if (jt.settings != null && jt.settings.sessionShowFullLinks) {
        linkType = 'full link';
    } 

    let session = this.$store.state.session;
    let participants = session != null ? session.participants : [];
    return {
      session: session,
      participants: participants,
      storeFields: this.$store.state.allFields,
      fieldsToSkip: playerFieldsToSkip,
      fields: [
            {
                key: 'id',
                label: 'id',
                sortable: true,
            },
            {
                key: linkType,
                label: 'link',
            },
            {
                key: 'numClients',
                label: 'clients',
            },
            {
                key: 'appIndex',
                label: 'app',
            },
            {
                key: 'periodIndex',
                label: 'period',
            },
            {
                key: 'player.group.id',
                label: 'group'
            },
            {
                key: 'player.stage.id',
                label: 'stage'
            },
            {
                key: 'time',
            },
            {
                key: 'player.status',
                label: 'status'
            },
        ],
    }
  },
    computed: {
        viewedFields() {
            // console.log('recalculating viewed fields');
            let out = [];
            for (let i in this.fields) {
                out.push(this.fields[i]);
            }
            for (let i in this.storeFields) {
                checkStoreField: {
                    let storeField = this.storeFields[i];
                    let key = storeField.key;
                    for (let j in this.fieldsToSkip) {
                        if (key.startsWith(this.fieldsToSkip[j])) {
                            break checkStoreField;
                        }
                    }
                    out.push(storeField);
                }
            }
            return out;
        },
        partsArray() {
            let parts = [];
            for (let p in this.participants) {
                parts.push(this.participants[p]);
            }
            return parts;
        },
    },
  props: [
    'dat',
    'panel',
  ],
  mounted() {
      this.panel.id = 'Session Participants';
  },
    methods: {
        displayProp(participant, prop) {
            try {
                let x = 'participant.' + prop;
                return eval(x);
            } catch (err) {
                return '-';
            }
        },
        linkCol(item) {
            return '<a href="http://' + jt.partLink(item.id) + '" target="_blank">' + jt.partLink(item.id) + '</a></td>';
        },
        groupCol(item) {
            if (item.player == null) {
                return '-';
            }
            return item.player.group.id;
        },
    },
  }

jt.setPlayerTimeLeft = function(participant, tl) {
    $('#timeleft-' + jt.safePId(participant.id)).text(tl);
}

jt.showPlayerCurPeriod = function(participant, p) {
    $('#period-' + jt.safePId(participant.id)).text(p);
}

jt.safePId = function(pId) {
  return pId.replace(/\./g, '\\.');
}

jt.setParticipantPlayer = function(pId, player) {
try {
    let participant = player.participant;
    jt.showPlayerCurApp(participant);
// eslint-disable-next-line no-empty
} catch (err) {}

}

jt.closeViews = function() {
    var views = $('.participant-view');
    views.each(function() {
        this.remove();
    });
}

</script>