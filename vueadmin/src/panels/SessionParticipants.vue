<template>
    <div style='padding: 5px; display: block'>
        Field: <input type='text' v-model='field'>
      <table class='table table-hover table-bordered'>
          <thead>
            <tr>
              <th v-for='(header, index) in viewedFields' :key='index' id='session-participants-headers'>
                {{header.label != null ? header.label : header.key}}
              </th>
            </tr>
          </thead>
          <tbody id='participants'>
            <tr v-for='(obj, ind1) in objArray' :key='ind1'>
              <td v-for='(header, ind2) in viewedFields' :key='ind2'>
                  <span v-if='header.key == "link"' v-html="linkCol(obj)"/>
                  <span v-else>
                    {{displayProp(obj, header.key)}}
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

export default {
  name: 'ParticipantsTable',
  data() {
    // let linkType = 'link';
    // if (jt.settings != null && jt.settings.sessionShowFullLinks) {
    //     linkType = 'full link';
    // } 

    let session = this.$store.state.session;
    let participants    = session == null ? [] : session.participants;
    return {
        field: 'partsArray',
      session: session,
      participants: participants,
      fields: [
            // {
            //     key: 'id',
            //     label: 'id',
            //     sortable: true,
            // },
            // {
            //     key: linkType,
            //     label: 'link',
            // },
            // {
            //     key: 'numClients',
            //     label: 'clients',
            // },
            // {
            //     key: 'appIndex',
            //     label: 'app',
            // },
            // {
            //     key: 'periodIndex',
            //     label: 'period',
            // },
            // {
            //     key: 'player.group.id',
            //     label: 'group'
            // },
            // {
            //     key: 'player.stage.id',
            //     label: 'stage'
            // },
            // {
            //     key: 'time',
            // },
            // {
            //     key: 'player.status',
            //     label: 'status'
            // },
        ],
    }
  },
    computed: {
        viewedFields() {
            let out = [];
            let outKeys = [];
            let foundObjs = [];
            for (let i in this.fields) {
                out.push(this.fields[i]);
            }
            for (let p in this.objArray) {
                let childObj = this.objArray[p];
                this.findFields(childObj, '', out, outKeys, foundObjs);
            }
            return out;
        },
        objArray() {
            if (this.session == null) {
                return null;
            }
            let paths = this.field.split('.');
            let out = [this.session];
            for (let i in paths) {
                let nextPath = paths[i];
                let newOut = [];
                for (let j=0; j<out.length; j++) {
                    let curObj = out[j];
                    // If the field is an array, remove the current object and add the children.
                    if (Array.isArray(curObj[nextPath])) {
                        for (let k in curObj[nextPath]) {
                            newOut.push(curObj[nextPath][k]);
                        }
                    } else {
                        newOut.push(curObj[nextPath]);
                    }
                }
                out = newOut;
            }
            // let obj = this.session[this.field];
            // for (let p in obj) {
            //     out.push(obj[p]);
            // }
            return out;
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
        findFields(obj, path, out, outKeys, foundObjs) {
            foundObjs.push(obj);
            for (let i in obj) {
                let childPath = path == '' ? i : path + '.' + i;
                if (!outKeys.includes(childPath)) {
                    if (typeof(obj[i]) == 'object') {
                        // if (Array.isArray(obj[i])) {
                            outKeys.push(i);
                            out.push({
                                label: childPath,
                                key: childPath,
                            });
                        // } else {
                        //     if (!foundObjs.includes(obj[i])) {
                        //         this.findFields(obj[i], childPath, out, outKeys, foundObjs);
                        //     }
                        // }
                    } else {
                        outKeys.push(childPath);
                        out.push({
                            label: childPath,
                            key: childPath,
                        });
                    }
                }
            }
        },
        displayProp(obj, prop) {
            try {
                let x = 'obj.' + prop;
                let value = eval(x);
                if (value === undefined) {
                    return 'undefined';
                }
                if (value === null) {
                    return 'null';
                }
                if (Array.isArray(value)) {
                    let allNonObjs = true;
                    for (let i in value) {
                        if (typeof(value[i]) == 'object') {
                            allNonObjs = false;
                            break;
                        }
                    }
                    if (allNonObjs) {
                        return JSON.stringify(value);
                    } else {
                        return value.length;
                    }
                }
                if (typeof(value) == 'object') {
                    return 'object';
                } else {
                    return JSON.stringify(value);
                }
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