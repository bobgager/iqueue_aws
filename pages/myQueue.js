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
                    ok: {
                        label: "OK",
                        className: "btn-secondary",
                        callback: function() {

                        }
                    },
                    retry: {
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

        var listHTML = '<div class="card-accordion" id="queueAccordion" role="tablist" aria-multiselectable="true">';

        data.forEach(function (student, index) {

            listHTML += '<div class="card">';
            listHTML += '    <h4 class="card-header py-0 px-0" role="tab" id="heading' + index + '">';
            listHTML += '    <a class="collapsed pb-1" data-toggle="collapse" data-parent="#queueAccordion" href="#collapse' + index + '" aria-expanded="true" aria-controls="collapse' + index + '">' + student.firstName + '&nbsp;' + student.lastName + '<span class="text-xs font-weight-normal text-muted">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<i class="fa fa-clock-o pb-1" aria-hidden="true"></i> ' + Math.round(student.waitTime/1000/60) + ' Minutes</span></a>';
            listHTML += '   </h4>';
            listHTML += '   <div id="collapse' + index + '" class="collapse in" role="tabpanel" aria-labelledby="heading' + index + '">';


            listHTML += '       <div class="card-block">';
            listHTML +=                '<div>';
            listHTML +=                    '<strong>Category: </strong>'+  student.category   ;
            listHTML +=                '</div>';

            listHTML +=                '<div>';
            listHTML +=                    '<strong>Question: </strong>'+  student.question   ;
            listHTML +=                '</div>';
            listHTML += '       </div>';

            listHTML += '       <div class="card-footer pt-1 pb-0 ">'
            listHTML +=             '<a href="#" class="mb-1 btn btn-sm btn-outline-primary" role="button" aria-pressed="true">Call '+ student.firstName + ' Up</a>'
            listHTML +=         '</div>';
            listHTML += '   </div>';
            listHTML += '</div>';

        });

        listHTML += '</div>';

        $('#queueDiv').hide().html(listHTML).fadeIn(1000);

    }

    //******************************************************************************************************************
    //******************************************************************************************************************
};