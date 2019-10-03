<template>
    <div class="modal" id="confirmModal" tabindex="-1" role="dialog">
        <div class="modal-dialog" role="document" style='max-width: 30rem;'>
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="exampleModalLabel">Are you sure?</h5>
                    <button type="button" class="close" data-dismiss="modal">
                        <span>&times;</span>
                    </button>
                </div>
                <div class="modal-body" id='confirmQuestion'>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-outline-success" data-dismiss="modal" id='confirmYesBtn'>
                        <i class="fa fa-check"></i>&nbsp;&nbsp;Yes
                    </button>
                    <button type="button" class="btn btn-outline-secondary" data-dismiss="modal">
                        <i class="fa fa-times"></i>&nbsp;&nbsp;No
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>

export default {
  name: 'ConfirmModal',
}

</script>