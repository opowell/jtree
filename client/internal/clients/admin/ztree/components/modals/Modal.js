jt.Modal = function(id, title) {
    var out = $(`
        <div class="modal" id="${id}-modal">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <div class="modal-title">${title}</div>
                        <div class='modal-close-button'>&times;</div>
                    </div>
                    <div class="modal-body"></div>
                </div>
            </div>
        </div>
    `);


    // <div class="modal-content">
    //   <div class="modal-header">
    //     <span class="close">&times;</span>
    //     <h2>Modal Header</h2>
    //   </div>
    //   <div class="modal-body">
    //     <p>Some text in the Modal Body</p>
    //     <p>Some other text...</p>
    //   </div>
    //   <div class="modal-footer">
    //     <h3>Modal Footer</h3>
    //   </div>
    // </div>

    out.find('.modal-dialog').draggable();

    out.click(function(ev) {
        if ($(ev.target).hasClass('modal')) {
            $(ev.target).find('.modal-dialog').addClass('modal-shine');
            jt.flashModal();
        }
    });

    $('body').append(out);

    return out;

};

jt.modalFlashCount = 0;

jt.flashModal = function() {
    var div = $('.modal.modal-show').find('.modal-dialog');
    if (div.hasClass('modal-shine')) {
        div.removeClass('modal-shine');
    } else {
        div.addClass('modal-shine');
    }
    jt.modalFlashCount++;
    if (jt.modalFlashCount < 13) {
        setTimeout(function() {
            jt.flashModal();
        }, 70);
    } else {
        div.removeClass('modal-shine');
        jt.modalFlashCount = 0;
    }
}

jt.showModal = function(id) {
    $('#' + id + '-modal').addClass('modal-show');
}

jt.closeModal = function() {
    $('.modal.show').removeClass('modal-show');
}
