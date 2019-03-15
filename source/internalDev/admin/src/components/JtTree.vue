<template>
    <div>
        <jt-treenode 
            v-for='(baseNode, index) in nodesProp' 
            :key='index'
            :nodeProp='baseNode'
            :parentNode='node'
            :tree='tree'
            :indexOnParent='index'
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
    props: [
        'nodesProp',
    ],
    data() {
        return {
            nodes: this.nodesProp,
            tree: {
                selection: [],
                activeNode: null,
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
}
</script>

<style>

</style>
