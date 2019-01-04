import MainMenu from './MainMenu.js';
import SelectAppModal from './Modal_SelectApp.js';

export default {
  name: 'App',
  components: {
    MainMenu,
    SelectAppModal
  },
  data: function() {
    return {
      apps: this.apps
    }
  },
  template: `
    <div>
      <main-menu></main-menu>
      <select-app-modal :apps='apps'></select-app-modal>
    </div>
  `,
};