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
        awsDynamoDBConnector.fetchWaitTime(globals.theLocation.locationID, dashboardPage.drawRealtimeStats);
    },

    //******************************************************************************************************************
    drawRealtimeStats: function(success, theQueue){

        if (!success){

            //the call failed, but since this is a recurring refresh, let's show a ? and assume the next call will work
            $('#studentsInLine_Dash').html('?');
            $('#currentWaitTime_Dash').html('?');

            return;
        }

        $('#studentsInLine_Dash').html(theQueue.length);

        if(theQueue.length === 1){
            $('#studentsInLineLabel_Dash').html('Student In Line');
        }
        else{
            $('#studentsInLineLabel_Dash').html('Students In Line');
        }

        if(theQueue.length === 0){
            $('#currentWaitTime_Dash').html('0 Minutes');
            return;
        }
        $('#currentWaitTime_Dash').html(Math.round(theQueue[0].waitTime/1000/60)+ ' Minutes');

    },

    //******************************************************************************************************************
    updateTodayStats: function () {
        utils.writeDebug('updateTodayStats() called',false);
        awsDynamoDBConnector.fetchHelpedToday(globals.theLocation.locationID, dashboardPage.helpedTodayReturned);
    },

//******************************************************************************************************************
    helpedTodayReturned: function (success, data) {

        if(!success){

            //TODO Handle the error better
            utils.writeDebug('<span class="text-danger">There was an error reading the closedQueue table. Need to handle the error</span>',true);

            return;
        }

        utils.writeDebug('helpedToday count = ' + data.length,false);
    }

//******************************************************************************************************************
//******************************************************************************************************************
};