/**
 * Created by bgager on 5/25/17.
 */

var myQueuePage = {

    pageURL: 'pages/myQueue.html',

    //******************************************************************************************************************
    preLoad: function (callback) {
        //initialize anything that is required before the page gets rendered

        //utils.writeDebug('myQueuePage.preLoad has been called', false);

        //go back to the router to actually load the page
        callback();
    },

    //******************************************************************************************************************
    postLoad: function () {
        //script that runs after the page has been loaded
        //utils.writeDebug('myQueuePage.postLoad has been called', false);

        myQueuePage.render();

    },

    //******************************************************************************************************************
    preClose: function (callback) {
        //this script runs before the next page is loaded.
        //useful to purge any event watchers or kill any timers

        //utils.writeDebug('myQueuePage.preClose has been called', false);

        callback();
    },

    //******************************************************************************************************************
    //******************************************************************************************************************
    render: function () {

        // set the header
        $('#pageLocationLabel').html(globals.theLocation.name);

        //indicate we're loading the queue
        $('#queueDiv').html('<span class="h4"><i class="fa fa-spinner fa-spin fa-fw"></i> Loading Your Queue</span>');

        //load the Open queue
        awsDynamoDBConnector.fetchQueue('Open', globals.theLocation.locationID, myQueuePage.openQueueReturned);

    },

    //******************************************************************************************************************
    locationChanged: function () {

        myQueuePage.render();

    },

    //******************************************************************************************************************
    openQueueReturned: function (success, data) {

        if (!success){

            bootbox.dialog({
                message: 'Please double check that you are connected to the internet and try again.<br><br>Error Code: oqr-001.<br><br>Error= ' + data,
                title: "There was an error loading the Queue.",
                closeButton: false,
                buttons: {
                    main: {
                        label: "OK",
                        className: "btn-primary",
                        callback: function() {

                        }
                    },
                    main: {
                        label: "Try Again",
                        className: "btn-primary",
                        callback: function() {
                            awsDynamoDBConnector.fetchQueue('Open', globals.theLocation.locationID, myQueuePage.openQueueReturned);
                        }
                    }
                }
            });

            return;
        }

        //success
        const studentLabel = data.length !== 1 ? ' Students' : ' Student';
        $('#queueDiv').html('<span class="h4"><i class="fa fa-spinner fa-spin fa-fw"></i> Processing ' + data.length + studentLabel + ' In Your Queue</span>');

    }

    //******************************************************************************************************************
    //******************************************************************************************************************
};