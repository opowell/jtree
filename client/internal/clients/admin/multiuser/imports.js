// Where jtree is served (e.g. /jtree), taken from this script's own URL since shared.js,
// which sets jt.basePath, is not loaded yet.
var jtBase = new URL(document.currentScript.src).pathname.replace(/\/admin\/multiuser\/imports\.js$/, '');
// EXTERNAL LIBRARIES
document.write('<script src="' + jtBase + '/socket.io/socket.io.js"></script>');
document.write('<script src="' + jtBase + '/shared/HackTimer.min.js"></script>');
document.write('<script src="' + jtBase + '/shared/HackTimerWorker.min.js"></script>');
document.write('<script src="' + jtBase + '/shared/jquery-1.11.1.js"></script>');
document.write('<script src="' + jtBase + '/shared/tether.min.js"></script>');
document.write('<script src="' + jtBase + '/shared/popper.min.js"></script>'); // For dropdowns, must be before bootstrap.js
document.write('<script src="' + jtBase + '/shared/bootstrap.min.js"></script>');
document.write('<script src="' + jtBase + '/shared/jquery-ui.js"></script>');
document.write('<script src="' + jtBase + '/shared/object_hash.js"></script>');
document.write('<script src="' + jtBase + '/shared/chartjs/Chart.bundle.min.js"></script>');
document.write('<script src="' + jtBase + '/shared/ace/ace2.js" type="text/javascript" charset="utf-8"></script>');
document.write('<script src="' + jtBase + '/shared/js.cookie.js"></script>');
document.write('<script src="' + jtBase + '/shared/vue.js"></script>');
document.write('<script src="' + jtBase + '/shared/webcomponents-bundle.js"></script>');
document.write('<script src="' + jtBase + '/shared/polyfill.min.js"></script>');
document.write('<script src="' + jtBase + '/shared/bootstrap-vue.js"></script>');

// INTERNAL LIBRARIES
document.write('<script src="' + jtBase + '/shared/shared.js"></script>');
document.write('<script src="' + jtBase + '/shared/utilsFns.js"></script>');
document.write('<script src="' + jtBase + '/admin/multiuser/utilities.js"></script>');
document.write('<script src="' + jtBase + '/admin/multiuser/admin.js"></script>');
document.write('<script src="' + jtBase + '/admin/multiuser/msgsFromServer.js"></script>');
document.write('<script src="' + jtBase + '/admin/multiuser/msgsToServer.js"></script>');

// INTERNAL COMPONENTS
document.write('<script src="' + jtBase + '/admin/multiuser/webcomponents/ViewAppEditModal.js"></script>');
document.write('<script src="' + jtBase + '/admin/multiuser/webcomponents/CreateAppModal.js"></script>');
document.write('<script src="' + jtBase + '/admin/multiuser/webcomponents/CreateRoomModal.js"></script>');
document.write('<script src="' + jtBase + '/admin/multiuser/webcomponents/CreateUserModal.js"></script>');
document.write('<script src="' + jtBase + '/admin/multiuser/webcomponents/AddAppToQueueModal.js"></script>');
document.write('<script src="' + jtBase + '/admin/multiuser/webcomponents/AddAppToRoomModal.js"></script>');
document.write('<script src="' + jtBase + '/admin/multiuser/webcomponents/AddAppToSessionModal.js"></script>');
document.write('<script src="' + jtBase + '/admin/multiuser/webcomponents/AddUserToSessionModal.js"></script>');
document.write('<script src="' + jtBase + '/admin/multiuser/webcomponents/AddQueueToSessionModal.js"></script>');
document.write('<script src="' + jtBase + '/admin/multiuser/webcomponents/EditAppOptionsModal.js"></script>');
document.write('<script src="' + jtBase + '/admin/multiuser/Model.js"></script>');
document.write('<script src="' + jtBase + '/admin/multiuser/View.js"></script>');

document.write('<script src="' + jtBase + '/admin/multiuser/webcomponents/Button.js"></script>');
document.write('<script src="' + jtBase + '/admin/multiuser/webcomponents/MainMenu.js"></script>');
document.write('<script src="' + jtBase + '/admin/multiuser/webcomponents/RenameAppModal.js"></script>');
document.write('<script src="' + jtBase + '/admin/multiuser/webcomponents/SetViewSizeModal.js"></script>');
document.write('<script src="' + jtBase + '/admin/multiuser/webcomponents/ToggleSwitch.js"></script>');
document.write('<script src="' + jtBase + '/admin/multiuser/webcomponents/ViewApp.js"></script>');
document.write('<script src="' + jtBase + '/admin/multiuser/webcomponents/ViewApps.js"></script>');
document.write('<script src="' + jtBase + '/admin/multiuser/webcomponents/ViewHome.js"></script>');
document.write('<script src="' + jtBase + '/admin/multiuser/webcomponents/ViewLogin.js"></script>');
document.write('<script src="' + jtBase + '/admin/multiuser/webcomponents/ViewQueue.js"></script>');
document.write('<script src="' + jtBase + '/admin/multiuser/webcomponents/ViewQueues.js"></script>');
document.write('<script src="' + jtBase + '/admin/multiuser/webcomponents/ViewRoom.js"></script>');
document.write('<script src="' + jtBase + '/admin/multiuser/webcomponents/ViewRooms.js"></script>');
document.write('<script src="' + jtBase + '/admin/multiuser/webcomponents/ViewSession.js"></script>');
document.write('<script src="' + jtBase + '/admin/multiuser/webcomponents/ViewSessions.js"></script>');
document.write('<script src="' + jtBase + '/admin/multiuser/webcomponents/ViewSettings.js"></script>');
document.write('<script src="' + jtBase + '/admin/multiuser/webcomponents/ViewUsers.js"></script>');

document.write('<script src="' + jtBase + '/shared/circularjson.js"></script>');
