<template>
  <b-modal size="xl" id="welcomeModal" title="Welcome to jtree" hide-footer>
    <h3>Games</h3>
    <button type="button" class="btn btn-primary">Design new</button>
    <div v-show='loading'>Loading...</div>
    <div style='display: flex; flex-flow: wrap'>
        <div v-for='game in games' :key='game.name' class='gameDiv' :title='game.fullPath'>
            <div class='gameDivText'>{{game.name}}</div>
            <!-- <div class='gameDivPath'>{{game.fullPath}}</div> -->
            <button type="button" class="btn btn-primary" v-on:click='designGame(game.fullPath)'>Design</button>
            <button type="button" class="btn btn-primary" v-on:click='runGame(game.fullPath)'>Run</button>
        </div>
    </div>
    <h3>Sessions</h3>
    <button type="button" class="btn btn-primary">New</button>
    <div v-show='loading'>Loading...</div>
    <div v-for='session in sessions' :key='session.id'>
        {{session.id}}
    </div>
  </b-modal>
</template>
<script>
import axios from 'axios';

export default {
        name: 'WelcomeModal',
        data() {
            return {
                loading: true,
                games: [],
                sessions: [],
            }
        },
        created() {
            this.fetchData();
        },
    methods: {
        openSelectedFileAsSession() {
            let activeNode = this.$refs.tree.activeNode();
            let filePath = this.getParentPath(activeNode);
            filePath.push(activeNode.title);

            let options = {};
            var d = {
                filePath: filePath,
                sId: this.$store.state.sessionId,
                options: options
            };
            global.jt.socket.emit('openGameAsSession', d);
            this.$bvModal.hide();
        },
        fetchData() {
            let that = this;
            this.loading = true;
            this.games.splice(0, this.games.length);
            this.sessions.splice(0, this.sessions.length);
            axios
            .get('http://' + window.location.host + '/api/games')
            .then(response => {
                that.games.push.apply(that.games, response.data);
                axios
                .get('http://' + window.location.host + '/api/sessions')
                .then(response => {
                    that.sessions.push(response.data);
                    that.loading = false;
                });
            });
        },
        designGame(fullPath) {
            let options = {};
            var d = {
                filePath: fullPath,
                options: options
            };
            global.jt.socket.emit('openGameAsNewSession', d);
            this.$bvModal.hide('welcomeModal');
       },
        runGame(fullPath) {

        }
    },
}
</script>

<style scoped>
.gameDiv {
    flex: 0 0 200px;
    background-color: #9dcfe6;
    border-radius: 5px;
    margin: 2px;
    padding: 5px;
}

.gameDivText {
    /* font-size: 18pt; */
    margin-bottom: 5px;
}

.gameDivPath {
    font-size: 10pt;
}
</style>