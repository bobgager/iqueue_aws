/**
 * Created by bgager on 5/25/17.
 */

var myQueuePage = {

    pageURL: 'pages/myQueue.html',

    theQueue: [],

    theCategories: [],

    filterCategory: 'All',

    filteredQueue: [],

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
        $('#currentlyBeingHelpedList').html('');

        //set the filter category back to all
        myQueuePage.filterCategory = 'All';

        //hide the filter buttons
        $('#queueCategoriesDiv').hide()

        //load the Open queue
        awsDynamoDBConnector.fetchQueue('Open', globals.theLocation.locationID, myQueuePage.openQueueReturned);

        //load the Active queue
        awsDynamoDBConnector.fetchQueue('Active', globals.theLocation.locationID, myQueuePage.activeQueueReturned);

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
        //store the results locally
        myQueuePage.theQueue = data;

        //build an array of unique categories
        myQueuePage.theCategories = [];

        myQueuePage.theQueue.forEach(function(student) {

            if (myQueuePage.theCategories.length === 0){
                //first time through we need to just push this category in
                myQueuePage.theCategories.push({name: student.category, count: 1});
            }
            else {
                //figure out if this category is already in the array
                var index = -1;
                for(var i = 0, len = myQueuePage.theCategories.length; i < len; i++) {
                    if (myQueuePage.theCategories[i].name === student.category) {
                        index = i;
                        break;
                    }
                }

                if (index === -1){
                    //new category
                    myQueuePage.theCategories.push({name: student.category, count: 1});
                }
                else {
                    //existing category
                    myQueuePage.theCategories[index].count += 1;
                }

            }


        });

        //filter the queue

        if (myQueuePage.filterCategory === 'All'){
            myQueuePage.filteredQueue = myQueuePage.theQueue;
        }
        else {
            myQueuePage.filteredQueue = myQueuePage.theQueue.filter(function (student) {
                return student.category === myQueuePage.filterCategory ;
            });
        }


        //let the user know we're processing the results
        const studentLabel = myQueuePage.filteredQueue.length !== 1 ? ' Students' : ' Student';
        $('#queueDiv').html('<span class="h4"><i class="fa fa-spinner fa-spin fa-fw"></i> Processing ' + myQueuePage.filteredQueue.length + studentLabel + ' In Your Queue</span>');

        //build the filter buttons
        myQueuePage.drawFilterBTNs(myQueuePage.filterCategory);

        //create the list of waiting students
        var listHTML = '<div class="card-accordion" id="queueAccordion" role="tablist" aria-multiselectable="true">';

        myQueuePage.filteredQueue.forEach(function (student, index) {

            listHTML += '<div class="card card-outline-primary">';
            listHTML += '    <h4 class="card-header py-0 px-0" role="tab" id="heading' + index + '">';

            if (index === 0) {
                listHTML += '    <a class=" pb-1" data-toggle="collapse" data-parent="#queueAccordion" href="#collapse' + index + '" aria-expanded="true" aria-controls="collapse' + index + '">' + student.firstName + '&nbsp;' + student.lastName + '<span class="text-xs font-weight-normal text-muted">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<i class="fa fa-clock-o pb-1" aria-hidden="true"></i> ' + Math.round(student.waitTime/1000/60) + ' Minutes</span></a>';
            }
            else {
                listHTML += '    <a class="collapsed pb-1" data-toggle="collapse" data-parent="#queueAccordion" href="#collapse' + index + '" aria-expanded="true" aria-controls="collapse' + index + '">' + student.firstName + '&nbsp;' + student.lastName + '<span class="text-xs font-weight-normal text-muted">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<i class="fa fa-clock-o pb-1" aria-hidden="true"></i> ' + Math.round(student.waitTime/1000/60) + ' Minutes</span></a>';
            }

            listHTML += '   </h4>';

            if (index === 0){
                listHTML += '   <div id="collapse' + index + '" class="collapse in show" role="tabpanel" aria-labelledby="heading' + index + '">';
            }
            else {
                listHTML += '   <div id="collapse' + index + '" class="collapse in " role="tabpanel" aria-labelledby="heading' + index + '">';
            }

            listHTML += '       <div class="card-block">';
            listHTML +=                '<div>';
            listHTML +=                    '<strong>Category: </strong>'+  student.category   ;
            listHTML +=                '</div>';

            listHTML +=                '<div>';
            listHTML +=                    '<strong>Question: </strong>'+  student.question   ;
            listHTML +=                '</div>';
            listHTML += '       </div>';

            listHTML += '       <div class="card-footer pt-1 pb-0 ">'
            listHTML +=             '<a href="#" class="mb-1 btn btn-sm btn-outline-primary" role="button" onclick="myQueuePage.callUp(' + index + ')">Call '+ student.firstName + ' Up</a>'
            listHTML +=         '</div>';
            listHTML += '   </div>';
            listHTML += '</div>';

        });

        listHTML += '</div>';

        $('#queueDiv').hide().html(listHTML).fadeIn(1000);

    },

    //******************************************************************************************************************
    drawFilterBTNs: function (selectedCategory) {

        //create the All filter button
        filterBTNsHTML = '<a id="categoryFilterBTNAll" href="#" class="mb-1 btn btn-secondary btn-rounded btn-sm" role="button" onclick="myQueuePage.filterQueue(&#39;All&#39;)" >All (' + myQueuePage.theQueue.length + ')</a>';

        //add in a button for each category
        myQueuePage.theCategories.forEach(function (category, index) {
            filterBTNsHTML += '<a id="categoryFilterBTN' + category.name.replace(/ /g,"_") + '" href="#" class="mb-1 btn btn-secondary btn-rounded btn-sm" role="button"  onclick="myQueuePage.filterQueue(&#39;' + category.name + '&#39;)">' + category.name + ' (' + category.count + ')</a>';
        });

        //show the filter buttons
        $('#queueCategoriesDiv').hide().html(filterBTNsHTML).fadeIn(1000);

        //highlight the selected category filter button
        var btnID = '#categoryFilterBTN' + selectedCategory.replace(/ /g,"_");

        $(btnID).removeClass('btn-secondary');
        $(btnID).addClass('btn-primary');

    },

    //******************************************************************************************************************
    filterQueue: function (category) {

        myQueuePage.filterCategory = category;

        myQueuePage.openQueueReturned(true, myQueuePage.theQueue);

    },

    //******************************************************************************************************************
    callUp:function (index) {

        var student = myQueuePage.filteredQueue[index];

        //double check that this student isn't being helped by someone else
        awsDynamoDBConnector.fetchQueueItem(globals.theLocation.locationID, student.personID, myQueuePage.queueItemReturned)

    },

    //******************************************************************************************************************
    queueItemReturned: function (success, data) {

        if (!success){
            //the call failed
            bootbox.dialog({
                message: 'Please double check that you are connected to the internet and try again.<br><br>Error Code: qir-001.<br><br>Error= ' + data,
                title: "There was an error loading the Queue.",
                closeButton: false,
                buttons: {
                    ok: {
                        label: "OK",
                        className: "btn-primary",
                        callback: function() {

                        }
                    }
                }
            });
            return;
        }

        //the call succeded

        if (data){
            //we have a result
            if(data.issueStatus === 'Open'){
                //and they are still Open
                //set it as Active and re-save

                //agent = susi.theUser.first +' '+ susi.theUser.last

                awsDynamoDBConnector.setItemActive(globals.theLocation.locationID, data.personID, utils.calibratedDateTime().getTime(), globals.theUser.firstName +' '+ globals.theUser.lastName, myQueuePage.showItemDetails)

                return;
            }

        }

        //we got a null result back or the student is no longer Open.
        bootbox.dialog({
            message: "This student is being helped by someone else.",
            title: "Attention!",
            closeButton: false,
            buttons: {
                main: {
                    label: "OK",
                    className: "btn-default",
                    callback: function() {
                        myQueuePage.render();
                    }
                }
            }
        });

    },

    //******************************************************************************************************************
    showItemDetails: function (success, data) {

        if (!success){
            //the call failed
            bootbox.dialog({
                message: 'Please double check that you are connected to the internet and try again.<br><br>Error Code: sid-001.<br><br>Error= ' + data,
                title: "Communication Error",
                closeButton: false,
                buttons: {
                    ok: {
                        label: "OK",
                        className: "btn-primary",
                        callback: function() {

                        }
                    }
                }
            });
            return;
        }

        var student = data;

        student.guid = student.personID;

        student.createDateTime = new Date(student.createTime);

        student.waitTime = utils.calibratedDateTime() - student.createDateTime;

        $('#queueDetailsModallTitle').html(student.firstName + '&nbsp;' + student.lastName + '<span class="text-xs font-weight-normal text-muted">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<i class="fa fa-clock-o pb-1" aria-hidden="true"></i> ' + Math.round(student.waitTime/1000/60) + ' Minutes</span>');

        $('#queueDetailsModal').modal({backdrop: 'static'});
    },

    //******************************************************************************************************************
    activeQueueReturned: function (success, data) {

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
                            awsDynamoDBConnector.fetchQueue('Open', globals.theLocation.locationID, myQueuePage.activeQueueReturned);
                        }
                    }
                }
            });

            return;
        }

        //success


        //create the list of active students
        var listHTML = '<ul class="list-group">';

        data.forEach(function (student, index) {

            listHTML += '    <li class="list-group-item justify-content-between"><span class="h5 title-divider text-primary-darkend ">' + student.firstName + '&nbsp;' + student.lastName + '</span> is being helped by ' + student.closedBy +'<span class="text-xs font-weight-normal text-muted">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<i class="fa fa-clock-o pb-1" aria-hidden="true"></i> ' + Math.round(student.waitTime/1000/60) + ' Minutes</span><a href="#" class="ejectBTN float-right font-weight-normal text-muted btn btn-sm btn-secondary btn-icon btn-rounded border-0" role="button" onclick="myQueuePage.returnToQueue(&#39;' + student.personID + '&#39;)"  data-container="body" data-toggle="popover" data-trigger="hover" data-placement="left" data-content="Return ' + student.firstName + ' to the Queue"    ><i class="fa fa-eject"></i></a></li>'

        });

        listHTML += '</ul>';

        $('#currentlyBeingHelpedList').hide().html(listHTML).fadeIn(1000);

        $('.ejectBTN').popover();

    },

    //******************************************************************************************************************
    returnToQueue: function (personID) {

        //make sure student is still active before returning them to the queue

        awsDynamoDBConnector.fetchQueueItem(globals.theLocation.locationID, personID, myQueuePage.returnToQueueCheckReturned);

    },

    //******************************************************************************************************************
    returnToQueueCheckReturned: function (success, data) {

        if (!success){
            //the call failed
            bootbox.dialog({
                message: 'Please double check that you are connected to the internet and try again.<br><br>Error Code: rtqcr-001.<br><br>Error= ' + data,
                title: "Communication Error",
                closeButton: false,
                buttons: {
                    ok: {
                        label: "OK",
                        className: "btn-primary",
                        callback: function() {

                        }
                    }
                }
            });
            return;
        }

        if (data){
            //we have a result
            if(data.issueStatus === 'Active'){
                //and they are still Active

                //indicate we're loading the queue
                $('#queueDiv').html('<span class="h4"><i class="fa fa-spinner fa-spin fa-fw"></i> Loading Your Queue</span>');
                $('#currentlyBeingHelpedList').html('');

                //return them to the queue
                awsDynamoDBConnector.setItemOpen(globals.theLocation.locationID, data.personID, myQueuePage.render);

            }
            else {
                //they are not active anymore, so just reload the queue
                myQueuePage.render();
            }

        }



    }

    //******************************************************************************************************************
    //******************************************************************************************************************
};