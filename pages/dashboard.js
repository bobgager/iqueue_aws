/**
 * Created by bgager on 5/25/17.
 */

var dashboardPage = {

    render: function () {

        jPM.close();


        $('#authenticatedContent').hide().load("pages/dashboard.html", function() {

            console.log('Dashboard Page loaded');

        }).fadeIn('1000');

    }


};