<template>
    <div style='display: flex; flex: 1 1 auto; flex-direction: column;'>
        <jt-treenode 
            v-for='(childNode, index) in nodesProp' 
            :key='childNode[tree.keyField]'
            :nodeProp='childNode'
            :parentNode='node'
            :tree='tree'
            :indexOnParent='index'
            :expandedProp='index === 0'
            :f2Func='f2Func'
            :dblClickFunc='dblClickFunc'
            @deleteNode="deleteNode"
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
        keyField: {
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
                keyField: this.keyField,
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
        deleteNode(ev) {
            this.$emit('deleteNode');
        },
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
        deleteActiveNode() {
            let activeNode = this.tree.activeNode;
            activeNode.parentNode.children.splice(activeNode.indexOnParent, 1);
            let nextNode = null;
            let parentNode = activeNode.parentNode;
            if (parentNode.children.length > 0) {
                let index = activeNode.indexOnParent;
                index = Math.min(index, parentNode.children.length - 1);
                nextNode = parentNode.children[index];
            } else {
                nextNode = parentNode;
            }
            this.setActiveNode(nextNode);
        },
    },
}
</script>

<style>

</style>
