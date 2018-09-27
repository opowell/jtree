Vue.component('panel-apps', {
    props: ['apps'],
    template: `
    <v-panel id='panel-apps' :properties='apps' :title="'Apps (' + this.apps.length + ')'">
        <table>
            <tr v-for='app in apps' :key="app.id">
                <td>App: {{app.id}}</td>
            </tr>    
        </table>
    </v-panel>
    `,
    mounted: function() {
        $(this.$el).attr('jt-permanent', 'yes');
    }
})

jt.showAppsPanel = function() {
    refreshApps();
    $('#panel-apps').show();
    jt.focusPanel($('#panel-apps'));
}

