class ViewSessionTabs extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
        <!-- SESSION TABS -->
        <ul class="nav nav-tabs">
            <li class="nav-item">
                <div id='tab-session-general' class="nav-link subview-tab session-tabBtn" onclick='jt.setSessionView("general");'>
                    <i class="fa fa-wrench"></i>&nbsp;&nbsp;Settings
                </div>
            </li>
            <li class="nav-item">
                <div id='tab-session-appqueue' class="nav-link subview-tab session-tabBtn" onclick='jt.setSessionView("appqueue");'>
                    <i class="fa fa-list-ol"></i>&nbsp;&nbsp;Apps
                </div>
            </li>
            <li class="nav-item">
                <div id='tab-session-participants' class="nav-link subview-tab session-tabBtn" onclick='jt.setSessionView("participants");'>
                    <i class="fa fa-user"></i>&nbsp;&nbsp;Participants (<span id='tabSessionParticipantsNumber'>0</span>)
                </div>
            </li>
            <li class="nav-item">
                <span id='tab-session-activity' class='nav-link subview-tab session-tabBtn' onclick='jt.setSessionView("activity");'>
                    <i class="fa fa-eye"></i>&nbsp;&nbsp;Monitor
                </span>
            </li>
            <li class="nav-item" hidden>
                <span id='tab-session-results' class='nav-link subview-tab session-tabBtn' onclick='jt.setSessionView("results");'>
                    <i class="fa fa-chart-bar"></i>&nbsp;&nbsp;Data
                </span>
            </li>
            <li class="nav-item" users-mode=true>
                <span id='tab-session-users' class='nav-link subview-tab session-tabBtn' onclick='jt.setSessionView("users");'>
                    <i class="fa fa-address-card"></i>&nbsp;&nbsp;Users
                </span>
            </li>
        </ul>
    `;
    }
}

window.customElements.define('view-session-tabs', ViewSessionTabs);
