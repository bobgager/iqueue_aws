/**
 * Created by bgager on 5/25/17.
 */

var dashboardPage = {

    pageURL: 'pages/dashboard.html',

    refreshTimer:  0 ,

    //******************************************************************************************************************
    preLoad: function (callback) {
        //initialize anything that is required before the page gets rendered

        //go back to the router to actually load the page
        callback();
    },

    //******************************************************************************************************************
    postLoad: function () {
        //script that runs after the page has been loaded

        dashboardPage.render();

    },

    //******************************************************************************************************************
    preClose: function (callback) {
        //this script runs before the next page is loaded.
        //useful to purge any event watchers or kill any timers

        callback();
    },

    //******************************************************************************************************************

    //******************************************************************************************************************
    render: function () {

        // set the header
        $('#pageLocationLabel').html(globals.theLocation.name);

        dashboardPage.refreshAll();

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
        if (router.currentPage !== 'dashboardPage'){
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
            $('#currentWaitTime_Dash').html('0 <span class="h4">Min.</span>');
            return;
        }
        $('#currentWaitTime_Dash').html(Math.round(theQueue[0].waitTime/1000/60)+ ' <span class="h4">Min.</span>');

    },

    //******************************************************************************************************************
    updateTodayStats: function () {
        utils.writeDebug('updateTodayStats() called',false);
        awsDynamoDBConnector.fetchHelpedToday(globals.theLocation.locationID, dashboardPage.helpedTodayReturned);
    },

//******************************************************************************************************************
    helpedTodayReturned: function (success, results) {

        if(!success){

            //TODO Handle the error better
            utils.writeDebug('<span class="text-danger">There was an error reading the closedQueue table. Need to handle the error</span>',true);

            return;
        }


        //show the total number of students we helped today
        $('#totalToday_Dash').html(results.length);


        if(results.length === 0){
            //nobody has been helped today, so no need to draw the graph
            if($('#myfirstchart').highcharts()){
                $('#myfirstchart').highcharts().destroy();
            }
            return;
        }

        //build the data for the graph


        //build an array of hour values between the first entry and the last
        var chartTimeCategories = [];

        var createDate = new Date(results[0].createTime);
        var firstHour = createDate.getHours();
        createDate = new Date(results[results.length-1].createTime);
        var lastHour = createDate.getHours();

        for (i = firstHour; i < lastHour+1; i++) {
            chartTimeCategories.push(i);
        }


        var hourCount = [];
        for (i = 0; i < chartTimeCategories.length; i++) {
            hourCount.push(0);
        }

        var maxWaitTime = [];
        for (i = 0; i < chartTimeCategories.length; i++) {
            maxWaitTime.push(0);
        }

        var maxServiceTime = [];
        for (i = 0; i < chartTimeCategories.length; i++) {
            maxServiceTime.push(0);
        }

        results.forEach(function(item){

            //add to the hourCount array
            var createDate = new Date(item.createTime);
            var activeDate = new Date(item.activeTime);
            var closeDate = new Date(item.closeTime);
            hourCount[chartTimeCategories.indexOf(createDate.getHours())] += 1;



            //figure out the wait times in minutes
            var waitTime = (activeDate - createDate)/1000/60 ;
            waitTime = Math.max(0, waitTime);
            waitTime = Math.round(waitTime);

            //see if it's bigger than the existing wait time for this hour
            if(waitTime > maxWaitTime[chartTimeCategories.indexOf(createDate.getHours())] ){
                maxWaitTime[chartTimeCategories.indexOf(createDate.getHours())]= waitTime;
            }



            //figure out the wait and service times in minutes
            var serviceTime = (closeDate - activeDate)/1000/60 ;
            serviceTime = Math.max(0, serviceTime);
            serviceTime = Math.round(serviceTime);

            //see if it's bigger than the existing service time for this hour
            if(serviceTime > maxServiceTime[chartTimeCategories.indexOf(createDate.getHours())] ){
                maxServiceTime[chartTimeCategories.indexOf(createDate.getHours())]= serviceTime;
            }


        });

        //adjust the hours for better presentation
        for (i = 0; i < chartTimeCategories.length; i++) {
            if(chartTimeCategories[i] < 13){
                //midnight to noon

                if (chartTimeCategories[i] === 12){
                    chartTimeCategories[i] = chartTimeCategories[i].toString() + ' pm';
                }
                else {
                    chartTimeCategories[i] = chartTimeCategories[i].toString() + ' am';
                }

            }
            else{
                //noon to midnight
                chartTimeCategories[i] -= 12;
                chartTimeCategories[i] = chartTimeCategories[i].toString() + ' pm';
            }
        }
        if($('#myfirstchart').highcharts()){
            $('#myfirstchart').highcharts().destroy();
        }
        $('#myfirstchart').highcharts({
            chart: {
                zoomType: 'xy'
            },
            title: {
                text: "Today's Profile"
            },
            subtitle: {
                text: ' '
            },
            xAxis: [{
                categories: chartTimeCategories,
                crosshair: true
            }],
            yAxis: [{ // Primary yAxis
                labels: {
                    format: '{value} Min',
                    style: {
                        color: Highcharts.getOptions().colors[1]
                    }
                },
                title: {
                    text: 'Time',
                    style: {
                        color: Highcharts.getOptions().colors[1]
                    }
                },
                floor: 0,
                opposite: true
            },
                { // Secondary yAxis
                    title: {
                        text: 'Students Helped',
                        style: {
                            color: Highcharts.getOptions().colors[0]
                        }
                    },
                    labels: {
                        format: '{value}',
                        style: {
                            color: Highcharts.getOptions().colors[0]
                        }
                    }
                }],
            tooltip: {
                shared: true
            },
            legend: {
                layout: 'horizontal',
                align: 'center',
                x: 0,
                verticalAlign: 'top',
                y: 20,
                floating: true,
                backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'
            },
            series: [
                {
                    name: 'Helped',
                    type: 'column',
                    yAxis: 1,
                    data: hourCount,
                    tooltip: {
                        valueSuffix: ''
                    }

                },
                {
                    name: 'Max Wait Time',
                    type: 'spline',
                    data: maxWaitTime,
                    tooltip: {
                        valueSuffix: ' Min'
                    }
                },
                {
                    name: 'Max Service Time',
                    type: 'spline',
                    data: maxServiceTime,
                    tooltip: {
                        valueSuffix: ' Min'
                    }
                }
            ]
        });

    }

//******************************************************************************************************************
//******************************************************************************************************************
};