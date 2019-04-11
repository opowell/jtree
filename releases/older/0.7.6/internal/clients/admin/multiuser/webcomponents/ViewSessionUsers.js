class ViewSessionUsers extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
        <!-- SESSION - APPS -->
        <div id='view-session-users' class='session-tab hidden'>

            <div class='btn-group mb-3'>
                <button type='button' class='btn btn-outline-primary btn-sm' onclick='jt.showAddUserToSessionModal();'>
                    <i class="fa fa-plus"></i>&nbsp;&nbsp;add...
                </button>
            </div>

            <table class='table table-hover'>
                <thead>
                    <tr>
                        <th></th>
                        <th>user</th>
                    </tr>
                </thead>
                <tbody id='session-users-table'></tbody>
            </table>
        </div>
    `;
    }
}
window.customElements.define('view-session-users', ViewSessionUsers);

jt.updateSessionUsers = function() {
    $('#session-users-table').empty();
    if (jt.data.session !== null && jt.data.session !== undefined) {
        for (var a in jt.data.session.users) {
            var sessionUser = jt.data.session.users[a];
            var div = jt.UserRow({id: sessionUser}, ['id']);

            var actionsDiv = $('<div class="btn-group">');
            var deleteBtn = jt.DeleteButton();
            deleteBtn.click(function(ev) {
                ev.stopPropagation();
                var appIndex = $(ev.target).parents('[appIndex]').attr('appIndex');
                var appId = $(ev.target).parents('[appId]').attr('appId');
                jt.confirm(
                    'Are you sure you want to remove ' + user.username + ' as ' + user.role + ' from Session ' + sId + '?',
                    function() {
                        jt.socket.emit('sessionDeleteUser', {sId: sId, uId: user.username});
                    }
                );
            });
            actionsDiv.append(deleteBtn);
            div.prepend($('<td>').append(actionsDiv));

            $('#session-users-table').append(div);
        }
    }
}
