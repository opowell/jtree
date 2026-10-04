class ViewHome extends HTMLElement {
    connectedCallback() {
      this.innerHTML = `
      <div id='view-home' class='view'>
          Welcome to jtree.
          <br><a href='${jt.basePath}/admin/'>New admin interface</a>
      </div>
      `;
    }
}

window.customElements.define('view-home', ViewHome);
