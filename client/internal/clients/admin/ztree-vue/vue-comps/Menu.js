Vue.component('jt-menu', {
    template: `
    <div class="v-menu" :id="data.id">
        <div class="v-menu-text" tabindex="-1">
            <i class="fa fa-align-center"></i>
        </div>
        <div class="v-menu-dropdown">
            <menu-item v-for='(item, key) in data.children' :item="item" :key="key"></menu-item>
        </div>
    </div>
    `,
    props: ['data'],
    mounted: function() {
        $(this.$el).click(function(ev) {
            ev.stopPropagation();
            var menu = $(ev.target).closest('.v-menu');
            if (menu.hasClass('show')) {
                window.jt.VcloseMenu();
            } else {
                window.jt.VopenMenu(menu);
            }
        });
    }
})

$(document).click(function() {
    jt.VcloseMenu();
})

jt.VopenMenu = function(el) {
    jt.VcloseMenu();
    $(el).addClass('show');
    var menuEl = $(el).find('.v-menu-text');
    jt.selMenu = menuEl[0];
    menuEl.addClass('v-menu-focussed');
    menuEl.focus();
    var dropdown = $(el).find('.v-menu-dropdown')[0];
    $(dropdown).addClass('show');
}

jt.VcloseMenu = function() {
    $('.v-menu').removeClass('show');
    $('.v-menu-dropdown').removeClass('show');
    $('.v-menu-focussed').removeClass('v-menu-focussed');
    jt.selMenu = null;
    if ($(document.activeElement).closest('.v-menu').length > 0) {
        document.activeElement.blur();
    }
    $('#jt-menu').removeClass('menubar-focussed');
}
