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
            ref='titleEl'
        >
            <span v-show='hasChildren' class='expand-icon-width expand-icon' @click='toggleExpanded'>
                {{icon}}
            </span>
            <span v-show='!hasChildren' class='expand-icon-width'></span>
            {{node.title}}
        </div>
        <div class='children' v-show='expanded'>
            <jt-treenode
                v-for='(child, index) in node.children'
                :key='index'
                :nodeProp='child'
                :tree='tree'
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
        'tree',
        'parentNode',
        'indexOnParent',
    ],
    data() { return {
        node: this.nodeProp,
        el: null,
        expanded: false,
    }},
    computed: {
        isSelected() {
            return this.tree.selection.includes(this.node);
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
    mounted() {
        this.node.el = this.$el;
        this.node.titleEl = this.$refs.titleEl;
        this.node.parentNode = this.parentNode;
        this.node.indexOnParent = this.indexOnParent;
        this.node.component = this;
    },
    methods: {
        lastOpenNode() {
            if (this.expanded && this.hasChildren) {
                return this.node.children[this.node.children.length - 1].component.lastOpenNode();
            } else {
                return this.node;
            }
        },
        onFocus() {

        },
        toggleExpanded() {
            this.expanded = !this.expanded;
        },
        select() {
            this.tree.selection.splice(0, this.tree.selection.length);
            this.tree.selection.push(this.node);
        },
        moveDown() {
            let nextNode = null;
            if (this.expanded && this.hasChildren) {
                nextNode = this.node.children[0];
            } 
            // Last child of parent
            else if (this.parentNode.children.length === this.indexOnParent + 1) {
                let node = this;
                while (node.parentNode != null && node.parentNode.children.length === node.indexOnParent + 1) {
                    node = node.parentNode;
                }
                if (node.parentNode == null) {
                    return;
                }
                nextNode = node.parentNode.children[node.indexOnParent+1];
            } else {
               nextNode = this.parentNode.children[this.indexOnParent+1];
            }
            this.setActiveNode(nextNode);
        },
        clearSelection() {
            this.tree.selection.splice(0, this.tree.selection.length);
        },
        moveUp() {
            let nextNode = null;
            if (this.indexOnParent < 1) {
                if (this.parentNode.isNode === false) {
                    return;
                }
               nextNode = this.parentNode;
            } else {
               nextNode = this.parentNode.children[this.indexOnParent-1].component.lastOpenNode();
            }
            this.setActiveNode(nextNode);
        },
        moveLeft() {
            if (this.expanded) {
                this.expanded = false;
            } else {
                this.setActiveNode(this.parentNode);
            }
        },
        setActiveNode(node) {
            this.clearSelection();
            this.tree.selection.push(node);
            node.titleEl.focus();
        },
        moveRight() {
            this.expanded = true;
        },
    },
}
</script>

<style scoped>
.children {
    padding-left: 1rem;
}

.expand-icon-width {
    flex: 0 0 20px;
}

.expand-icon {
    cursor: pointer;
    text-align: center;
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
    cursor: pointer;
}

.selected {
    background-color: blue;
}
</style>
