<template>
    <div style='padding: 10px'>
        <b-row class="my-1" v-for="setting in settings" :key="setting.key">
            <b-col style='flex: 1 1 auto'><label :for="`setting-${setting.key}`">{{ setting.name }}:</label></b-col>
            <b-col style='flex: 0 0 300px'>
                <b-form-select v-if='setting.type == "select"'
                    :id="`setting-${setting.key}`"
                    :options='setting.options'
                    @input="change(setting, $event)"
                />
                <b-form-checkbox 
                    v-else-if='setting.type == "checkbox"'
                    :id="`setting-${setting.key}`"
                    :checked='getStateValue(setting.key)'
                    @input="change(setting, $event)"
                />
                <b-form-input v-else 
                    :id="`setting-${setting.key}`"
                    :type="setting.type"
                    :value='getStateValue(setting.key)'
                    @input="change(setting, $event)"
                />
            </b-col>
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
                      key: 'appName',
                  },
                  {
                      name: 'Windows maximized',
                      type: 'checkbox',
                      key: 'windowsMaximized',
                  },
                  {
                      name: 'Window, background color',
                      type: 'text',
                      key: 'windowBGColor',
                  },
                  {
                      name: 'Focussed window, background color',
                      type: 'text',
                      key: 'windowFocussedBGColor',
                  },
                  {
                      name: 'Allow multiple areas in a window',
                      type: 'checkbox',
                      key: 'allowMultipleAreasInAWindow'
                  },
                  {
                      name: 'Allow multiple panels in an area',
                      type: 'checkbox',
                      key: 'allowMultiplePanelsInAnArea'
                  },
                  {
                      name: 'Open new panels in',
                      type: 'select',
                      options: ['New window', 'Active window when in maximized mode, otherwise new window', 'Active window'],
                      key: 'openNewPanelsIn',
                  },
                  {
                      name: 'Hide tabs when only single panel in area',
                      type: 'checkbox',
                      key: 'hideTabsWhenSinglePanel'
                  },

              ]
          }
      },
      methods: {
          change(setting, ev) {
              this.$store.commit('setSetting', {key: setting.key, value: ev});
          },
          getStateValue(key) {
              return this.$store.state[key];
          },
      }
  }
</script>