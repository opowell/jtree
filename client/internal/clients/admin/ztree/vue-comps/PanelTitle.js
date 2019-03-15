Vue.component('v-panel-title', {
    template: `
    <div class='v-panel-title' @dblclick='panelEnlarge'>
        <jt-menu :data='menuData'></jt-menu>
        <div class='v-panel-title-text'><slot></slot></div>
        <div class='v-panel-title-control far fa-window-minimize' @click='minimizePanelEv'></div>
        <div class='v-panel-title-control far fa-window-restore' @click='restorePanelEv'></div>
        <div class='v-panel-title-control far fa-window-maximize' @click='maxPanelEv'></div>
        <div class='v-panel-title-control far fa-window-close' @click='closePanelEv'></div>
    </div>
    `,
    data: function () {
        return {
            menuData: {
                id: "panelTitle",
                icon: "fa",
                children: [
                    {
                        id: "Restore",
                        fn: "jt.restorePanelEv(event);",
                        icon: 'far fa-window-restore'
                    },
                    {
                        id: "Maximize",
                        fn: "jt.maxPanelEv(event);",
                        icon: 'far fa-window-maximize'
                    },
                    {
                        id: "Minimize",
                        fn: "jt.minimizePanelEv(event);",
                        icon: 'far fa-window-minimize'
                    },
                    'divider',
                    {
                        id: 'Close',
                        key: 'Ctrl+L',
                        icon: 'far fa-window-close'
                    },
                    'divider',
                    {
                        id: 'Next',
                        key: 'Ctrl+F6',
                        fn: 'jt.focusNextPanel(event);'
                    }
                ]
            }
        }
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
})
