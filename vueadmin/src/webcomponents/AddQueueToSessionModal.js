class addQueueToSessionModal extends HTMLElement {
    connectedCallback() {
      this.innerHTML = `
      <div class="modal" id="addQueueToSessionModal" tabindex="-1" role="dialog">
          <div class="modal-dialog" role="document" style='max-width: 90%;'>
              <div class="modal-content">
                  <div class="modal-header">
                      <h5 class="modal-title">Add Queue to Session</h5>
                      <button type="button" class="close" data-dismiss="modal">
                          <span>&times;</span>
                      </button>
                  </div>
                  <div class="modal-body">
                      <table class='table table-hover'>
                          <thead>
                              <tr>
                                  <th>id</th>
                                  <th>apps</th>
                              </tr>
                          </thead>
                          <tbody id='addQueueToSessionModal-queues'>
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

window.customElements.define('addqueuetosession-modal', addQueueToSessionModal);
