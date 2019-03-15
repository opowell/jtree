<template>
<div>
            <b-row class="my-1" v-for="setting in settings" :key="setting.name">
            <b-col sm="3">
                <b-form-select v-if='setting.type == "select"'
                    :id="`setting-${setting.name}`"
                    :options='setting.options'
                ></b-form-select>
                <b-form-checkbox v-if='setting.type == "checkbox"'
                    :id="`setting-${setting.name}`"
                ></b-form-checkbox>
                <b-form-input v-else 
                    :id="`setting-${setting.name}`"
                    :type="setting.type" :value='setting.value'
                ></b-form-input>
            </b-col>
            <b-col sm="9"><label :for="`setting-${setting.name}`">{{ setting.name }}:</label></b-col>
        </b-row>

    </div>
</template>
<script>
  export default {
      name: 'SettingsPanel',
      props: ['dat'],
      data() {
          return {
              menus: [
                {
                    text: 'Load',
          hasParent: false,
                }, 
                {
                    text: 'Save',
                              hasParent: false,

                },
              ],
              settings: [
                  {
                      name: 'Game name',
                      type: 'text',
                      value: this.$store.state.appName,
                  },
                  {
                      name: 'Panels maximized',
                      type: 'checkbox',
                      value: this.$store.state.panelsMaximized,
                  }
              ]
          }
      },
  }
</script>