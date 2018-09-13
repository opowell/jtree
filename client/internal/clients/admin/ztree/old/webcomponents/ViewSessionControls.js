class ViewSessionControls extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
        <!-- SESSION CONTROLS -->
        <div class='btn-group mb-3'>
            <span class='btn btn-outline-primary btn-sm' onclick='server.sessionAdvanceSlowest();'>
                <i class="fa fa-play"></i>&nbsp;&nbsp;Start / advance slowest
            </span>
            <button class="btn btn-outline-secondary btn-sm" onclick='setView("edit-app")'>
                <i class="fa fa-copy"></i>&nbsp;&nbsp;Duplicate
            </button>
            <button class="btn btn-outline-secondary btn-sm" onclick='jt.deleteSession()'>
                <i class="fa fa-trash"></i>&nbsp;&nbsp;Delete
            </button>
        </div>
        `;
    }
}

window.customElements.define('view-session-controls', ViewSessionControls);
