class JTButton extends HTMLElement {
    constructor(iconName, title) {
        super();
      this.innerHTML = `
          <button class="btn btn-sm btn-outline-secondary">
              <i class="fa fa-${iconName}" title="${title}"></i>
          </button>
      `;
    }
}

window.customElements.define('jt-button', JTButton);
