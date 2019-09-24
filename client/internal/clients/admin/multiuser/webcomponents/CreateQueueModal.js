class CreateQueueModal extends HTMLElement {
    connectedCallback() {
      this.innerHTML = `
      <div class="modal" id="createQueueModal" tabindex="-1" role="dialog">
          <div class="modal-dialog" role="document" style='max-width: 400px;'>
              <div class="modal-content">
                  <div class="modal-header">
                      <h5 class="modal-title">Create Queue</h5>
                      <button type="button" class="close" data-dismiss="modal">
                          <span>&times;</span>
                      </button>
                  </div>
                  <div class="modal-body">
                      Enter name for new queue:<br> <input name='fjeiwofewafioewajf' type="text" class="form-control mt-2" placeholder="Name" id='create-queue-input' style='flex: 0 0 150px'>
                  </div>
                  <div class="modal-footer">
                      <button type="button" class="btn btn-sm btn-outline-primary" onclick='jt.createQueue();'>Create</button>
                  </div>
              </div>
          </div>
      </div>
      `;
      $('#create-queue-input').keyup(function(event) {
        // Number 13 is the "Enter" key on the keyboard
        if (event.keyCode === 13) {
          // Cancel the default action, if needed
          event.preventDefault();
          // Trigger the button element with a click
            jt.createQueue();
        }
      });    
    }
}

window.customElements.define('createqueue-modal', CreateQueueModal);

jt.createQueue = function() {
    var appId = $('#create-queue-input').val();
    if (!appId.includes('.')) {
        appId = appId + '.jtq';
    }
    server.createQueue(appId);
    $("#createQueueModal").modal("hide");
}