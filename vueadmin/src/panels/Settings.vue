<template>
    <div>
        <action-bar @changeFilterText='changeFilterText'
            :menus='actions' ref='actionBar'>
        </action-bar>
        <div style='flex: 1 1 auto; align-self: stretch; overflow: auto; padding: 5px;'>
            <div style='padding-left: 5px; padding-bottom: 1rem;'>
                Load preset:
                <span v-for='(preset, index) in presets' 
                    :key='preset.name'
                    @click='setPreset(preset)'
                    style='padding: 5px 10px; border: 1px solid; margin: 5px; cursor: pointer;'
                >
                    {{index + 1}}. {{preset.name}}
                </span>
            </div>
            <b-row style='margin-left: 0px; margin-right: 0px;' class="my-1 form-group row" v-for="setting in filteredSettings" :key="setting.key">
                <b-col class="col-sm-2 col-form-label">
                    <label :for="`setting-${setting.key}`">
                        {{ setting.name }}:
                    </label>
                </b-col>
                <b-col class="col-sm-10">
                    <b-form-select v-if='setting.type == "select"'
                        :id="`setting-${setting.key}`"
                        :options='setting.options'
                        :value='getStateValue(setting.key)'
                        @input="change(setting, $event)"
                    />
                    <b-form-checkbox 
                        v-else-if='setting.type == "checkbox"'
                        :id="`setting-${setting.key}`"
                        :checked='getStateValue(setting.key)'
                        @input="change(setting, $event)"
                    />
                    <!-- <toggle-button 
                        v-else-if='setting.type == "checkbox"'
                        :id="`setting-${setting.key}`"
                        :value='getStateValue(setting.key)'
                        @change="change(setting, $event)"
                        :labels="true"
                        :sync='true'
                    /> -->
                    <b-form-input v-else 
                        :id="`setting-${setting.key}`"
                        :type="setting.type"
                        :value='getStateValue(setting.key)'
                        @input="change(setting, $event)"
                    />
                </b-col>
            </b-row>
        </div>
    </div>
</template>
<script>

import ActionBar from '@/components/ActionBar.vue'

export default {
    name: 'SettingsPanel',
    components: {
        'action-bar': ActionBar,
    },
    props: [
        'dat',
        'panel',
    ],
    mounted() {
        this.panel.id = 'Settings';
    },
    data() {
        return {
            actions: [
            {
                icon: 'far fa-folder-open',
                hasParent: false,
                title: 'Load preset...'
            }, 
            {
                icon: 'fas fa-save',
                hasParent: false,
                title: 'Save preset...'
            },
            ],
            filterText: '',
        }
    },
    computed: {
        presets() {
            return this.$store.state.settingsPresets;
        },
        editableSettings() {
            let out = [];
            let settings = this.$store.state.persistentSettings;
            for (let i=0; i<settings.length; i++) {
                if (settings[i].editable !== false) {
                    out.push(settings[i]);
                }
            }
            return out;
        },
        filteredSettings() {
            let out = [];
            for (let i=0; i<this.editableSettings.length; i++) {
                if (this.editableSettings[i].name.includes(this.filterText)) {
                    out.push(this.editableSettings[i]);
                }
            }
            return out;
        },
    },
    methods: {
        changeFilterText() {
            this.filterText = this.$refs.actionBar.filterText;
        },
        change(setting, ev) {
            this.$store.commit('setSetting', {key: setting.key, value: ev});
        },
        getStateValue(key) {
            return this.$store.state[key];
        },
        setPreset(preset) {
            for (let i in preset.values) {
            this.change({key: i}, preset.values[i]);   
            }
        },
    }
}
</script>

<style scoped>
.content {
    color: var(--areaContentFontColor);
    background-color: var(--areaContentBGColor);
}
</style>