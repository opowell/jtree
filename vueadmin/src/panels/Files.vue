<template>
    <div style='flex: 1 1 auto; align-self: stretch; overflow: auto;'>
        <span style='display: flex;' class='mb-2'>
            <span>
                <span v-for='(piece, index) in pathPieces' :key='index'>
                    <span @click='setPathIndex(index)' class='path-piece'>
                        {{ piece }}
                        </span>
                    <span class='path-delimiter' v-if='index < pathPieces.length - 1'>/</span>
                </span>
            </span>
            <span style='flex: 1 1 auto' />
            <b-button variant="outline-secondary" size="sm" onclick='jt.showCreateQueueModal()'>
                <font-awesome-icon :icon="['fas', 'plus']"/>&nbsp;&nbsp;New File
            </b-button>
            <b-button variant="outline-secondary" size="sm" onclick='jt.showCreateQueueModal()'>
                <font-awesome-icon :icon="['fas', 'plus']"/>&nbsp;&nbsp;New Folder
            </b-button>
            <b-button variant="outline-secondary" size="sm" @click='refresh'>
                <font-awesome-icon :icon="['fas', 'redo-alt']"/>&nbsp;&nbsp;Refresh
            </b-button>
        </span>

      <table class='table table-hover' style='width: 100% !important;'>
            <div @dblclick='openFolder(entry)' v-for='(entry, index) in contents' :key='index' class='div'>
                <span v-if='entry.isFolder' @click='openFolder(entry)' class='expand'>+</span>
                <span v-else class='expand'></span>
                <span class='name'>{{ entry.name }}</span>
            </div>
              <!-- <QueueRow 
                v-for='queue in queues'
                :key='queue.id'
                :fields='["playButton", "id", "apps.length"]'
                :queue='queue'
                @click.native="clickQueue(queue, $event)"
                style='cursor: pointer;'
              /> -->
      </table>
  </div>
</template>

<script>

import jt from '@/webcomps/jtree.js'
import axios from 'axios'
// import server from '@/webcomps/msgsToServer.js'

export default {
  name: 'FilesPanel',
  props: [
    'dat',
    'panel',
  ],
  mounted() {
      this.refresh();
  },
  data() {
    return {
        queues: this.$store.state.queues,
        jt,
        path: '.',
        contents: [],
    }
  },
  methods: {
      async refresh() {
        const response = await axios.get('/api/folder', {
            params: {
                path: this.path,
            },
        });
        this.contents = response.data;
      },
      openFolder(entry) {
          if (!entry.isFolder) {
              return;
          }
          this.path = this.path + '/' + entry.name;
          this.refresh();
      },
      setPathIndex(index) {
          if (index >= this.pathPieces.length) {
              return;
          }
          let newPath = '';
          for (let i=0; i<= index; i++) {
              newPath += this.pathPieces[i];
              if (i < index) {
                  newPath += '/';
              }
          }
          this.path = newPath;
          this.refresh();
      },
  },
  computed: {
      pathPieces() {
          return this.path.split('/');
      }
  },
  mounted() {
      this.panel.id = 'Files';
  },
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.expand {
    flex: 0 0 20px;
}

.name {
    flex: 1 1 auto;
}

.div {
    display: flex;
    padding: 5px;
    cursor: pointer;
}

.div:hover {
    background-color: rgb(130, 193, 214);
}

.path-piece {
    padding: 2px;
}

.path-delimiter {
    padding: 2px;
    color: #888;
}

.path-piece:hover {
    background-color: rgb(130, 193, 214);
}
</style>
