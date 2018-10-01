jt.Modal_SelectApp = function() {
    var div = $(`<div class="modal" id="selectAppModal" tabindex="-1" role="dialog">
              <div class="modal-dialog" role="document" style='max-width: 90%;'>
                  <div class="modal-content">
                      <div class="modal-header">
                          <h5 class="modal-title">Select App</h5>
                          <button type="button" class="close" data-dismiss="modal">
                              <span>&times;</span>
                          </button>
                      </div>
                      <div class="modal-body">
                          <table class='table table-hover'>
                              <thead>
                                  <tr>
                                      <th>id</th>
                                      <th>path</th>
                                      <th>description</th>
                                  </tr>
                              </thead>
                              <tbody id='apps'>
                              </tbody>
                          </table>
                      </div>
                      <div class="modal-footer">
                          <button type="button" class="btn btn-outline-primary" data-dismiss="modal">Close</button>
                      </div>
                  </div>
              </div>
          </div>
    `);
    return div;
};

// To only be called once.
jt.Modal_SelectApp_init = function() {
    var sam = jt.Modal_SelectApp();
    $('body').append(sam);
}

jt.showSelectAppModal = function(title, onSelect, appMetadatas) {
    var sam = $('#selectAppModal');
    sam.find('.modal-title').text(title);
    sam.find('#apps').empty();
    for (var i in appMetadatas) {
        var app = appMetadatas[i];
        var row = jt.Item_AppRow(app, {}, ['id', 'path', 'description']);
        row.data('appPath', app.appPath);
        row.click(function(ev) {
            if (
                ($(ev.target).prop('tagName') !== 'SELECT') &&
                ($(ev.target).prop('tagName') !== 'INPUT')
            ) {
                var boundFN = onSelect.bind($(ev.target).closest('tr'));
                boundFN();
                $('#selectAppModal').modal('hide');
            }
        });
        row.css('cursor', 'pointer');
        sam.find('#apps').append(row);
    }
    sam.modal('show');
};

jt.showOpenTreatmentModal = function(apps) {
    var openAppFn = function() {
        var optionEls = $(this).find('[app-option-name]');
        var options = jt.deriveAppOptions(optionEls);
        jt.socket.emit("getApp", {appPath: $(this).data('appPath'), cb: "jt.openTreatment(message.app)"});
    };
    jt.showSelectAppModal('Open Treatment', openAppFn, apps);
};
