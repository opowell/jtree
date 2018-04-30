jt.selectAppModal = function() {
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
}

jt.showSelectAppModal = function(title, onSelect) {
    $('#selectAppModal .modal-title').text(title);
    $('#selectAppModal').modal('show');
    $('#selectAppModal #apps').empty();
    for (var i in jt.data.appInfos) {
        var app = jt.data.appInfos[i];
        var row = jt.AppRow(app, {}, ['id', 'description']);
        row.data('appId', app.id);

        row.click(function(ev) {
            if (
                ($(ev.target).prop('tagName') !== 'SELECT') &&
                ($(ev.target).prop('tagName') !== 'INPUT')
            ) {
                onSelect();
                $('#addAppToSessionModal').modal('hide');
            }
        });
        row.css('cursor', 'pointer');

        $('#selectAppModal #apps').append(row);
    }
}
