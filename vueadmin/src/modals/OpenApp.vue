<template>
      <b-modal 
        id="openAppModal" 
        tabindex="-1" 
        role="dialog"
        size='xl'
        :title='"Open " + this.$store.state.appName'
        class='test'
        style='max-width: unset'
        >
        <table class='table table-hover'>
            <thead>
                <tr>
                    <th></th>
                    <th>id</th>
                    <th>description</th>
                </tr>
            </thead>
            <tbody>
            <AppRow 
                v-for='app in apps'
                :key='app.id'
                :fields='["playButton", "id", "description"]'
                :app='app'
                @click.native="clickApp(app.id, $event)"
                style='cursor: pointer;'
            />
            </tbody>
        </table>
        <template v-slot:modal-footer="{ hide }">
            <button type="button" class="btn btn-sm btn-outline-primary" @click='hide'>Close</button>
        </template>
      </b-modal>
</template>

<script>

import 'jquery'
let $ = window.jQuery
import jt from '@/webcomps/jtree.js'

export default {
  name: 'ModalOpenApp',
  data() {
    return {
        apps: this.$store.state.appInfos
    }
  },
    methods: {
        clickApp(id, ev) {
        if (
            ($(ev.target).prop('tagName') !== 'SELECT') &&
            ($(ev.target).prop('tagName') !== 'INPUT') &&
            ($(ev.target).prop('tagName') !== 'A')
        ) {
            window.vue.$bvModal.hide('openAppModal');
            jt.openApp(id);
        }
    }
  },

}

</script>