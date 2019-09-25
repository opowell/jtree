<template>
  <div id='view-apps' class='view hidden'>
      <h2>Apps</h2>
      <span style='display: flex;' class='mb-2'>
        <a href='#' class='btn btn-sm btn-outline-secondary btn-sm' onclick='jt.showCreateAppModal();'>
            <i class="fa fa-plus"></i>&nbsp;&nbsp;create...
        </a>
        <a id='reloadAppsBtn' href='#' class='btn btn-sm btn-outline-secondary btn-sm' onclick='jt.reloadApps();'>
            <i class="fas fa-redo-alt"></i>&nbsp;&nbsp;reload
        </a>
      </span>

      <table class='table table-hover' style='width: 100% !important;'>
          <thead>
              <tr>
                  <th></th>
                  <th>id</th>
                  <th>description</th>
              </tr>
          </thead>
          <tbody id='appInfos'>
          </tbody>
      </table>
  </div>
</template>

<script>

import $ from 'jquery'
import jt from '@/webcomps/jtree.js'

export default {
  name: 'ViewHome',
  props: {
    msg: String
  }
}

window.showAppInfos = function() {
    var appInfos = window.jt.data.appInfos;
    jt.enableButton('reloadAppsBtn', '<i class="fas fa-redo-alt"></i>&nbsp;&nbsp;reload');
    $('#appInfos').empty();
    for (var a in appInfos) {
        var app = appInfos[a];
        var row = jt.AppRow(app, {}, ['id', 'description']);
        row.click(function(ev) {
            if (
                ($(ev.target).prop('tagName') !== 'SELECT') &&
                ($(ev.target).prop('tagName') !== 'INPUT') &&
                ($(ev.target).prop('tagName') !== 'A')
            ) {
                jt.openApp($(this).data('appId'));
            }
        });
        row.css('cursor', 'pointer');
        
        row.data('appId', app.id);
        row.attr('appId', app.id);
        
        row.data('appShortId', app.shortId);

        var actionDiv = $('<div class="btn-group">');
        if (app.hasError) {
            var errorMsg = $(`<div style='color: red'>
            <i class="fas fa-exclamation-triangle"></i>&nbsp;&nbsp;Error<br>
            <small style='white-space: normal' class='text-muted'>line ${app.errorLine}, pos ${app.errorPosition}<small>
            </div>`);
            actionDiv.append(errorMsg);    
        } else {
            var createSessionBtn = $(`
            <button class="btn btn-outline-primary btn-sm">
                <i class="fa fa-play" title="start new session with this app"></i>
            </button>`);
    
            createSessionBtn.click(function(ev) {
                ev.stopPropagation();
                var optionEls = $(this).parents('tr').find('[app-option-name]');
                var options = jt.deriveAppOptions(optionEls);
                window.server.createSessionAndAddApp($(this).parents('tr').data('appId'), options);
            });
            actionDiv.append(createSessionBtn);
        }

        row.prepend($('<td>').append(actionDiv));

        $('#appInfos').append(row);
    }
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
