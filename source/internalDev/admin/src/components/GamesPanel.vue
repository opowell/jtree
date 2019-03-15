<template>
<div>
    <div class="loading" v-if="loading">
    Loading...
    </div>
    <b-table v-else
        :items='games'
        :fields='fields'
        small>
        <template slot="icon" slot-scope="data">
        <i :class='getIcon(data.item)'></i>
        </template>
        <template slot="name" slot-scope="data">
        <span :class='getNameClass(data.item)'>{{data.item.name}}</span>
        </template>

        <template slot="actions" slot-scope="data">
            <div class="btn-group">
                <button class="btn btn-outline-primary btn-sm" @click.stop='startSession(data.item)'>
                    <i class="fa fa-play" title="start new session with this queue"></i>
                </button>
                <button class="btn btn-sm btn-outline-secondary" @click.stop='deleteConfirm(data.item)'>
                    <i class="fa fa-trash" title="delete"></i>
                </button>
            </div>
        </template>
    </b-table>
</div></template>
<script>
  import axios from 'axios';

  export default {
      name: 'GamesPanel',
      props: [
          'dat',
      ],
      data() {
          return {
              loading: true,
              games: null,
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
              path: '/apps',
              fields: [
                  {
                      key: 'actions',
                      label: '',
                  },
                {
                    key: 'icon',
                    label: '',
                },
                {key: 'name'},
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
            .get('http://' + window.location.host + '/api/games')
            .then(response => {
                this.games = response.data;
                this.loading = false;
            });
        },
        getIcon(item) {
            return this.getNameClass(item) + (item.isFolder ? " fas fa-folder" : " fas fa-file");
},
        getNameClass(item) {
            return item.isFolder ? "text-secondary" : "text-primary";
        },
            // openQueue(item, index, event) {
            // },
            deleteConfirm() {
            },
            startSession() {
            },
    },
}
</script>

<style>
.table thead th {
    border-bottom: none;    
}

.table td, .table th {
    border: none;
}

.form-control {
    font-size: inherit;
}
</style>