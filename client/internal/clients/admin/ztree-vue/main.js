import App from './components-vue/App.js';

Vue.config.productionTip = false;

const jt = {};

new Vue({
    render: h => h(App),
}).$mount(`#app`);