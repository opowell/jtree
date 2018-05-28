class ViewHome extends HTMLElement {
    connectedCallback() {
      this.innerHTML = `
      <div id='view-home' class='view hidden'>
          Welcome to jtree.
      </div>
      `;
    }
}

window.customElements.define('view-home', ViewHome);
