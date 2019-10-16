class ViewHome extends HTMLElement {
    connectedCallback() {
      this.innerHTML = `
      <div id='view-home' class='view'>
          Welcome to jtree.
          <div style='padding-top: 1rem; color: #888'>0.8.2.1</div>
      </div>
      `;
    }
}

window.customElements.define('view-home', ViewHome);
