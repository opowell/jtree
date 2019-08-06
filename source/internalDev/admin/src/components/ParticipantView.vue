<template>
        <div class="card panel ui-widget-content participant-view">
            <div class="card-header">
                <span>{{participant.id}}</span>
                <button type="button" class="headerBtn close float-right">
                    <i title="close" class="fa fa-times"></i>
                </button>
                <button type="button" class="headerBtn close float-right">
                    <i title="open in new window" class="fa fa-external-link-alt"></i>
                </button>
                <button title="toggle autoplay" id="P1-autoplay" type="button" class="headerBtn close float-right">A</button>
                <button type="button" class="headerBtn close float-right">
                    <i title="refresh" class="fa fa-redo-alt"></i>
                </button>
            </div>
            <iframe :src="url" class="participant-frame"></iframe>
        </div>
</template>

<script>
    export default {
        name: 'ParticipantView',
        props: [
            'participant',
        ],
        computed: {
            url() {
                return 'http://' + jt.serverURL() + '/' + this.participant.id;;
            }
        }
    }
</script>

<style>
.panel {
    flex: 0 1 auto;
    min-width: 20rem;
    margin-right: 0.3rem;
    margin-bottom: 0.2rem;
    margin-top: 0.2rem;
}

.participant-frame {
    flex: 1 1 auto;
    border: none;
    height: 17rem;
}
</style>