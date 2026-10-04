// Where jtree is served (e.g. /jtree), taken from this script's own URL since shared.js,
// which sets jt.basePath, is not loaded yet.
var jtBase = new URL(document.currentScript.src).pathname.replace(/\/participant\/jtree\.js$/, '');
document.write('<script src="' + jtBase + '/socket.io/socket.io.js"></script>');
// jQuery Migrate keeps app code written for jQuery 1.x working, and names in the console what it patched.
document.write('<script src="' + jtBase + '/shared/jquery-3.7.1.min.js"></script>');
document.write('<script src="' + jtBase + '/shared/jquery-migrate-3.6.0.min.js"></script>');
document.write('<script src="' + jtBase + '/shared/shared.js"></script>');
document.write('<script src="' + jtBase + '/shared/utilsFns.js"></script>');
document.write('<script src="' + jtBase + '/shared/jquery.cookie.js"></script>');
// Development build, so mistakes in stage templates show up as console warnings.
document.write('<script src="' + jtBase + '/shared/vue-2.7.16.js"></script>');
document.write('<script src="' + jtBase + '/shared/circularjson.js"></script>');
document.write('<script src="' + jtBase + '/participant/defaultClient.js"></script>');
document.write('<link rel="stylesheet" href="' + jtBase + '/shared/popups.css">');
document.write('<link rel="stylesheet" href="' + jtBase + '/participant/simple.css">');
