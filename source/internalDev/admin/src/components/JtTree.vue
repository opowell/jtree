<template>
    <div style='display: flex; flex: 1 1 auto; flex-direction: column;'>
        <jt-treenode 
            v-for='(baseNode, index) in nodesProp' 
            :key='index'
            :nodeProp='baseNode'
            :parentNode='node'
            :tree='tree'
            :indexOnParent='index'
            :expandedProp='index === 0'
            :f2Func='f2Func'
            :dblClickFunc='dblClickFunc'
        >
        </jt-treenode>
    </div>
</template>

<script>

import JtTreeNode from '@/components/JtTreeNode.vue'

export default {
    name: 'jt-tree',
    components: {
        'jt-treenode': JtTreeNode,
    },
    props: {
        nodesProp: {},
        f2Func: null,
        dblClickFunc: null,
        titleField: {
            type: String,
            default: 'title',
        },
        childrenField: {
            type: String,
            default: 'children',
        },
        allowChildren: {
            type: Boolean,
            default: true,
        },
    },
    data() {
        return {
            nodes: this.nodesProp,
            tree: {
                selection: [],
                activeNode: null,
                component: this,
                titleField: this.titleField,
                childrenField: this.childrenField,
                allowChildren: this.allowChildren,
            },
        }
    },
    computed: {
        node() {
            return {
                children: this.nodesProp,
                isNode: false,
            }
        }
    },
    methods: {
        clearSelection() {
            this.tree.selection.splice(0, this.tree.selection.length);
        },
        setActiveNode(node) {
            this.clearSelection();
            this.tree.selection.push(node);
            if (this.tree.activeNode != null) {
                this.tree.activeNode.component.editing = false;
            }
            this.tree.activeNode = node;
            if (node != null) {
                node.titleEl.focus();
            }
        },
    },
}
</script>

<style>

</style>
