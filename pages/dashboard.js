/**
 * Created by bgager on 5/25/17.
 */

var dashboardPage = {

    render: function () {

        jPM.close();


        $('#authenticatedContent').hide().load("pages/dashboard.html"+ globals.version, function() {

            utils.writeDebug('dashboard Page loaded',false);

        }).fadeIn('1000');

    }


};