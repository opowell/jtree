class MainMenu extends HTMLElement {

    connectedCallback() {
      this.innerHTML = `
      <nav style='padding-left: 3rem; padding-right: 3rem; margin-bottom: 2rem;' class="navbar navbar-expand-lg navbar-dark bg-secondary">
          <span id='tab-home' class="navbar-brand view-tab" onclick='setView("home")' style='padding-left: 0.5rem; padding-right: 0.5rem; cursor: pointer;'>jtree</span>
          <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent">
              <span class="navbar-toggler-icon"></span>
          </button>

          <div class="collapse navbar-collapse" id="navbarSupportedContent">
              <ul class="navbar-nav mr-auto hidden" role='tabpanel'>
                  <li class="nav-item">
                      <span id='tab-apps' class="nav-link view-tab" onclick='setView("apps")'>
                          Apps
                      </span>
                  </li>
                  <li class="nav-item">
                      <span id='tab-queues' class="nav-link view-tab" onclick='setView("queues")'>
                          Queues
                      </span>
                  </li>
                  <li class="nav-item">
                      <span id='tab-sessions' class="nav-link view-tab" onclick='setView("sessions")'>
                          <!-- <i title="open in new window" class="fa fa-archive"></i>&nbsp;sessions -->
                          Sessions
                      </span>
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
                      <a class="nav-link" href="/help/index.html" target='_blank'>
                          Help
                      </a>
                  </li>
              </ul>
          </div>
      </nav>
      `;
    }
}

jt.setAppView = function(a) {
    jt.setSubView('app', a);
}

setView = function(a) {
    $('.view').addClass('hidden');
    $('#view-' + a).removeClass('hidden');
    $('.view-tab').removeClass('active');
    $('.view-tab').removeClass('active-top-menu');
    $('#tab-' + a).addClass('active');
    $('#tab-' + a).addClass('active-top-menu');
    jt.setAppView('view');
}

window.customElements.define('main-menu', MainMenu);
