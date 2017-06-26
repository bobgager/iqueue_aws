/**
 * Created by bgager on 6/18/17.
 */

//create the modal html element
document.write('' +
    '<div class="hidden-elements jpanel-menu-exclude">'+
        '<div id="locationPickerModal" class="modal fade" tabindex="-1" role="dialog">' +
            '<div id="locationPickerModalDialog" class="modal-dialog" >' +
                '<div class="modal-content">' +
                    '<div class="modal-header">' +
                        '<h4 id="locationPickerModalTitle" class="modal-title">Select A Location</h4>' +
                    '</div>' +
                    '<div class="modal-body">' +
                        '<div id="locationsListGroup" class="list-group">' +
                            '<a href="#" class="list-group-item list-group-item-action ">' +
                                '<h4 class="list-group-item-heading">' +
                                'Location 1' +
                                '</h4>' +
                                '<p class="list-group-item-text">Location 1 details</p>' +
                            '</a>' +
                            '<a href="#" class="list-group-item list-group-item-action">' +
                                '<h4 class="list-group-item-heading">' +
                                'Location 2' +
                                '</h4>' +
                                '<p class="list-group-item-text">Location 2 details.</p>' +
                            '</a>' +
                            '<a href="#" class="list-group-item list-group-item-action">' +
                                '<h4 class="list-group-item-heading">' +
                                'Location 3' +
                                '</h4>' +
                                '<p class="list-group-item-text">Location 3 details</p>' +
                            '</a>' +
                        '</div>' +
                    '</div>' +
                    '<div class="modal-footer">' +
                        'nothing in the footer' +
                    '</div>' +
                '</div>' +
            '</div>' +
        '</div>'+
    '</div>');

//**********************************************************************************************************************

var locationManager = {

    callback: null,

    //******************************************************************************************************************
    showLocationPicker: function (callback) {

        locationManager.callback = callback;

        //if there's only one location, just select it.

        if (globals.theLocationsArray.length === 1){
            locationManager.locationSelected(0);
            return
        }

        var locationListGroupHTML = '';

        globals.theLocationsArray.forEach(function (location, index) {

            var textLine1 = '';
            if(location.textLine1 && location.textLine1 !== ' '){
                textLine1 = '<br>' + location.textLine1;
            }
            var textLine2 = '';
            if(location.textLine2 && location.textLine2 !== ' '){
                textLine2 = '<br>' + location.textLine2;
            }

            locationListGroupHTML +=
            '<a href="#" onclick="locationManager.locationSelected('+ index +')" class="list-group-item list-group-item-action " data-dismiss="modal">' +
                '<h4 class="list-group-item-heading">' +
                    location.name +
                '</h4>' +
                '<p class="list-group-item-text">' +
                    location.subName + textLine1 + textLine2 +
                '</p>' +
            '</a>'

        });

        $('#locationsListGroup').html(locationListGroupHTML);

        $('#locationPickerModal').modal({backdrop: 'static'});


    },

    //******************************************************************************************************************
    locationSelected: function (index) {

        //TODO do a page check to see if we're on a page where changing the location would be bad, like while a student is called up
        utils.writeDebug('<span class="text-warning">TODO: Do a page check to see if we are on a page where changing the location would be bad, like while a student is called up. (locationManager.locationSelected)</span>',false);

        globals.theLocation = globals.theLocationsArray[index];

        utils.writeDebug(globals.theLocation.name + ' selected');

        locationManager.callback();

        //tell the page we're on that the location has changed
        if(globals.currentPage){
            switch(globals.currentPage) {
                case 'adminDisplayPage':
                    adminDisplayPage.locationChanged();
                    break;
                case 'dashboardPage':
                    dashboardPage.locationChanged();
                    break;
                default:
                    //code block
            }
        }


    },

    //******************************************************************************************************************
    configureMenu: function () {

        if (globals.theLocationsArray.length === 1){
            $('#locationMenuHeader').hide();
            return;
        }

        var locationMenuHTML = '';
        var menuWidth = 100;

        globals.theLocationsArray.forEach(function (location, index) {

            if (location.name.length * 10 > menuWidth) {
                menuWidth = location.name.length * 10;
            }


            $("#locationMenu").css("min-width", menuWidth + "px");

            if(location.name === globals.theLocation.name){
                locationMenuHTML += '<a href="#" class="dropdown-item active" onclick="locationManager.callback = locationManager.configureMenu; locationManager.locationSelected(' + index + ')"><i class="fa fa-check dropdown-icon" aria-hidden="true"></i> ' + location.name + '</a>'
            }
            else{
                locationMenuHTML += '<a href="#" class="dropdown-item " onclick="locationManager.callback = locationManager.configureMenu; locationManager.locationSelected(' + index + ')"><i class="fa fa-globe dropdown-icon" aria-hidden="true"></i> ' + location.name + '</a>'
            }

        });


        $('#locationMenu').html(locationMenuHTML);

    }

    //******************************************************************************************************************

    //******************************************************************************************************************
};