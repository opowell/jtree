<template>
    <jt-panel :panelId='panelId' :x='x' :y='y' :w='w' :h='h' :title='"Games"' :menus='menus'>
    <div class="loading" v-if="loading">
      Loading...
    </div>
    <b-table :items='games' v-else>
    </b-table>
    </jt-panel>
</template>
<script>
  import JtPanel from './JtPanel.vue';
  import axios from 'axios';

  export default {
      name: 'GamesPanel',
      components: {
          JtPanel,
      },
      props: {
          x: {
              type: Number,
              default: 100,
          },
          y: {
              type: Number,
              default: 100,
          },
          w: {
              type: Number,
              default: 200,
          },
          h: {
              type: Number,
              default: 100,
          },
          panelId: {
              type: Number,
          },
      },
      data() {
          return {
              loading: true,
              games: null,
              menus: [
                {
                    text: 'Start'
                }, 
                {
                    text: 'New'
                },
              ],
          }
      },
      created() {
          this.fetchData();
      },
    methods: {
        fetchData() {
            this.loading = true
            axios
            .get('http://' + window.location.host + '/api/test')
            .then(response => {
                this.games = response.data;
                this.loading = false;
            });
        },
    },
}
</script>