class PanelContent extends HTMLElement {
    connectedCallback() {
      this.innerHTML = `
        Panel content
      `;
    }
}

window.customElements.define('panel-content', PanelContent);
