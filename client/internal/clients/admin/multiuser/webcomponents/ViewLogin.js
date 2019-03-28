class ViewLogin extends HTMLElement {
    connectedCallback() {
      this.innerHTML = `
      <div id='view-login' class='view hidden' style='width: 10rem;'>
          <h2>Login</h2>
          <input type="text" class="form-control mt-3" id="login-uId" placeholder="Username">
          <input type="password" class="form-control mt-3" id="login-pwd" placeholder="Password">
             <button type="button" class="btn btn-primary mt-3">Login</button>
      </div>
      `;
    }
}

window.customElements.define('view-login', ViewLogin);
