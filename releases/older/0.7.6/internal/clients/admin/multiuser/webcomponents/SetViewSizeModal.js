class SetViewSizeModal extends HTMLElement {
    connectedCallback() {
      this.innerHTML = `
      <div class="modal" id="setViewSizeModal" tabindex="-1" role="dialog">
          <div class="modal-dialog" role="document" style='max-width: 400px;'>
              <div class="modal-content">
                  <div class="modal-header">
                      <h5 class="modal-title" id="exampleModalLabel">Set view size</h5>
                      <button type="button" class="close" data-dismiss="modal">
                          <span>&times;</span>
                      </button>
                  </div>
                  <div class="modal-body">
                      <div>
                          Width:
                          <input id='setViewSize-Width' style='width: 3em;' type='number' min='0' step='1'>
                      </div>
                      <br>
                      <div>
                          Height:
                          <input id='setViewSize-Height' style='width: 3em;' type='number' min='0' step='1'>
                      </div>
                      <br>
                      <button type="button" class="btn btn-primary" data-dismiss="modal" onclick='jt.updateViewSize();'>Set</button>
                      <hr>
                      <br>
                      <button type="button" class="btn btn-outline-primary" data-dismiss="modal" onclick='jt.setViewSizeFullWidth();'>Full width</button>
                      <button type="button" class="btn btn-outline-primary" data-dismiss="modal" onclick='jt.setViewSizeTiled();'>Tiled</button>
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

jt.setViewSize = function() {
    $('#setViewSize-Width').val($($('.participant-view')[0]).width());
    $('#setViewSize-Height').val($($('.participant-view')[0]).height());
    $('#setViewSizeModal').modal('show');
}

jt.updateViewSize = function() {
    $('.participant-view').width($('#setViewSize-Width').val());
    $('.participant-view').height($('#setViewSize-Height').val());
}

jt.setViewSizeFullWidth = function() {
    var width = $('#views').width();
    var height = $(window).height();
    $('.participant-view').width(width);
    $('.participant-view').height(height);
}

window.customElements.define('setviewsize-modal', SetViewSizeModal);
