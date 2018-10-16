class ViewSettings extends HTMLElement {
    connectedCallback() {
      this.innerHTML = `
      <div id='view-settings' class='view hidden'>
          <h2>Settings</h2>

          <h5>Server</h5>
          <div>These settings affect all users. They are stored in jtree.path/internal/settings.js</div>
          <h6 class='mt-3 mb-2'>Administrator password</h6>
          <small class="form-text text-muted">If set, allows for logging in as default administrator.</small>
          <div class="form-check mt-3 mb-3">
            <input class="form-control" style='max-width: 20rem;' type="text" id="settings-curAdminPwd" placeholder='Current password'>
            <input class="form-control" style='max-width: 20rem;' type="text" id="settings-newAdminPwd" placeholder='New  password'>
                <button class="btn btn-primary btn-sm" onclick='jt.setDefaultAdminPwd()'>Set</button>
          </div>
          <h6 class='mt-3 mb-2'>Rooms</h6>
          <div class="form-check mt-3">
            <input class="form-check-input" type="radio" name="settings-rooms" id="rooms-mode-off" onchange='jt.setRoomsMode("off");'>
            <label class="form-check-label" for="rooms-mode-off">
                Off
            </label>
          </div>
          <div class="form-check mt-3">
            <input class="form-check-input" type="radio" name="settings-rooms" id="rooms-mode-on" onchange='jt.setRoomsMode("on");'>
            <label class="form-check-label" for="rooms-mode-on">
                On
            </label>
          </div>

          <h6 class='mt-3 mb-2'>Users</h6>
          <div class="form-check mt-3">
            <span class="form-check">
            <input class="form-check-input" type="radio" name="settings-users" id="users-mode-false" onchange='jt.setUsersMode(false);'>
            <label class="form-check-label" for="users-mode-false">
                Off
            </label>
            </span>
            <span class="form-check">
      <input class="form-check-input" type="radio" name="settings-users" id="users-mode-true" onchange='jt.setUsersMode(true);'>
            <label class="form-check-label" for="users-mode-true">
            On
            </label>
</span>
          </div>

          <h5 class='mt-3'>Personal</h5>
          <div>These settings only affect the users of this computer. They are stored in the browser.</div>

          <h6 class='mt-3 mb-2'>Interface mode</h6>
          <div class="form-check mt-3">
            <input class="form-check-input" type="radio" name="admin-interface" id="admin-interface-basic" value="basic" onchange='jt.setInterfaceMode("basic");'>
            <label class="form-check-label" for="admin-interface-basic">
                Single user
            </label>
            <small class="form-text text-muted">The default configuration.</small>
          </div>
          <div class="form-check mt-3">
            <input class="form-check-input" type="radio" name="admin-interface" id="admin-interface-advanced" value="advanced" onchange='jt.setInterfaceMode("advanced");'>
            <label class="form-check-label" for="admin-interface-advanced">
                Multiple users
            </label>
            <small class="form-text text-muted">For use on shared servers and lab facilities. Allows Rooms and/or Users.</small>
          </div>

          <h6 class='mt-3 mb-2'>Content folders</h6>
          <div>jtree.path/apps</div>
          <div>jtree.path/sessions</div>

      </div>
      `;
    }
}

jt.setDefaultAdminPwd = function() {
    var curPwd = $('#settings-curAdminPwd').val();
    var newPwd = $('#settings-newAdminPwd').val();
    jt.socket.emit('setDefaultAdminPwd', {curPwd: curPwd, newPwd: newPwd});
}

jt.setInterfaceMode = function(mode) {
    jt.interfaceMode = mode;
    localStorage.setItem('interfaceMode', mode);
    if (mode === 'basic') {
        $('#admin-interface-basic').prop('checked', true);
    }
    else if (mode === 'advanced') {
        $('#admin-interface-advanced').prop('checked', true);
    }
    $('[admin-interface][admin-interface="' + mode + '"]').show();
    $('[admin-interface][admin-interface!="' + mode + '"]').hide();
}

jt.setUsersMode = function(mode) {
    jt.socket.emit('setUsersMode', mode);
    jt.showUsersMode(mode);
}

jt.showUsersMode = function(mode) {
    $('#users-mode-' + mode).prop('checked', true);
    $('#users-mode-' + !mode).prop('checked', false);
    $('[users-mode][users-mode="' + mode + '"]').removeClass('hidden');
    $('[users-mode][users-mode!="' + mode + '"]').addClass('hidden');
    jt.updateLogoutLink();
}

jt.updateLogoutLink = function() {
    if (
        jt.settings.multipleUsers ||
        jt.settings.defaultAdminPwd != null
    ) {
        $('#logoutLink').removeClass('hidden');
    } else {
        $('#logoutLink').addClass('hidden');
    }
}

window.customElements.define('view-settings', ViewSettings);
