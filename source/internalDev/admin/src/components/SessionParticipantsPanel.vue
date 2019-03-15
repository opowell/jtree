<template>
    <div>
        <action-bar
            :menus='actions'>
        </action-bar>
        <div style='flex: 1 1 auto; align-self: stretch; overflow: auto'>
            <jt-tree ref='participantsTree'
                :nodesProp='participants'
                :f2Func='renameParticipant'
                :dblClickFunc='openParticipant'
                :titleField='"id"'
                :keyField='"id"'
                :allowChildren='false'
                :headers='[
                {
                    label: "id",
                    value: "id",
                },
                {
                    label: "clients",
                    value: "numClients",
                },
                {
                    label: "points",
                    value: "numPoints",
                }]'
                @deleteNode='deleteParticipant'
            />
        </div>
    </div>
</template>
<script>
import ActionBar from '@/components/ActionBar.vue'
import JtTree from '@/components/JtTree.vue'
import sort from 'alphanum-sort'
export default {
      name: 'SessionParticipantsPanel',
        components: {
            'jt-tree': JtTree,
            'action-bar': ActionBar,
        },
    props: [
        'dat',
        'panel',
    ],
    computed: {
        participants() {
            let parts = this.$store.state.session.participants;
            if (parts == null) {
                return null;
            }
            let keys = sort(Object.keys(parts));
            let out = [];
            for (let i=0; i<keys.length; i++) {
                out.push(parts[keys[i]]);
            }
            return out;
        },
            panelTitle() {
                if (this.participants == null) {
                    return 'Participants';
                }
                return 'Participants (' + this.participants.length + ')';
            },
    },
    methods: {
        renameParticipant() {},
        openParticipant() {},
        deleteParticipant(data, ev) {
            if (ev != null) {
                ev.stopPropagation();
                ev.preventDefault();
            }
            let activeNode = this.$refs.participantsTree.activeNode();
            global.jt.socket.emit('deleteParticipant', {
                sId: this.$store.state.session.id,
                pId: activeNode.id,
            });
        },
    },
        watch: {
            participants: function(newVal) {
                this.panel.id = 'Participants (' + newVal.length + ')';
            },
        },
    data() { return {
                actions: [
                {
                    title: 'New',
                    hasParent: false,
                    icon: 'fas fa-plus',
                    action: this.createNewParticipant,
                },
                {
                    title: 'Refresh',
                    hasParent: false,
                    icon: 'fas fa-redo-alt',
                    action: this.fetchData,
                },
                'divider',
                {
                    title: 'Rename',
                    hasParent: false,
                    icon: 'fas fa-font',
                    action: this.renameActiveNode,
                },
                {
                    title: 'Delete',
                    hasParent: false,
                    icon: 'fas fa-trash',
                    action: this.deleteParticipant,
                },
                ],
    }},
    mounted() {
        this.panel.id = this.panelTitle;
    },
  }
</script>