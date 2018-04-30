class ContentWindow extends HTMLElement {
    connectedCallback() {
      this.innerHTML = ``;
    }
}

window.customElements.define('content-window', ContentWindow);
