<template>
      <div class="modal" id="setViewSizeModal" tabindex="-1" role="dialog">
          <div class="modal-dialog" role="document" style='max-width: 400px;'>
              <div class="modal-content">
                  <div class="modal-header">
                      <h5 class="modal-title" id="exampleModalLabel">Set view size</h5>
                      <button type="button" class="close" data-dismiss="modal">
                          <span>&times;</span>
                      </button>
                  </div>
                  <div class="modal-body">
                      <div>
                          Width:
                          <input id='setViewSize-Width' style='width: 3em;' :value='state.viewsWidth' type='number' min='0' step='1'>
                      </div>
                      <br>
                      <div>
                          Height:
                          <input id='setViewSize-Height' style='width: 3em;' :value='state.viewsHeight' type='number' min='0' step='1'>
                      </div>
                      <br>
                      <div>
                          Stretch:
                          <input id='setViewSize-Stretch' type='checkbox' :checked='state.stretchViews'>
                      </div>
                      <br>
                      <button type="button" class="btn btn-primary" data-dismiss="modal" onclick='jt.updateViewSize();'>Set</button>
                      <hr>
                      <br>
                      <button type="button" class="btn btn-outline-primary" data-dismiss="modal" onclick='jt.setViewSizeFullWidth();'>Full width</button>
                      <button type="button" class="btn btn-outline-primary" data-dismiss="modal" onclick='jt.setViewSizeTiled();'>Tiled</button>
                  </div>
                  <div class="modal-footer">
                      <button type="button" class="btn btn-outline-primary" data-dismiss="modal">Close</button>
                  </div>
              </div>
          </div>
      </div>
</template>

<script>
import jt from '@/webcomps/jtree.js'
import 'jquery'
let $ = window.jQuery
import store from '@/store.js'

export default {
  name: 'SetViewSize',
  data() {
    return {
        state: this.$store.state
    }
  },
}

jt.setViewSize = function() {
    // $('#setViewSize-Width').val($($('.participant-view')[0]).width());
    // $('#setViewSize-Height').val($($('.participant-view')[0]).height());
    $('#setViewSizeModal').modal('show');
}

jt.updateViewSize = function() {
    let width = $('#setViewSize-Width').val();
    let height = $('#setViewSize-Height').val();
    let stretch = $('#setViewSize-Stretch').prop('checked');
    store.commit('setValue', {path: 'stretchViews'  , value: stretch});
    store.commit('setValue', {path: 'viewsHeight'   , value: height});
    store.commit('setValue', {path: 'viewsWidth'    , value: width});
}

jt.setViewSizeFullWidth = function() {
    var width = $('#views').width();
    var height = $(window).height();
    $('.participant-view').width(width);
    $('.participant-view').height(height);
}

</script>