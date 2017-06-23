/**
 * Created by bgager on 4/14/17.
 */



//create the modal html element
document.write('' +
    '<div class="hidden-elements jpanel-menu-exclude">'+
        '<div id="genericMessageModal" class="modal fade" tabindex="-1" role="dialog">' +
            '<div id="genericMessageModalDialog" class="modal-dialog" >' +
                '<div class="modal-content">' +
                    '<div class="modal-header">' +
                        '<h4 id="genericMessageModalTitle" class="modal-title"></h4>' +
                        '<button type="button" class="close" data-dismiss="modal" aria-label="Close">' +
                        '<span aria-hidden="true">&times;</span>' +
                        '</button>' +
                    '</div>' +
                    '<div class="modal-body">' +
                        '<p id="genericMessageModalMessage">No message was set</p>' +
                    '</div>' +
                    '<div class="modal-footer">' +
                        '<button id="genericMessageModalOKButton" type="button" class="btn btn-primary" data-dismiss="modal">OK</button>' +
                    '</div>' +
                '</div>' +
            '</div>' +
        '</div>'+
    '</div>');




var modalMessage = {

    showMessage: function (options) {

        if (options.title){
            $('#genericMessageModalTitle').html(options.title);
        }

        if(options.message){
            $('#genericMessageModalMessage').html(options.message);
        }

        if (options.buttonName){
            $('#genericMessageModalOKButton').html(options.buttonName);
        }

        if (options.size){
            switch(options.size) {
                case 'large':
                    $('#genericMessageModalDialog').addClass('modal-lg');
                    break;
                case 'small':
                    $('#genericMessageModalDialog').addClass('modal-sm');
                    break;
                default:
                    $('#genericMessageModalDialog').removeClass('modal-lg');
                    $('#genericMessageModalDialog').removeClass('modal-sm');
            }
        }
        else {
            $('#genericMessageModalDialog').removeClass('modal-lg');
            $('#genericMessageModalDialog').removeClass('modal-sm');
        }



        $('#genericMessageModal').modal({backdrop: 'static'});

        $('#genericMessageModal').off('hidden.bs.modal');
        if(options.callback){
            $('#genericMessageModal').on('hidden.bs.modal', function (e) {
                options.callback();
            })
        }



    }

};