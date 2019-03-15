class ToggleSwitch extends HTMLElement {
    connectedCallback() {
      this.innerHTML = `
          <style>
              .leftedge {
                  width: 5px;
                  border-top-left-radius: 4px;
                  border-bottom-left-radius: 4px;
              }
              .rightedge {
                  width: 5px;
                  border-top-right-radius: 4px;
                  border-bottom-right-radius: 4px;
              }
              .outer {
                  display: flex;
              }
          </style>
        <div class="outer btn-primary">
            <div class="leftedge"></div>
            <div class="onSwitch">On</div>
            <div class="offSwitch">Off</div>
            <div class="rightedge"></div>
        </div>
      `;
    }
}

window.customElements.define('toggle-switch', ToggleSwitch);
