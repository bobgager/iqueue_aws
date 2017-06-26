/**
 * Created by bgager on 5/25/17.
 */

var dashboardPage = {

    //******************************************************************************************************************
    render: function () {

        jPM.close();

        globals.currentPage = 'dashboardPage';


        $('#authenticatedContent').hide().load("pages/dashboard.html?version="+ globals.version, function() {

            $('#pageLocationLabel').html(globals.theLocation.name);

            utils.writeDebug('dashboard Page loaded',false);

        }).fadeIn('1000');

    },

    //******************************************************************************************************************
    locationChanged: function () {

        dashboardPage.render();

    }

//******************************************************************************************************************
//******************************************************************************************************************
};