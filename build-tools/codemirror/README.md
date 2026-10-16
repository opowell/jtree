# CodeMirror for the admins

Builds `client/internal/clients/shared/codemirror-6.43.14/codemirror.js`, the code editor of the
admin interfaces (admin/v2, admin/ztree, admin/otree). They have no build step, so CodeMirror's
packages are bundled here once, into one ES module, and committed.

```bash
cd build-tools/codemirror
npm install
npm run build
```

`entry.js` is what the module exports: `codeEditor(parent, options)`, which makes an editor with
the languages the admins edit (JavaScript, HTML, CSS, Python), and CodeMirror's `EditorView` and
`EditorState` for anything more (tests use `EditorView.findFromDOM`). Its colours come from
`--cm-*` CSS variables, which each admin's `src/components/CodeEditor.vue` sets from its theme,
and its syntax colours follow the page's `color-scheme` through `light-dark()`.

The output folder is named after `@codemirror/view`'s version. To update CodeMirror, change the
versions in `package.json`, build (into a new folder), and change the path in the three admins'
`index.html` import maps and in `server/test/editors-browser.test.js`. Files in `shared/` are
never removed (`shared/README.md`).
