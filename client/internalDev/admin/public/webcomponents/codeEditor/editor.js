/**
 * Editor: Holds the editor and its operations
 */
function Editor () {
  // Initialize editor
  this.editor = ace.edit('app-editor', this.mode);
  this.editor.setTheme('ace/theme/tomorrow');

  // Inititalize fileManager
  this.fileManager = new FileManager();
  // Start event listeners
  editorUI.startEventListeners();
}

/**
 * Editor's file operations
 */

Editor.prototype.reset = function() {
    this.fileManager.reset();
    editorUI.reset();
}

Editor.prototype.addFile = function (filename, contents, mode) {
  var self = this;

  var check = this.fileManager.addFile(filename, function () {
    return ace.createEditSession(contents, mode);
  });

  if (check) {
    editorUI.createFile(filename);
    this.selectFile(filename);
  }
};

Editor.prototype.removeFile = function (filename) {
  return this.fileManager.removeFile(filename);
};

Editor.prototype.renameFile = function (oldFilename, newFilename) {
  return this.fileManager.renameFile(oldFilename, newFilename);
};

Editor.prototype.selectFile = function (filename) {
  var session = this.fileManager.selectFile(filename);
  if (session) {
    this.editor.setSession(session);
    editorUI.selectFile(filename);
  }
};
