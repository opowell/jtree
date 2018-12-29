class addAppToSessionModal extends HTMLElement {
    connectedCallback() {
      this.innerHTML = `
      <div class="modal" id="addAppToSessionModal" tabindex="-1" role="dialog">
          <div class="modal-dialog" role="document" style='max-width: 90%;'>
              <div class="modal-content">
                  <div class="modal-header">
                      <h5 class="modal-title" id="exampleModalLabel">Add App to Session</h5>
                      <button type="button" class="close" data-dismiss="modal">
                          <span>&times;</span>
                      </button>
                  </div>
                  <div class="modal-body">
                      <table class='table table-hover'>
                          <thead>
                              <tr>
                                  <th>id</th>
                                  <th>description</th>
                              </tr>
                          </thead>
                          <tbody id='addAppToSessionModal-apps'>
                          </tbody>
                      </table>
                  </div>
                  <div class="modal-footer">
                      <button type="button" class="btn btn-outline-primary" data-dismiss="modal">Close</button>
                  </div>
              </div>
          </div>
      </div>
      `;
    }
}

window.customElements.define('addapptosession-modal', addAppToSessionModal);

jt.showAddAppToSessionModal = function() {
    $('#addAppToSessionModal').modal('show');
    $('#addAppToSessionModal-apps').empty();
    for (var i in jt.data.appInfos) {
        var app = jt.data.appInfos[i];
        var row = jt.AppRow(app, {}, ['id', 'description']);
        row.data('appId', app.id);

        row.click(function(ev) {
            if (
                ($(ev.target).prop('tagName') !== 'SELECT') &&
                ($(ev.target).prop('tagName') !== 'INPUT')
            ) {
                var optionEls = $(this).find('[app-option-name]');
                var options = jt.deriveAppOptions(optionEls);
                server.sessionAddApp($(this).data('appId'), options);
                $('#addAppToSessionModal').modal('hide');
            }
        });
        row.css('cursor', 'pointer');

        $('#addAppToSessionModal-apps').append(row);
    }
}
