Vue.component('menu-item', {
    template: `

    <div v-if='item === "divider"' class="menuitem-divider"></div>
    
    <div v-else class="v-menuitem" tabindex="-1">
        <div class="menuitem-text">
            <i :class="item.icon"></i>
            <div>{{ item.id }}</div>
        </div>
        <div class="menuitem-shortcut"></div>
        <div class="menuitem-arrow"></div>
    </div>
    `,
    props: ['item']
})