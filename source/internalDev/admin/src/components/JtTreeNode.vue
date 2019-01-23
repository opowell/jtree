<template>
    <div class='node'>
        <div 
            class='node-title'
            :class='{"selected": isSelected}'
            @dblclick.prevent.stop="dblClick"
            @mousedown='mousedown'
            @keydown.down="moveDown"
            @keydown.up="moveUp"
            @keydown.left="moveLeft"
            @keydown.right="moveRight"
            @keydown.f2="f2Func('', $event)"
            tabindex="0"
            @focus="onFocus"
            ref='titleEl'
        >
            <span v-if='allowChildren' class='expand-icon-width'>
                <span v-show='hasChildren' class='expand-icon' @click='toggleExpanded'>
                    {{icon}}
                </span>
            </span>
            <span v-else style='padding-left: 4px' />
            <input 
                v-show='editing'
                class='editor'
                type='text'
                :value='nodeTitle'
                ref='editor'
                autocomplete="off" 
                autocorrect="off" 
                autocapitalize="off" 
                spellcheck="false"
                @mousedown.stop=''
                @keydown.esc='cancelEditing'
                @keydown.enter='renameNode'
                @blur='cancelEditing'
            />
            <span v-show='!editing' class='node-title-text no-text-select'>{{nodeTitle}}</span>
        </div>
        <div class='children' v-show='expanded'>
            <jt-treenode
                v-for='(child, index) in nodeChildren'
                :key='index'
                :nodeProp='child'
                :tree='tree'
                :parentNode='nodeProp'
                :indexOnParent='index'
                :f2Func='f2Func'
                :dblClickFunc='dblClickFunc'
            >
            </jt-treenode>
        </div>
    </div>
</template>

<script>
import axios from 'axios';

export default {
    name: 'jt-treenode',
    props: {
        nodeProp: {},
        tree: {},
        parentNode: {},
        indexOnParent: {},
        expandedProp: {
            default: false
        },
        editingProp: {
            default: false
        },
        f2Func: {},
        dblClickFunc: {},
    },
    data() { return {
        node: this.nodeProp,
        el: null,
        expanded: this.expandedProp,
        editing: this.editingProp,
    }},
    computed: {
        allowChildren() {
            return this.tree.allowChildren;
        },
        isSelected() {
            return this.tree.selection.includes(this.node);
        },
        hasChildren() {
            return this.nodeChildren!=null && this.nodeChildren.length > 0;
        },
        icon() {
            if (this.expanded) {
                return '-';
            } else {
                return '+';
            }
        },
        nodeTitle() {
            return this.node[this.tree.titleField];
        },
        nodeChildren() {
            return this.node[this.tree.childrenField];
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
                return this.nodeChildren[this.nodeChildren.length - 1].component.lastOpenNode();
            } else {
                return this.node;
            }
        },
        onFocus() {

        },
        dblClick() {
            if (this.hasChildren) {
                this.toggleExpanded();
            } else {
                this.dblClickFunc();
            }
        },
        toggleExpanded() {
            this.expanded = !this.expanded;
        },
        mousedown() {
            this.tree.component.setActiveNode(this.node);
        },
        moveDown() {
            if (this.editing) {
                return;
            }
            let nextNode = null;
            if (this.expanded && this.hasChildren) {
                nextNode = this.nodeChildren[0];
            } 
            // Last child of parent
            else if (this.parentNode[this.tree.childrenField].length === this.indexOnParent + 1) {
                let node = this;
                while (node.parentNode != null && node.parentNode[this.tree.childrenField].length === node.indexOnParent + 1) {
                    node = node.parentNode;
                }
                if (node.parentNode == null) {
                    return;
                }
                nextNode = node.parentNode[this.tree.childrenField][node.indexOnParent+1];
            } else {
               nextNode = this.parentNode[this.tree.childrenField][this.indexOnParent+1];
            }
            this.tree.component.setActiveNode(nextNode);
        },
        cancelEditing() {
            this.editing = false;
            this.tree.component.setActiveNode(this.node);
        },
        moveUp() {
            if (this.editing) {
                return;
            }
            let nextNode = null;
            if (this.indexOnParent < 1) {
                if (this.parentNode.isNode === false) {
                    return;
                }
               nextNode = this.parentNode;
            } else {
               nextNode = this.parentNode[this.tree.childrenField][this.indexOnParent-1].component.lastOpenNode();
            }
            this.tree.component.setActiveNode(nextNode);
        },
        moveLeft() {
            if (this.editing) {
                return;
            }
            if (this.expanded) {
                this.expanded = false;
            } else {
                if (this.parentNode != null && this.parentNode.isNode !== false) {
                    this.tree.component.setActiveNode(this.parentNode);
                }
            }
        },
        moveRight() {
            if (this.editing) {
                return;
            }
            this.expanded = true;
        },
        renameNode() {
            let parentPath = this.tree.component.$parent.getParentPath(this.tree.activeNode);
            axios.post(
                'http://' + window.location.host + '/api/file/rename',
                {
                    oldName: this.tree.activeNode.title,
                    path: parentPath,
                    newName: this.$refs.editor.value,
                }
            ).then(response => {
                console.log(response);
                this.node.title = this.$refs.editor.value;
                this.cancelEditing();
            });
        },
        startEditing() {

        },
    },
}
</script>

<style scoped>
.children {
    padding-left: 1rem;
}

.expand-icon-width {
    flex: 0 0 16px;
    padding-top: 2px;
    padding-bottom: 2px;
    display: flex;
}

.expand-icon {
    cursor: pointer;
    text-align: center;
    flex: 1 1 auto;
}

.node {
    display: flex;
    flex-direction: column;
    /* padding-left: 5px;
    padding-right: 5px; */
    flex: 1 1 auto;
}

.node-title {
    display: flex;
    /* padding-left: 2px;
    padding-right: 2px; */
    cursor: pointer;
    white-space: nowrap;
}

.node-title:hover {
    background-color: var(--nodeTitleHoverBGColor);
}

.selected {
    color: var(--nodeSelectedColor);
    background-color: var(--nodeSelectedBGColor);
}

.selected:hover {
    color: var(--nodeSelectedHoverColor);
    background-color: var(--nodeSelectedHoverBGColor);
}

.editor {
    padding: 0px;
    margin: 0px;
    border: none;
    padding: 2px;
}

.node-title-text {
    padding-top: 2px;
    padding-bottom: 2px;
}

</style>
