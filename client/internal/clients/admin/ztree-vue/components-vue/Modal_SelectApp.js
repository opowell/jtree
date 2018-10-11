export default {
    name: 'SelectAppModal',
    props: [
      'apps'
    ],
    template: `
    <div class="modal" id="selectAppModal" tabindex="-1" role="dialog">
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
                        <tbody>
                            <app-row v-for='app in apps' :app='app' :key='app.id'></app-row>
                        </tbody>
                    </table>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-outline-primary" data-dismiss="modal">Close</button>
                </div>
            </div>
        </div>
    </div>
      `
  };

window.jt.showSelectAppModal = function(title, onSelect, appMetadatas) {
    var sam = $('#selectAppModal');
    sam.find('.modal-title').text(title);
    jt.vue.apps = appMetadatas;
    sam.modal('show');
};

window.jt.showOpenTreatmentModal = function(apps) {
    var openAppFn = function() {
        var optionEls = $(this).find('[app-option-name]');
        var options = jt.deriveAppOptions(optionEls);
        jt.socket.emit("getApp", {appPath: $(this).data('appPath'), cb: "jt.openTreatment(message.app)"});
    };
    jt.showSelectAppModal('Open Treatment', openAppFn, apps);
};
