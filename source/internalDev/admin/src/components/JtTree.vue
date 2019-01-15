<template>
    <div>
        <jt-treenode 
            v-for='(baseNode, index) in nodesProp' 
            :key='index'
            :nodeProp='baseNode'
            :selection='selection'
            :parentNode='null'
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
            selection: [],
        }
    },
}
</script>

<style>

</style>
