class ViewSessionControls extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
        <!-- SESSION CONTROLS -->
        <div class='btn-group mb-3'>
            <span class='btn btn-outline-primary btn-sm' onclick='server.sessionStart();'>
                <i class="fa fa-play"></i>&nbsp;&nbsp;Start
            </span>
        </div>
        <div class='btn-group mb-3'>
            <span class='btn btn-outline-secondary btn-sm' onclick='server.sessionAdvanceSlowest();'>
                <i class="fa fa-play"></i>&nbsp;&nbsp;Advance slowest
            </span>
            <button class="btn btn-outline-secondary btn-sm" onclick='setView("edit-app")'>
                <i class="fa fa-copy"></i>&nbsp;&nbsp;Duplicate
            </button>
            <button class="btn btn-outline-secondary btn-sm" onclick='jt.deleteSession()'>
                <i class="fa fa-trash"></i>&nbsp;&nbsp;Delete
            </button>
            <button class="btn btn-outline-secondary btn-sm" onclick='server.saveOutput()'>
                <i class="fa fa-save"></i>&nbsp;&nbsp;Save output
            </button>
            <button class="btn btn-outline-secondary btn-sm" onclick='jt.downloadOutput()'>
                <i class="fa fa-download"></i>&nbsp;&nbsp;Download output
            </button>
        </div>
        `;
    }
}

window.customElements.define('view-session-controls', ViewSessionControls);

jt.downloadOutput = function() {
    window.open("/session-download/" + jt.data.session.id, "_blank", "");
}
