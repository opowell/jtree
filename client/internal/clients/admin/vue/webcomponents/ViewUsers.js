class ViewUsers extends HTMLElement {
    connectedCallback() {
      this.innerHTML = `
      <div id='view-users' class='view hidden'>
          <h2>Users</h2>
          <div class="mb-3">
            <a href='#' class='btn btn-outline-primary btn-sm' onclick='jt.showCreateUserModal();'>
                <i class="fa fa-plus"></i>&nbsp;&nbsp;create...
            </a>
          </div>
          <table class="table table-hover">
            <thead>
              <tr>
                <th>type</th>
                <th>id</th>
              </tr>
            </thead>
            <tbody id='users-list'>
            </tbody>
          </table>

      </div>
      `;
    }
}

function showUsers() {
    $('#users-list').empty();
    for (var i in jt.data.users) {
        var user = jt.data.users[i];
        showUser(user);
    }
}

function showUser(user) {
    var userRow = jt.UserRow(user, ['type', 'id']);
    userRow.click(function() {
        openUser(user);
    });
    $('#users-list').append(userRow);
}

window.customElements.define('view-users', ViewUsers);
