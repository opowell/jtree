<template>
      <nav style='padding-left: 3rem; padding-right: 3rem; margin-bottom: 2rem;' class="navbar navbar-expand-lg navbar-dark bg-secondary">
          <router-link to='/' id='tab-home' class="navbar-brand view-tab" style='padding-left: 0.5rem; padding-right: 0.5rem; cursor: pointer;'>jtree</router-link>
          <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent">
              <span class="navbar-toggler-icon"></span>
          </button>

          <div class="collapse navbar-collapse" id="navbarSupportedContent">
              <ul class="navbar-nav mr-auto hidden" role='tabpanel'>
                  <li class="nav-item">
                      <router-link to='/apps' id='tab-apps' class="nav-link view-tab">
                          Apps
                      </router-link>
                  </li>
                  <li class="nav-item">
                      <router-link to='/queues' id='tab-queues' class="nav-link view-tab">
                          Queues
                      </router-link>
                  </li>
                  <li class="nav-item">
                      <router-link to='/sessions' id='tab-sessions' class="nav-link view-tab">
                          Sessions
                      </router-link>
                  </li>
                  <li class="nav-item" admin-interface='advanced'>
                      <span id='tab-rooms' class="nav-link view-tab" onclick='setView("rooms")'>
                          Rooms
                      </span>
                  </li>
                  <li class="nav-item" users-mode=true>
                      <span id='tab-users' class="nav-link view-tab" onclick='setView("users")'>
                          Users
                      </span>
                  </li>
                  <li class="nav-item" admin-interface='advanced'>
                      <span id='tab-usertypes' class="nav-link view-tab" onclick='setView("userTypes")'>
                          User types
                      </span>
                  </li>
                  <li class="nav-item">
                      <span id='tab-settings' class="nav-link view-tab" onclick='setView("settings")'>
                          Settings
                      </span>
                  </li>
                  <li class="nav-item">
                      <a class="nav-link" href="/help/index.html" target='_blank'>
                          Help
                      </a>
                  </li>
              </ul>
              <ul class="navbar-nav hidden" role='tabpanel'>
                  <li users-mode=true >
                      <span id='menu-userid' class="nav-link">
                          userid
                      </span>
                  </li>
                  <li id='logoutLink' class="nav-item" >
                      <a href='/users/logout' class="nav-link">
                          Logout
                      </a>
                  </li>
              </ul>
          </div>
      </nav>
</template>

<script>
import jQuery from 'jquery';

export default {
  name: 'MainMenu',
  computed: {
    view() {
      return this.$
    }
  }
}

window.jt.setAppView = function(a) {
    window.jt.setSubView('app', a);
}

window.setView = function(a) {
    jQuery('.view').addClass('hidden');
    jQuery('#view-' + a).removeClass('hidden');
    jQuery('.view-tab').removeClass('active');
    jQuery('.view-tab').removeClass('active-top-menu');
    jQuery('#tab-' + a).addClass('active');
    jQuery('#tab-' + a).addClass('active-top-menu');
    window.jt.setAppView('view');
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
.router-link-exact-active {
  border-bottom: 2px solid #fb8252 !important;
  color: #42b983;
}

</style>
