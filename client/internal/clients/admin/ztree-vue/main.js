import App from './components-vue/App.js';

Vue.config.productionTip = false;

$(document).click(function() {
    jt.closeMenu();
})

jt.closeMenu = function() {
    // console.log('closing menu');
    $('.menu').removeClass('show');
    $('.menu-dropdown').removeClass('show');
    $('.menu-focussed').removeClass('menu-focussed');
    jt.selMenu = null;
    if ($(document.activeElement).closest('.menu').length > 0) {
        document.activeElement.blur();
    }
    $('#jt-menu').removeClass('menubar-focussed');
}

jt.openMenu = function(el) {
    jt.closeMenu();
    $(el).addClass('show');
    var menuEl = $(el).find('.menu-text');
    jt.selMenu = menuEl[0];
    menuEl.addClass('menu-focussed');
    menuEl.focus();
    var dropdown = $(el).find('.menu-dropdown')[0];
    $(dropdown).addClass('show');
}

jt.registerKeyEvents = function() {

    $(document).bind('keydown', 'alt', function(e) {
        // console.log('pressed alt');
        e.preventDefault();
        jt.toggleMainMenuFocus();
        return false;
    });

}

jt.toggleMainMenuFocus = function() {
    var focMenus = $('.menu-text.menu-focussed');
    // If a menu element has focus, close it and clear focus.
    if (focMenus.length > 0) {
        jt.closeMenu();
    }
    // If no menu is open, focus on first active menu element.
    else {
        jt.focusMenuButton($('#jt-menu .menu-active').find('.menu-text')[0]);
    }
}

jt.selMenu = null;

jt.openSelectedFile = function() {
    var file = $('#openFileDialog')[0].files[0];

    var r = new FileReader();
    r.onload = function(e) {
        var contents = e.target.result;
        server.createAppFromFile(file.name, contents);
    }
    r.readAsText(file);
}

jt.closeFocussedPanel = function() {
    jt.closePanel($('.focussed-panel'));
}

jt.isMenuFocussed = function() {
    return $('#jt-menu').hasClass('menubar-focussed')
}

jt.focusMenuButton = function(el) {
    jt.selMenu = $(el)[0];
    $(el).addClass('menu-focussed');
    jt.selMenu.focus();
    $('#jt-menu').addClass('menubar-focussed');
}

jt.openMenuName = function(x) {
    $('#menu-' + x).click();
}

jt.vueData = {
    apps: {}
}

jt.vue = new Vue({
    data: jt.vueData,
    render: h => h(App),
}).$mount(`#app`);