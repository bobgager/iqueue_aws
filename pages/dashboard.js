/**
 * Created by bgager on 5/25/17.
 */

var dashboardPage = {

    refreshTimer:  0 ,

    //******************************************************************************************************************
    render: function () {

        jPM.close();

        globals.currentPage = 'dashboardPage';


        $('#authenticatedContent').hide().load("pages/dashboard.html?version="+ globals.version, function() {

            $('#pageLocationLabel').html(globals.theLocation.name);

            utils.writeDebug('dashboard Page loaded',false);

            dashboardPage.refreshAll();

        }).fadeIn('1000');

    },

    //******************************************************************************************************************
    locationChanged: function () {

        dashboardPage.render();

    },

    //******************************************************************************************************************
    refreshAll: function(){

        //make sure the previously set timer is stopped
        clearTimeout(dashboardPage.refreshTimer);

        //just exit if we're no longer on the Dashboard page
        if (globals.currentPage !== 'dashboardPage'){
            return;
        }

        //and restart a timer so we'll fetch again soon
        dashboardPage.refreshTimer = setTimeout(function(){dashboardPage.refreshAll()},1000*30);


        dashboardPage.updateRealtimeStats();
        dashboardPage.updateTodayStats();
    },

    //******************************************************************************************************************
    updateRealtimeStats: function () {
        utils.writeDebug('updateRealtimeStats() called',false);
        //TODO
    },

    //******************************************************************************************************************
    updateTodayStats: function () {
        utils.writeDebug('updateTodayStats() called',false);
        //TODO
    }

//******************************************************************************************************************
//******************************************************************************************************************
};