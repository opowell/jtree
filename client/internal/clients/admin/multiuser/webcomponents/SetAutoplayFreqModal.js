class SetAutoplayFreqModal extends HTMLElement {
    connectedCallback() {
      this.innerHTML = `
      <div class="modal" id="setAutoplayFreqModal" tabindex="-1" role="dialog">
          <div class="modal-dialog" role="document" style='max-width: 400px;'>
              <div class="modal-content">
                  <div class="modal-header">
                      <h5 class="modal-title" id="exampleModalLabel">Set autoplay frequency</h5>
                      <button type="button" class="close" data-dismiss="modal">
                          <span>&times;</span>
                      </button>
                  </div>
                  <div class="modal-body">
                      <div>
                          Delay:
                          <input id='setAutoplayFreq-input' style='width: 10em;' value='2000' onkeyup='jt.execIfEnter(event, jt.updateAutoplayFreq)'>
                      </div>
                      <small class="form-text text-muted">An expression that returns the number of milliseconds to wait before autoplaying again.</small>
                  </div>
                  <div class="modal-footer">
                      <button type="button" class="btn btn-outline-primary" data-dismiss="modal">Close</button>
                      <button type="button" class="btn btn-primary" onclick='jt.updateAutoplayFreq();'>Set</button>
                  </div>
              </div>
          </div>
      </div>
      `;
    }
}

jt.showSetAutoplayFreqModal = function() {
    $('#setAutoplayFreqModal').modal('show');
    $('#setAutoplayFreq-input').focus().select();
}

jt.updateAutoplayFreq = function() {
    let d = {};
    d.sId = jt.data.session.id;
    d.val = $('#setAutoplayFreq-input').val();
    jt.socket.emit('setAutoplayDelay', d);
    $('#setAutoplayFreqModal').modal('hide');
}

window.customElements.define('setautoplayfreq-modal', SetAutoplayFreqModal);
