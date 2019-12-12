class ViewSessionParticipants extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
        <!-- SESSION - LINKS -->
        <div id='view-session-participants' class='session-tab hidden'>
            <table class='table table-hover table-bordered'>
                <thead>
                    <tr id='session-participants-headers'></tr>
                </thead>
                <tbody id='participants'>
                </tbody>
            </table>
            <div id='participants-table'>
            </div>
        </div>
    `;
    }
}

{/* 
<b-table
    :items="partsArray"
    :fields='allFields'
>
    <span slot='link' slot-scope='data' v-html='linkCol(data.item)'></span>
    <span slot='group' slot-scope='data' v-html='groupCol(data.item)'></span>
</b-table>
*/}

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
    'full link'
];

function setPlayerTimeLeft(participant, tl) {
    $('#timeleft-' + safePId(participant.id)).text(tl);
}

function showPlayerCurPeriod(participant, p) {
    $('#period-' + safePId(participant.id)).text(p);
}

function safePId(pId) {
  return pId.replace(/\./g, '\\.');
}

function setParticipantPlayer(pId, player, pDiv) {
try {
  var sPId = safePId(pId);

    // Get the set of current headers
    var headers = $('#session-participants-headers > th');
    var headersText = [];

    // For each of the current headers, try to add a value for the player.
    for (var j=0; j<headers.length; j++) {
        var field = headers[j].innerHTML;
        if (!playerFieldsToSkip.includes(field)) {
            var foundEl = pDiv.find('.player-' + sPId + '-' + field).length > 0;
            var value = '';
            if (player !== null) {
                if (player[field] !== undefined) {
                    value = player[field];
                }
            } else {
                foundEl = false;
            }
            if (!foundEl) {
                pDiv.append($('<td class="player-' + pId + '-' + field +'">'));
            }
            headersText.push(field);
            pDiv.find('.player-' + sPId + '-' + field).text(roundValue(value, 2));
        }
    }

    // For each value in the player object,
    for (var i in player) {
        if (!playerFieldsToSkip.includes(i)) {
            if (!headersText.includes(i)) {
                addParticipantPlayerHeader(i);
                headersText.push(i);
            }
            pDiv.find('.player-' + sPId + '-' + i).text(roundValue(player[i], 2));
        }
    }
    if (player !== null) {
        $('.participant-' + sPId + '-status').text(player.status);
        if (player.status === 'active') {
            pDiv.addClass('player-active');
        } else {
            pDiv.removeClass('player-active');
        }
        var gId = groupId(player.groupId);
        if (player.group !== undefined) {
            gId = player.group.id;
        }
        msgs.playerSetStageIndex({participantId: player.id, stageIndex: player.stageIndex});
        msgs.participantSetGroupId({participantId: player.id, groupId: gId});
        clearInterval(participantTimers[pId]);
        if (player.stageTimerDuration === undefined) {
            var div = $('.participant-' + sPId + '-timeleft');
            div.find('.minutes').text('');
            div.find('.seconds').text('');
        } else {
            if (player.stageTimerRunning) {
                var tl = player.stageTimerTimeLeft;
                var st = player.stageTimerStart;
                player.endTime = new Date(st).getTime() + tl;
                var now = Date.now();
                player.timeLeft = player.endTime - now;
                player.stageTimer = setInterval(function() {
                    var now = Date.now();
                    player.timeLeft = player.endTime - now;
                    if (player.timeLeft <= 0) {
                        clearTimeout(player.stageTimer);
                    }
                    var div = $('.participant-' + sPId + '-timeleft');
                    var minutes = div.find('.minutes');
                    var seconds = div.find('.seconds');
                    jt.displayTimeLeft(minutes, seconds, player.timeLeft);
                }, jt.data.CLOCK_FREQUENCY);
                participantTimers[pId] = player.stageTimer;
            } else {
                player.timeLeft = player.stageTimerTimeLeft;
            }
            var div = $('.participant-' + sPId + '-timeleft');
            var minutes = div.find('.minutes');
            var seconds = div.find('.seconds');
            jt.displayTimeLeft(minutes, seconds, player.timeLeft);
        }
    }

    let participant = player.participant;
    showPlayerCurApp(participant);
    $('.participant-' + safePId(participant.id) + '-periodIndex').text(participant.periodIndex+1);
} catch (err) {
    
}

}

closeViews = function() {
    var views = $('.participant-view');
    views.each(function() {
        this.remove();
    });
}

function showParticipants(participants) {

        new Vue({
            el: '#participants-table',
            data: {
                data: jt.data,
                fields: [
                    {
                        key: 'id',
                        label: 'id',
                        sortable: true,
                    },
                    {
                        key: 'link',
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
                        key: 'group',
                    },
                    {
                        key: 'stage',
                    },
                    {
                        key: 'time',
                    },
                    {
                        key: 'status',
                    },
                ],
            },
            computed: {
                allFields() {
                    let out = [];
                    let outKeys = [];
                    for (let f in this.fields) {
                        out.push(this.fields[f]);
                        outKeys.push(this.fields[f].key);
                    }
                    for (let p in this.partsArray) {
                        let player = this.partsArray[p];
                        for (var i in player) {
                            if (!playerFieldsToSkip.includes(i)) {
                                if (!outKeys.includes(i)) {
                                    outKeys.push(i);
                                    out.push({
                                        key: i,
                                        formatter: (value) => { return roundValue(value, 2); }
                                    });
                                }
                            }
                        }
                    }
                    return out;
                },
                partsArray() {
                    let parts = [];
                    let ids = Object.keys(this.data.session.participants);
                    alphanumSort(ids);
                    for (let p in ids) {
                        parts.push(this.data.session.participants[ids[p]]);
                    }
                    return parts;
                },
            },
            methods: {
                linkCol(item) {
                    return '<a href="http://' + partLink(item.id) + '" target="_blank">' + partLink(item.id) + '</a></td>';
                },
                groupCol(item) {
                    if (item.player == null) {
                        return '-';
                    }
                    return item.player.group.id;
                },
            },
          });
    

    resetParticipantsTable();
    sessionSetAutoplay(false);
    if (participants !== undefined) {
        for (var pId in participants) {
            var participant = participants[pId];
            showParticipant(participant);
        }
    }
}

function ParticipantRow(participant) {
    var div = $('<tr class="participant-' + participant.id +'">');
    div.append($('<td>').text(participant.id));
    if (jt.settings.sessionShowFullLinks) {
        div.append($('<td><a href="http://' + fullPartLink(participant.id) + '" target="_blank">' + fullPartLink(participant.id) + '</a></td>'));
    } else {
        div.append($('<td><a href="http://' + partLink(participant.id) + '" target="_blank">' + partLink(participant.id) + '</a></td>'));
    }
    div.append($('<td class="participant-' + participant.id + '-numClients">').text(participant.numClients));
    //    div.append($('<td class="participant-' + participant.id + '-numPoints">').text(round(participant.numPoints, 2)));
    div.append($('<td id="app-' + participant.id + '">').text('-'));
    //    div.append($('<td class="participant-' + participant.id + '-appIndex">').text('-'));
    var periodDiv = $('<td>');
    periodDiv.append($('<span class="participant-' + participant.id + '-periodIndex">').text('-'));
    div.append(periodDiv);
    div.append($('<td class="participant-' + participant.id + '-groupId">').text('-'));
    div.append($('<td class="participant-' + participant.id + '-stageId">').text('-'));
    div.append($('<td class="participant-' + participant.id + '-timeleft"><span class="minutes"></span>:<span class="seconds"></span></td>'));
    div.append($('<td class="participant-' + participant.id + '-status">').text('-'));
    return div;
}

function addParticipantPlayerHeader(name) {
    var headers = $('#session-participants-headers');
    headers.append($('<th>').text(name));
    var trows = $('#participants > tr');
    for (var i=0; i<trows.length; i++) {
        var tr = trows[i];
        var id = tr.children[0].innerHTML;
        var td = $('<td class="player-' + id + '-' + name +'">');
        $(tr).append(td);
    }
}

function resetParticipantsTable() {
    $('#participants').empty();
    $('#session-participants-headers').empty();
    const headers = ['id', 'link', 'clients', 'app', 'period', 'group', 'stage', 'time', 'status'];
    if (jt.settings.sessionShowFullLinks) {
        headers[1] = 'full link';
    } 
    for (let i=0; i<headers.length; i++) {
        $('#session-participants-headers').append($('<th>').text(headers[i]));
    }
}

function showParticipant(participant) {
    var participantRow = new ParticipantRow(participant);
    $('#participants').append(participantRow);
    if (participant.player !== null) {
        var playerRow = jt.PlayerRow(participant.player);
        $('#session-data').append(playerRow);
        participant.player.participant = participant;
        setParticipantPlayer(participant.id, participant.player, participantRow);
    }

    $('#deleteParticipantSelect').prepend($('<option>', {
        value: participant.id,
        text: participant.id
    }));

    $('#deleteParticipantSelect').val(participant.id);
}

window.customElements.define('view-session-participants', ViewSessionParticipants);
