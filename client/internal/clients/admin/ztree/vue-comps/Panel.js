jt.panelCount = 1;

Vue.component('v-panel', {
    props: [
        'properties',
        'title'
    ],
    template: `
    <div class='jt-panel' @mousedown='focus'>
        <v-panel-title>{{ title }}</v-panel-title>
        <div class='v-panel-content'>
            <slot></slot>
        </div>
    </div>
    `,
    data: function() {
        return {
            sessions: this.properties
        }
    },
    mounted: function() {
        let panel = $(this.$el);
        panel.resizable({
            handles: "all"
        });
        panel.draggable({
            containment : "#content-window",
            handle: ".v-panel-title"
        });
        panel.hide();
    },
    methods: {
        focus: function(event) {
            window.jt.focusPanelEv(event);
        },
        panelEnlarge: function(event) {
            window.jt.panelEnlarge(event);      
        },
        minimizePanelEv: function(event) {
            window.jt.minimizePanelEv(event);
        },
        restorePanelEv: function(event) {
            window.jt.restorePanelEv(event);      
        },
        maxPanelEv: function(event) {
            window.jt.maxPanelEv(event);
        },
        closePanelEv: function(event) {
            window.jt.closePanelEv(event);
        }
    },


  });