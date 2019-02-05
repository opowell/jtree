<template>
    <div :style='mainStyle'>
        <table>
            <tr>
                <th v-for='header in headers' :key='header'>
                    {{header}}
                </th>
            </tr>
            <jt-treenode 
                v-for='(childNode, index) in nodesProp' 
                :key='childNode[tree.keyField]'
                :nodeProp='childNode'
                :parentNode='node'
                :tree='tree'
                :nodePath='[index]'
                :indexOnParent='index'
                :expandedProp='index === 0'
                :f2Func='f2Func'
                :dblClickFunc='dblClickFunc'
                @deleteNode="deleteNode"
            >
                <template v-slot:title='{ nodeProp, tree }'>
                    <slot name='title' :nodeProp='nodeProp' :tree='tree'>
                        {{ nodeProp[tree.titleField]}}
                    </slot>
                </template>
                <!-- <template v-for='header in headers' v-slot:[header]='{ nodeProp, tree }'>
                    <slot :name='header' :nodeProp='nodeProp' :tree='tree'>
                        {{ nodeProp[tree.titleField]}}
                    </slot>
                </template> -->
            </jt-treenode>
        </table>
    </div>
</template>

<script>

import JtTreeNode from '@/components/JtTreeNode.vue'

export default {
    mounted() {
        console.log('mounted tree: ' + JSON.stringify(this.$slots));
    },
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
        headers: {},
    },
    data() {
        return {
            nodes: this.nodesProp,
            tree: {
                selection: [],
                // activeNode: null,
                component: this,
                titleField: this.titleField,
                keyField: this.keyField,
                childrenField: this.childrenField,
                allowChildren: this.allowChildren,
                activeNodePath: null,
            },
        }
    },
    computed: {
        mainStyle() {
            // if (this.headers != null) {
            //     return {
            //         display: 'grid',
            //         flex: '1 1 auto',
            //         'grid-template-columns': 'repeat(' + this.headers.length + ', auto)',
            //     }
            // } else {
                return {
                    display: 'flex',
                    flex: '1 1 auto',
                    'flex-direction': 'column',
                }
            // }
        },
        node() {
            return {
                children: this.nodesProp,
                isNode: false,
            }
        },
    },
    methods: {
        nodeTitle(node) {
            return node[this.tree.titleField];
        },

        activeNode() {
            if (this.tree.activeNodePath == null || this.tree.activeNodePath.length < 1) {
                return null;
            }
            let nodePath = this.tree.activeNodePath;
            let node = this.nodesProp[nodePath[0]];
            for (let i=1; i<this.tree.activeNodePath.length; i++) {
                node = node[this.tree.childrenField][nodePath[i]];
            }
            return node;
        },
        getParentPath(node) {
            let out = [];
            let parentNode = node.parentNode;
            while (parentNode.isNode !== false) {
                out.unshift(parentNode.title);
                if (parentNode.rootPath != null) {
                    out.unshift(parentNode.rootPath);
                }
                parentNode = parentNode.parentNode;
            }
            return out;
        },
        // eslint-disable-next-line
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
            this.tree.activeNodePath = node.path;
            this.$nextTick(function() {
                if (node != null) {
                    node.titleEl.focus();
                }
            });
        },
        getNodePath(node) {
            let out = [];
            while (node != null && node.isNode !== false) {
                out.unshift(node.indexOnParent);
                node = node.parentNode;
            }
            return out;
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
                nextNode.indexOnParent = activeNode.indexOnParent;
            } else {
                nextNode = parentNode;
            }
            this.setActiveNode(nextNode);
        },
    },
}
</script>

<style scoped>
th {
    padding: 2px 5px;
}

td {
    padding: 2px 5px;
}

tr:first-child {
    border-bottom: 1px solid;
}
</style>
