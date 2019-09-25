class MainMenu extends HTMLElement {

    connectedCallback() {
      this.innerHTML = `
      <nav style='padding-left: 3rem; padding-right: 3rem; margin-bottom: 1rem;' class="navbar navbar-expand-sm navbar-dark bg-secondary">
          <span id='tab-home' class="navbar-brand view-tab" onclick='setView("home")' style='padding-left: 0.5rem; padding-right: 0.5rem; cursor: pointer;'>jtree</span>
          <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent">
              <span class="navbar-toggler-icon"></span>
          </button>

          <div class="collapse navbar-collapse" id="navbarSupportedContent">
              <ul class="navbar-nav mr-auto" role='tabpanel'>
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
                          Sessions
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

let jt = (jt==null) ? {} : jt;

jt.setAppView = function(a) {
    jt.setSubView('app', a);
}

window.setView = function(a) {
    window.$('.view').addClass('hidden');
    window.$('#view-' + a).removeClass('hidden');
    window.$('.view-tab').removeClass('active');
    window.$('.view-tab').removeClass('active-top-menu');
    window.$('#tab-' + a).addClass('active');
    window.$('#tab-' + a).addClass('active-top-menu');
    jt.setAppView('view');
}

window.customElements.define('main-menu', MainMenu);
