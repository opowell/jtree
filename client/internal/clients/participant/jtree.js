// Where jtree is served (e.g. /jtree), taken from this script's own URL since shared.js,
// which sets jt.basePath, is not loaded yet.
var jtBase = new URL(document.currentScript.src).pathname.replace(/\/participant\/jtree\.js$/, '');
document.write('<script src="' + jtBase + '/socket.io/socket.io.js"></script>');
//document.write('<script src="/shared/HackTimer.min.js"></script>');
//document.write('<script src="/shared/HackTimerWorker.min.js"></script>');
document.write('<script src="' + jtBase + '/shared/jquery-1.11.1.js"></script>');
document.write('<script src="' + jtBase + '/shared/shared.js"></script>');
document.write('<script src="' + jtBase + '/shared/utilsFns.js"></script>');
document.write('<script src="' + jtBase + '/shared/jquery.cookie.js"></script>');
document.write('<script src="' + jtBase + '/shared/vue.js"></script>');
document.write('<script src="' + jtBase + '/shared/circularjson.js"></script>');
document.write('<script src="' + jtBase + '/participant/defaultClient.js"></script>');
document.write('<link rel="stylesheet" href="' + jtBase + '/shared/popups.css">');
document.write('<link rel="stylesheet" href="' + jtBase + '/participant/simple.css">');
