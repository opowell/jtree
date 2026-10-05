# Shared browser libraries

Served at `/shared/` (under jtree's route, e.g. `/jtree/shared/`). Experiment
apps load these by file name, so files are never renamed or removed: a newer
version is added next to the old one.

| File | Version | Notes |
| --- | --- | --- |
| `jquery-3.7.1.min.js` | jQuery 3.7.1 | Used by the participant page (`participant/jtree.js`) |
| `jquery-migrate-3.6.0.min.js` | jQuery Migrate 3.6.0 | Loaded after jQuery 3, keeps code written for jQuery 1.x working |
| `vue-2.7.16.js`, `vue-2.7.16.min.js` | Vue 2.7.16 (final Vue 2 release) | Used by the participant page; development build, for template warnings |
| `vue-3.5.43/` | Vue 3.5.43 (ES module builds) | Used by the admin interfaces (admin/v2, admin/ztree) |
| `vue3-sfc-loader-0.9.5/` | vue3-sfc-loader 0.9.5 | Compiles the admin interfaces' `.vue` and `.ts` files in the browser |
| `header-content-layout-0.43.0/` | appfr 0.43.0 | Menu bar, windows and data shell of the admin interfaces (admin/v2, admin/ztree) |
| `acorn-8.18.0/` | acorn 8.18.0 | JavaScript parser; admin/ztree reads apps' source with it |
| `circular-json-0.5.9.min.js` | circular-json 0.5.9 | Reads the circular data the server sends admins |
| `jquery-1.11.1.js` | jQuery 1.11.1 | Old; kept for apps that load it themselves |
| `vue.js` | Vue 2.5.17 | Old; kept for apps that load it themselves |
| `vuex.js` | Vuex 3.0.1 | |
| `bootstrap.min.js`, `bootstrap.min.css` | Bootstrap 4.0.0 | Needs `popper.min.js` and jQuery |
| `jquery-ui.js`, `jquery-ui.css` | jQuery UI 1.12.1 | |
| `Chart.min.js`, `chartjs/` | Chart.js 2.7 | |
| `axios.min.js` | axios 0.18.0 | |

Apps written for jtree's participant page should use `$` and Vue as the page
provides them, rather than loading their own copies.
