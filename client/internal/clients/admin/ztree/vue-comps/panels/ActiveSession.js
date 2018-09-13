Vue.component('panel-active-session', {
    props: ['activeSession'],
    template: `
    <v-panel v-if='activeSession' id='panel-active-session' :properties='activeSession' :title="'Active Session: ' + this.activeSession.id">
        <div>Id: {{ activeSession.id }}</div>
    </v-panel>
    <v-panel v-else id='panel-active-session' :properties='activeSession' :title="'Active Session: none'">
    </v-panel>

    `,
    mounted: function() {
        $(this.$el).attr('jt-permanent', 'yes');
    }
})

jt.showActiveSession = function() {
    $('#panel-active-session').show();
    jt.focusPanel($('#panel-active-session'));
}

