Vue.component('panel-sessions', {
    props: ['sessions'],
    template: `
    <v-panel id='panel-sessions' :properties='sessions' :title="'Sessions (' + this.sessions.length + ')'">
        <table>
            <tr v-for='session in sessions' :key="session.id">
                <td>Session: {{session.id}}</td>
            </tr>
        </table>
    </v-panel>
    `,
    mounted: function() {
        $(this.$el).attr('jt-permanent', 'yes');
    }
})

jt.showSessionsPanel = function() {
    refreshSessions();
    $('#panel-sessions').show();
    jt.focusPanel($('#panel-sessions'));
}

