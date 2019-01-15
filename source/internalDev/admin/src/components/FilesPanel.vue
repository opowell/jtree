<template>
    <div style='padding-top: 10px; padding-bottom: 10px;'>
        <!-- <liquor-tree
            :data='treeData'
        >
        </liquor-tree>
        <liquor-tree
            :data='nodes'
        >
        </liquor-tree> -->
        <jt-tree
            :nodesProp='nodes'
        >

        </jt-tree>
        <!-- <div class="contextmenu" ref="contextmenu" v-show="contextMenuIsVisible">
            <div>Remove</div>
        </div> -->
    </div>
</template>
<script>
  import axios from 'axios';

// import { library } from '@fortawesome/fontawesome-svg-core';
// import {
//   faCaretRight, faCaretDown, faTable, faImage, faFile, faCircle, faCode, faFolder, faFolderOpen
// } from '@fortawesome/free-solid-svg-icons';
// import { faJs, } from '@fortawesome/free-brands-svg-icons';
// import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
// library.add(faJs, faCaretRight, faCaretDown, faTable, faImage, faFile, faCircle, faCode, faFolder, faFolderOpen);

// import LiquorTree from 'liquor-tree'
import JtTree from '@/components/JtTree.vue'

var f1 = [
  { "data": { "complexity": 5 }, "text": "Introduction", "children": [
    { "data": { "complexity": 6 }, "text": "Who Should Read This Book?" },
    { "data": { "complexity": 7 }, "text": "How to Read This Book" },
    { "data": { "complexity": 8 }, "text": "What’s in This Book?" },
    { "data": { "complexity": 9 }, "text": "Have Fun!" }
  ]},
  { "data": { "complexity": 2 }, "text": "Part I: Fundamentals", "children": [
    { "data": { "complexity": 1 }, "text": "What Is JavaScript?", "children": [
      { "data": { "complexity": 3 }, "text": "Meet JavaScript" },
      { "data": { "complexity": 6 }, "text": "Why Learn JavaScript?" },
      { "data": { "complexity": 8 }, "text": "The Structure of a JavaScript Program", "children": [
        { "data": { "complexity": 12 }, "text": "Syntax" },
        { "data": { "complexity": 4 }, "text": "Comments" }
      ]}
    ]},
    { "data": { "complexity": 11 }, "text": "Data Types and Variables", "children": [
      { "data": { "complexity": 10 }, "text": "Numbers and Operators" },
      { "data": { "complexity": 12 }, "text": "Variables", "children": [
        { "data": { "complexity": 11 }, "text": "Naming Variables" },
        { "data": { "complexity": 3 }, "text": "Creating New Variables Using Math" },
        { "data": { "complexity": 19 }, "text": "Incrementing and Decrementing" },
        { "data": { "complexity": 3 }, "text": "+= (plus-equals) and –= (minus-equals)" }
      ]}
    ]}
  ]},
  {
    "data": { "complexity": 1 }, "text": "Part II: Advanced JavaScript", "children": [
      { "data": { "complexity": 5 }, "text": "The DOM and jQuery", "children": [
        { "data": { "complexity": 10 }, "text": "Selecting DOM Elements" },
        { "data": { "complexity": 1 }, "text": "Using jQuery to Work with the DOM Tree", "children": [
          { "data": { "complexity": 16 }, "text": "Loading jQuery on Your HTML Page" },
          { "data": { "complexity": 10 }, "text": "Replacing the Heading Text Using jQuery" }
        ]},
        { "data": { "complexity": 8 }, "text": "Creating New Elements with jQuery" },
        { "data": { "complexity": 9 }, "text": "Animating Elements with jQuery" },
        { "data": { "complexity": 12 }, "text": "Chaining jQuery Animations"},
        { "data": { "complexity": 13 }, "text": "What You Learned" }
      ]},
      { "data": { "complexity": 17 }, "text": "Interactive Programming" },
      { "data": { "complexity": 18 }, "text": "Find the Buried Treasure!" },
      { "data": { "complexity": 19 }, "text": "Object-Oriented Programming" }
  ]},
  {
    "data": { "complexity": 2 }, "text": "Part III: Canvas", "children": [
      { "data": { "complexity": 3 }, "text": "The canvas Element", "children": [
        { "data": { "complexity": 4 }, "text": "Creating a Basic Canvas" },
        { "data": { "complexity": 5 }, "text": "Drawing on the Canvas", "children": [
          { "data": { "complexity": 6 }, "text": "Selecting and Saving the canvas Element" },
          { "data": { "complexity": 7 }, "text": "Getting the Drawing Context" },
          { "data": { "complexity": 8 }, "text": "Drawing a Square" },
          { "data": { "complexity": 9 }, "text": "Drawing Multiple Squares" }
        ]},
        { "data": { "complexity": 12 }, "text": "Changing the Drawing Color" },
        { "data": { "complexity": 13 }, "text": "Drawing Rectangle Outlines" },
        { "data": { "complexity": 14 }, "text": "Drawing Lines or Paths" },
        { "data": { "complexity": 15 }, "text": "Filling Paths" },
        { "data": { "complexity": 16 }, "text": "Drawing Arcs and Circles", "children": [
          { "data": { "complexity": 12 }, "text": "Drawing a Quarter Circle or an Arc" },
          { "data": { "complexity": 13 }, "text": "Drawing a Half Circle" },
          { "data": { "complexity": 14 }, "text": "Drawing a Full Circle" }
        ]},
        { "data": { "complexity": 15 }, "text": "Drawing Lots of Circles with a Function" },
        { "data": { "complexity": 16 }, "text": "What You Learned" },
        { "data": { "complexity": 16 }, "text": "Programming Challenges", "children": [
          { "data": { "complexity": 11 }, "text": "#1: A Snowman-Drawing Function" },
          { "data": { "complexity": 10 }, "text": "#2: Drawing an Array of Points" },
          { "data": { "complexity": 13 }, "text": "#3: Painting with Your Mouse" },
          { "data": { "complexity": 14 }, "text": "#4: Drawing the Man in Hangman" }
        ]}
      ]},
      { "data": { "complexity": 20 }, "text": "Making Things Move on the Canvas" }
    ]
  }
]

  export default {
      name: 'FilesPanel',
      components: {
        // 'font-awesome-icon': FontAwesomeIcon,
        // 'liquor-tree': LiquorTree,
        'jt-tree': JtTree,
      },
      props: ['dat'],
      data() {
          return {
              contextMenuIsVisible: true,
              loading: true,
              nodes: [],
              treeData: f1,
              menus: [
                {
                    text: 'Start',
                    hasParent: false,
                }, 
                {
                    text: 'New',
                    hasParent: false,
                },
              ],
              treeOptions: {
                propertyNames: {
                    text: 'title',
                }
              },
          }
      },
      created() {
          this.fetchData();
      },
    methods: {
        fetchData() {
            this.loading = true
            axios
            .get('http://' + window.location.host + '/api/files')
            .then(response => {
                this.nodes = response.data;
                this.loading = false;
            });
        },
        nodeDoubleClick(node, event) {
            // console.log(`nodeDoubleClick ${node.title} ${node.data.type} isLeaf ${node.isLeaf} ${util.inspect(node)}`);
            event.preventDefault();
            if (!node.isLeaf) {
                this.nodes[node.path].isExpanded = !this.nodes[node.path].isExpanded;
                // this.$refs.slvuetree.onToggleHandler(event, node);
                // return;
            }
            // this.$emit('nodeDoubleClick', node);
        },
    //   showContextMenu(node, event) {
    //     event.preventDefault();
    //     this.contextMenuIsVisible = true;
    //     const $contextMenu = document.querySelector('.contextmenu');
    //     $contextMenu.style.left = event.clientX + 'px';
    //     $contextMenu.style.top = event.clientY + 'px';
    //   },
      showContextMenu(node, event) {
        event.preventDefault();
        this.contextMenuIsVisible = true;
        const $contextMenu = this.$refs.contextmenu;
        $contextMenu.style.left = (event.clientX) + 'px';
        $contextMenu.style.top = (event.clientY) + 'px';
      },
    },
}
</script>

<style scoped>
.table thead th {
    border-bottom: none;    
}

.table td, .table th {
    border: none;
}

.form-control {
    font-size: inherit;
}

  .contextmenu {
    position: absolute;
    background-color: white;
    color: black;
    border-radius: 2px;
    cursor: pointer;
  }
  .contextmenu > div {
    padding: 10px;
  }
  .contextmenu > div:hover {
    background-color: rgba(100, 100, 255, 0.5);
  }

</style>