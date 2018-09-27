Vue.component('panel-clients', {
    props: ['clients'],
    template: `
    <v-panel id='panel-clients' :properties='clients' :title="'Clients (' + this.clients.length + ')'">
        <table>
            <tr>
                <th>id</th>
                <th>state</th>
                <th>time</th>
                <th>link</th>
            </tr>
            <tr v-for='client in clients' :key="client.id">
                <td>{{client.pId}}</td>
                <td>-</td>
                <td>mm:ss</td>
                <td><a :href='"http://" + partLink(client)' target='_blank'>{{partLink(client)}}</a></td>
            </tr>    
        </table>
    </v-panel>
    `,
    mounted: function() {
        $(this.$el).attr('jt-permanent', 'yes');
    },
    methods: {
        partLink: function(client) {
            return window.partLink(client.pId);
        }
    }
})

jt.showClientsPanel = function() {
    refreshClients();
    $('#panel-clients').show();
    jt.focusPanel($('#panel-clients'));
}