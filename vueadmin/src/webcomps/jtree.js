import $ from 'jquery'

let jt = {};

jt.setSubView = function(viewName, subViewName) {
    $('.' + viewName + '-tab').addClass('hidden');
    $('#view-' + viewName + '-' + subViewName).removeClass('hidden');
    $('.' + viewName + '-tabBtn').removeClass('active');
    $('#tab-' + viewName + '-' + subViewName).addClass('active');
}

export default jt