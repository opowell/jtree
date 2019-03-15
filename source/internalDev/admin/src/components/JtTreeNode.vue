<template>
    <div class='node'>
        <div 
            class='node-title'
            :class='{"selected": isSelected}'
            @dblclick.prevent.stop='toggleExpanded'
            @mousedown='select'
            @keydown.down="moveDown"
            @keydown.up="moveUp"
            @keydown.left="moveLeft"
            @keydown.right="moveRight"
            tabindex="0"
            @focus="onFocus"
        >
            <span v-show='hasChildren' class='expand-icon' @click='toggleExpanded'>
                {{icon}}
            </span>
            <span v-show='!hasChildren' class='expand-icon'></span>
            {{node.title}}
        </div>
        <div class='children' v-show='expanded'>
            <jt-treenode
                v-for='(child, index) in node.children'
                :key='index'
                :nodeProp='child'
                :selection='selection'
                :parentNode='nodeProp'
                :indexOnParent='index'
            >
            </jt-treenode>
        </div>
    </div>
</template>

<script>
export default {
    name: 'jt-treenode',
    props: [
        'nodeProp',
        'selection',
        'parentNode',
        'indexOnParent',
    ],
    data() { return {
        node: this.nodeProp,
        expanded: false,
    }},
    computed: {
        isSelected() {
            return this.selection.includes(this.node);
        },
        hasChildren() {
            return this.nodeProp.children!=null && this.nodeProp.children.length > 0;
        },
        icon() {
            if (this.expanded) {
                return '-';
            } else {
                return '+';
            }
        },
    },
    methods: {
        onFocus() {

        },
        toggleExpanded() {
            this.expanded = !this.expanded;
        },
        select() {
            this.selection.splice(0, this.selection.length);
            this.selection.push(this.node);
        },
        keypress() {
            console.log('key press');
        },
        moveDown() {
            console.log('down');
            this.selection.splice(0, this.selection.length);
            let nextNode = null;
            if (this.parentNode.children.length < this.indexOnParent+1) {
               nextNode = this.parentNode;
            } else {
               nextNode = this.parentNode.children[this.indexOnParent+1];
            }
            this.selection.push(nextNode);
            nextNode
        },
        moveUp() {
            console.log('up');
            this.selection.splice(0, this.selection.length);
            if (this.indexOnParent < 1) {
               this.selection.push(this.parentNode);
            } else {
               this.selection.push(this.parentNode.children[this.indexOnParent-1]);
            }
        },
        moveLeft() {
            console.log('left');
        },
        moveRight() {
            console.log('right');
        },
    },
}
</script>

<style scoped>
.children {
    padding-left: 1rem;
}

.expand-icon {
    flex: 0 0 14px;
}

.node {
    display: flex;
    font-size: 11pt;
    flex-direction: column;
    padding-left: 5px;
    padding-right: 5px;
}

.node-title {
    display: flex;
    padding: 2px;
}

.selected {
    background-color: blue;
}
</style>
