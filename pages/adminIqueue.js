/**
 * Created by bgager on 5/25/17.
 */

var adminIqueuePage = {

    oldDisplayAnnounceMessage: '',

    pageURL: 'pages/adminIqueue.html',

    touchPointList: [],

    touchpointCategories: [],

    touchpointSubCategories: [],

    activeTPDepartment: null,

    activeTPCategory: null,

    activeTPSubCategory: null,

    //******************************************************************************************************************
    preRender: function (callback) {
        //initialize anything that is required before the page gets rendered

        utils.writeDebug('adminIqueuePage.preLoad has been called', false);

        //go back to the router to actually load the page
        callback();
    },

    //******************************************************************************************************************
    postRender: function () {
        //script that runs after the page has been loaded

        $('#allowedDomainsInput').val(globals.theCustomer.allowedDomains);

        //$('#configCodeInput').val(globals.theCustomer.configCode);
        $('#configCodeLabel').html(globals.theCustomer.configCode);

        //setup some tooltips
        $('#mypopover1').popover();
        $('#mypopover2').popover();
        $('#defaultAnnouncePopover').popover();
        $('#allowedDomainsPopover').popover();



        //watch for any focus events on the input(s) so we can enable the save button(s)
        $('#allowedDomainsInput').focus(
            function( objEvent ){ $('#saveChangesMobileSettings').removeClass('disabled'); }
        );

        //do a locationSwitch() to force location specific items to be updated
        adminIqueuePage.locationChanged();



    },

    //******************************************************************************************************************
    preClose: function (callback) {
        //this script runs before the next page is loaded.
        //useful to purge any event watchers or kill any timers

        utils.writeDebug('adminIqueuePage.preClose has been called', false);

        callback();
    },

    //******************************************************************************************************************
    //******************************************************************************************************************

    //******************************************************************************************************************
    locationChanged: function () {

        //show the General Settings tab
        $("#generalSettingsTabLink").trigger("click");

        //set the header
        $('#pageLocationLabel').html( globals.theLocation.name + ' : ' + globals.theLocation.subName);

        //setup the Display Announcement section
        if (!globals.theLocation.displayAnnounceMessage){
            globals.theLocation.displayAnnounceMessage = "It's your turn";
        }
        $('#displayAnnounceMessageInput').val(globals.theLocation.displayAnnounceMessage);

        //setup the NameCoach section
        $('#nameCoachChoice').prop('checked', globals.theCustomer.useNameCoach);

        if (globals.theCustomer.nameCoachAuthToken === '~'){
            globals.theCustomer.nameCoachAuthToken = '';
        }
        $('#nameCoachAuthTokenInput').val(globals.theCustomer.nameCoachAuthToken);

        if (globals.theCustomer.nameCoachAccessCode === '~'){
            globals.theCustomer.nameCoachAccessCode = '';
        }
        $('#nameCoachAccessCodeInput').val(globals.theCustomer.nameCoachAccessCode);


    },

    /***************************************************************************/
    /* General Tab*/

    //******************************************************************************************************************
    updateDisplayAnnounceMessage: function () {

        if ($('#displayAnnounceMessageInput').val().length === 0){
            return;
        }

        adminIqueuePage.oldDisplayAnnounceMessage = globals.theLocation.displayAnnounceMessage;

        globals.theLocation.displayAnnounceMessage = $('#displayAnnounceMessageInput').val();

        utils.activeButton('displayMessageUpdateBTN','');

        awsDynamoDBConnector.updateCustomerLocationsTable(globals.theLocation, adminIqueuePage.updateDisplayAnnounceMessageReturned);

    },

    //******************************************************************************************************************
    updateDisplayAnnounceMessageReturned: function (success, error) {
        if (success){

        }
        else {

            var options = {};
            options.title = 'Communication Error';
            options.message = "There was an error communicating with the cloud.<br>Please make sure you are connected to the internet and try again.<br><br>Error Code: udamr_001<br>" + error ;
            options.buttonName = 'OK';
            options.callback = function () {
                $('#displayAnnounceMessageInput').val(adminIqueuePage.oldDisplayAnnounceMessage);
            };
            modalMessage.showMessage(options);
        }
    },

    //******************************************************************************************************************
    saveNameCoach: function () {

        //save changes to AWS

        var nameCoachAuthToken = $('#nameCoachAuthTokenInput').val();
        if (nameCoachAuthToken.length === 0){
            nameCoachAuthToken = '~';
        }

        var nameCoachAccessCode = $('#nameCoachAccessCodeInput').val();
        if (nameCoachAccessCode.length === 0){
            nameCoachAccessCode = '~';
        }

        utils.activeButton('nameCoachAuthTokenBTN','');
        utils.activeButton('nameCoachAccessCodeBTN','');

        awsDynamoDBConnector.updateNameCoach(globals.theCustomer.customerID, globals.theCustomer.configCode, $('#nameCoachChoice').is(':checked'), nameCoachAuthToken, nameCoachAccessCode, adminIqueuePage.updateNameCoachReturned);

    },

    //******************************************************************************************************************
    updateNameCoachReturned: function (success, error) {

        if (success){

            //update the local copy of the customer info
            globals.theCustomer.useNameCoach = $('#nameCoachChoice').is(':checked');
            globals.theCustomer.nameCoachAuthToken = $('#nameCoachAuthTokenInput').val();
            globals.theCustomer.nameCoachAccessCode = $('#nameCoachAccessCodeInput').val();

        }
        else {
            var options = {};
            options.title = 'Communication Error';
            options.message = "There was an error communicating with the cloud.<br>Please make sure you are connected to the internet and try again.<br><br>Error Code: uncr_001<br>" + error ;
            options.buttonName = 'OK';
            options.callback = function () {
                adminIqueuePage.locationChanged();
            };
            modalMessage.showMessage(options);
        }
    },

    //******************************************************************************************************************

    /***************************************************************************/
    /*TouchPoints Tab*/

    touchpointsTabClicked: function(){
        //the user has switched to the TouchPoints Tab

        //clear out the previous lists from the UI
        $('#touchpointDepartmentListGroup').html('<i class="fa fa-spinner fa-pulse fa-spin fa-fw"></i> Loading TouchPoint Departments');
        $('#touchpointCategoriesListGroup').html('');
        $('#touchpointSubCategoriesListGroup').html('');

        awsDynamoDBConnector.fetchTouchpointList(globals.theLocation.locationID, adminIqueuePage.touchpointListReturned);

    },

    //******************************************************************************************************************
    touchpointListReturned: function (success, data) {

        if (!success){

            var options = {};
            options.title = 'Communication Error';
            options.message = "There was an error communicating with the cloud.<br>Please make sure you are connected to the internet and try again.<br><br>Error Code: tplr_001<br>" + data ;
            options.buttonName = 'OK';
            options.callback = function () {
                adminIqueuePage.locationChanged();
            };
            modalMessage.showMessage(options);

            return;
        }

        //save the touchpointList for later usage
        adminIqueuePage.touchPointList = data;


        //build a unique list of Departments
        var theDepartments = [];

        adminIqueuePage.touchPointList.forEach(function(touchPoint) {

            if (theDepartments.indexOf(touchPoint.department) === -1){
                theDepartments.push(touchPoint.department);
            }

        });

        //sort the departments
        theDepartments.sort(function(a, b){
            var catA= a.toLowerCase(), catB= b.toLowerCase();
            if (catA < catB) //sort string ascending
                return -1
            if (catA > catB)
                return 1
            return 0 //default return value (no sorting)
        });

        //loop through the departments and build the list
        var s = '';
        theDepartments.forEach(function(item){

            s +=    '<a id="touchPointDepartment" href="#" class="list-group-item clearfix" data-department="' + item + '" onclick="adminIqueuePage.touchPointDepartmentClicked(&#39;' + item + '&#39;)">';
            s +=        item ;
            s +=    '</a>';

        });

        //add an Add TouchPoint Department link
        s +=    '<a href="#" class="list-group-item clearfix text-primary-darkend text-sm pointer" onclick="adminIqueuePage.addTPDepartment();">';
        s +=        'Add Department &NonBreakingSpace;<i style="cursor: pointer" class="fa fa-plus" ></i>' ;
        s +=    '</a>';

        $('#touchpointDepartmentListGroup').html(s);

        if (adminIqueuePage.touchPointList.length !==0){
            $('#touchpointCategoriesListGroup').html('<p>Click on any Department</p>');
        }

    },

    //******************************************************************************************************************
    touchPointDepartmentClicked: function(activeTPDepartment){

        adminIqueuePage.activeTPDepartment = activeTPDepartment;

        //clear out any previously set active class
        $('#touchpointDepartmentListGroup > a').each(function () {
            var theDepartment = this.getAttribute('data-department');
            if (theDepartment === activeTPDepartment){
                $(this).addClass('active') ;
            }
            else{
                $(this).removeClass('active') ;
            }

        });

        //build a unique list of Touch Point Categories for this Touch Point Department
        var theCategories = [];

        adminIqueuePage.touchPointList.forEach(function(touchPoint) {

            if(touchPoint.department === activeTPDepartment){
                if (theCategories.indexOf(touchPoint.category) === -1){
                    theCategories.push(touchPoint.category);
                }
            }

        });

        //sort the categories
        theCategories.sort(function(a, b){
            var catA= a.toLowerCase(), catB= b.toLowerCase()
            if (catA < catB) //sort string ascending
                return -1
            if (catA > catB)
                return 1
            return 0 //default return value (no sorting)
        });

        //save the list of Categories so we can use them later
        adminIqueuePage.touchpointCategories = theCategories;

        //loop through the categories and build the list
        var s = '';
        theCategories.forEach(function(item){

            var itemID = item.replace(/ /g, "_");
            itemID = itemID.replace(/\u002f/g, "_");
            itemID = itemID.replace(/\u005c/g, "_");
            itemID = itemID.replace(/\u0028/g, "_");
            itemID = itemID.replace(/\u0029/g, "_");
            itemID = itemID.replace(/\u002A/g, "_");
            itemID = itemID.replace(/:/g, "_");


            s +=    '<a id="touchPointCategory" href="#" class="list-group-item clearfix" data-category="' + item  +'" onclick="adminIqueuePage.touchPointCategoryClicked(&#39;' + item + '&#39;)">';
            s +=        item ;
            s +=        '<span class="float-right">';
            s +=            '<button id="tpCategoryTrash'+ itemID +'" class="btn btn-primary btn-rounded btn-icon btn-sm " onclick="adminIqueuePage.deleteTPCategory(&#39;' + itemID + '&#39; , &#39;' + item + '&#39;)">';
            s +=                '<span id="tpCategoryTrash" class="fa fa-trash"></span>';
            s +=            '</button>';
            s +=        '</span>';
            s +=    '</a>';

        });

        //add an Add TouchPoint Category link
        s +=    '<a href="#" class="list-group-item clearfix text-primary-darkend text-sm pointer" onclick="adminIqueuePage.addTPCategory();">';
        s +=        'Add Category &NonBreakingSpace;<i style="cursor: pointer" class="fa fa-plus" ></i>' ;
        s +=    '</a>';

        $('#touchpointCategoriesListGroup').html(s);

        //hide all the category trash icons
        adminIqueuePage.showTPCategoryTrashIcon(-2);


        $('#touchpointSubCategoriesListGroup').html('<p>Click on any Category</p>');

    },

    //******************************************************************************************************************
    touchPointCategoryClicked: function(activeTPCategory){

        adminIqueuePage.activeTPCategory = activeTPCategory;

        //clear out any previously set active class
        $('#touchpointCategoriesListGroup > a').each(function () {
            var theCategory = this.getAttribute('data-category');
            if (theCategory === activeTPCategory){
                $(this).addClass('active') ;
            }
            else{
                $(this).removeClass('active') ;
            }

        });


        //build the list of sub-categories for this category
        var theSubCategories = [];
        adminIqueuePage.touchPointList.forEach(function(touchPoint) {

            if(touchPoint.department === adminIqueuePage.activeTPDepartment && touchPoint.category === adminIqueuePage.activeTPCategory){
                if (theSubCategories.indexOf(touchPoint.subcategory) === -1){
                    if (touchPoint.subcategory){
                        theSubCategories.push(touchPoint.subcategory);
                    }
                }
            }

        });

        //hide all the category trash icons
        adminIqueuePage.showTPCategoryTrashIcon(-2);
        //show the trash icon if there are no sub-categories
        if (theSubCategories.length ===0){
            adminIqueuePage.showTPCategoryTrashIcon(adminIqueuePage.activeTPCategory);
        }



        //sort the sub categories
        theSubCategories.sort(function(a, b){
            var catA= a.toLowerCase(), catB= b.toLowerCase()
            if (catA < catB) //sort string ascending
                return -1
            if (catA > catB)
                return 1
            return 0 //default return value (no sorting)
        });

        adminIqueuePage.touchpointSubCategories = theSubCategories;

        //loop through the sub categories and build the list
        var s = '';
        theSubCategories.forEach(function(item){

            var itemID = item.replace(/ /g, "_");
            itemID = itemID.replace(/\u002f/g, "_");
            itemID = itemID.replace(/\u005c/g, "_");
            itemID = itemID.replace(/\u0028/g, "_");
            itemID = itemID.replace(/\u0029/g, "_");
            itemID = itemID.replace(/\u002A/g, "_");
            itemID = itemID.replace(/:/g, "_");

            s +=    '<a id="touchPointSubCategory" href="#" class="list-group-item clearfix" data-subcategory="' + item + '" onclick="adminIqueuePage.touchPointSubCategoryClicked(&#39;' + item + '&#39; , )">';
            s +=        item ;
            s +=        '<span class="float-right">';
            s +=            '<button id="tpSubCategoryTrash'+ itemID +'" class="btn btn-primary btn-rounded btn-icon btn-sm " onclick="adminIqueuePage.deleteTPSubCategory(&#39;' + itemID + '&#39;,&#39;' + item + '&#39;)">';
            s +=                '<span id="tpSubCategoryTrash" class="fa fa-trash"></span>';
            s +=            '</button>';
            s +=        '</span>';
            s +=    '</a>';


        });

        //add an Add TouchPoint SubCategory link
        s +=    '<a href="#" class="list-group-item clearfix text-primary-darkend text-sm pointer"  onclick="adminIqueuePage.addTPSubCategory();">';
        s +=        'Add Sub-Category &NonBreakingSpace;<i style="cursor: pointer" class="fa fa-plus"></i>' ;
        s +=    '</a>';

        $('#touchpointSubCategoriesListGroup').html(s);

        //hide all the category trash icons
        adminIqueuePage.showTPCategoryTrashIcon(-1);

        //hide all the sub-category trash icons
        adminIqueuePage.showTPSubCategoryTrashIcon(-1);



    },

    //******************************************************************************************************************
    showTPCategoryTrashIcon: function(selectedCategory){

        if (selectedCategory === -1){
            return;
        }

        adminIqueuePage.touchpointCategories.forEach(function(item){

            var itemID = item.replace(/ /g, "_");
            itemID = itemID.replace(/\u002f/g, "_");
            itemID = itemID.replace(/\u005c/g, "_");
            itemID = itemID.replace(/\u0028/g, "_");
            itemID = itemID.replace(/\u0029/g, "_");
            itemID = itemID.replace(/\u002A/g, "_");
            itemID = itemID.replace(/:/g, "_");

            if(selectedCategory === item){
                $('#tpCategoryTrash'+ itemID).show() ;
            }
            else{
                $('#tpCategoryTrash'+ itemID).hide() ;
            }

        });

    },

    //******************************************************************************************************************
    addTPDepartment: function(){

        bootbox.prompt({
            closeButton: false,
            title: "<h5 class='text-primary'>Add Department:</h5>",
            callback: function (result) {
                if (result === null) {
                    //alert("Prompt dismissed");
                    return;
                }
                else {
                    //alert("New Department Name is: "+result);
                    if(result === ''){
                        //nothing was typed in
                        return;
                    }

                    var newTouchpointDepartment = result;

                    bootbox.prompt({
                        closeButton: false,
                        title: "<h5 class='text-primary'>Please create the first Category for the " + newTouchpointDepartment + " department:</h5>",
                        callback: function (result) {
                            if (result === null) {
                                //alert("Prompt dismissed");
                                return;
                            }
                            else{
                                if(result === ''){
                                    //nothing was typed in
                                    return;
                                }
                                //ok, something was typed in
                                var newTouchpointCategory = result;

                                var newTouchpointListItem = {locationID: globals.theLocation.locationID, department: newTouchpointDepartment, category: newTouchpointCategory, subcategory: ' '}
                                awsDynamoDBConnector.addTouchpointListItem(newTouchpointListItem, adminIqueuePage.addTouchpointListItemReturned);
                            }
                        }
                    });

                }
            }
        });

    },

    //******************************************************************************************************************
    addTouchpointListItemReturned: function (success, err) {

        if(success){
            adminIqueuePage.touchpointsTabClicked();
            return;
        }
        bootbox.dialog({
            message: 'Please double check that you are connected to the internet and try again.<br><br>Error Code: atplir-001.<br><br>Error= ' + err,
            title: "There was an error saving your TouchPoint.",
            closeButton: false,
            buttons: {
                main: {
                    label: "Bummer",
                    className: "btn-primary",
                    callback: function() {

                    }
                }
            }
        });

    },

    //******************************************************************************************************************
    addTPCategory: function(){

        bootbox.prompt({
            closeButton: false,
            title: "<h5 class='text-primary'>Add a Category to the "+ adminIqueuePage.activeTPDepartment +" Department:</h5>",
            callback: function (result) {
                if (result === null) {
                    //alert("Prompt dismissed");
                    return;
                }
                else{
                    if(result === ''){
                        //nothing was typed in
                        return;
                    }
                    //ok, something was typed in
                    var newTouchpointCategory = result;

                    var newTouchpointListItem = {locationID: globals.theLocation.locationID, department: adminIqueuePage.activeTPDepartment, category: newTouchpointCategory, subcategory: ' '}
                    awsDynamoDBConnector.addTouchpointListItem(newTouchpointListItem, adminIqueuePage.addTouchpointListItemReturned);
                }
            }
        });

    },

    //******************************************************************************************************************
    deleteTPCategory: function(id,name){

        bootbox.dialog({
            message: "<h4>Are you sure you want to delete the Touch Point Category:<br><br><strong>" + name + "</strong></h4><br><br>This delete cannot be undone",
            title: "Delete TouchPoint Category?",
            closeButton: false,
            buttons: {
                cancel: {
                    label: "Cancel",
                    className: "btn-default",
                    callback: function(e) {
                        //return false;
                    }
                },
                delete: {
                    label: "Delete",
                    className: "btn-warning",

                    callback: function(e) {

                        //figure out which touchpoint to delete
                        adminIqueuePage.touchPointList.forEach(function (touchpoint) {
                            if(adminIqueuePage.activeTPDepartment === touchpoint.department){
                                //the department matches
                                if (adminIqueuePage.activeTPCategory === touchpoint.category){
                                    //and, the category matches
                                    awsDynamoDBConnector.deleteTouchpointListItem(globals.theLocation.locationID, touchpoint.touchPointID, adminIqueuePage.touchpointDeleteReturned)
                                }
                            }
                        });
                    }
                }
            }
        });
    },

    //******************************************************************************************************************
    touchpointDeleteReturned: function (success,error) {

        if(success){
            //delete was OK
            adminIqueuePage.touchpointsTabClicked();
            return;
        }
        else{
            //delete failed
            bootbox.alert("There was an error deleting that Touchpoint.<br><br>Error Code: tpdr-001<br><br>Error Info: " + error);
        }

    },

    //******************************************************************************************************************
    addTPSubCategory: function(){

        bootbox.prompt({
            closeButton: false,
            title: "<h5 class='text-primary'>Add a Sub-Category to the "+ adminIqueuePage.activeTPCategory +" Category:</h5>",
            callback: function (result) {
                if (result === null) {
                    //alert("Prompt dismissed");
                    return;
                }
                else {
                    //alert("New SubCategory Name is: "+result);
                    if(result === ''){
                        //they left it blank
                        return;
                    }

                    //ok, something was typed in
                    var newTouchpointSubCategory = result;

                    var newTouchpointListItem = {locationID: globals.theLocation.locationID, department: adminIqueuePage.activeTPDepartment, category: adminIqueuePage.activeTPCategory, subcategory: newTouchpointSubCategory}
                    awsDynamoDBConnector.addTouchpointListItem(newTouchpointListItem, adminIqueuePage.addTouchpointListItemReturned);

                }
            }
        });


    },

    //******************************************************************************************************************
    showTPSubCategoryTrashIcon: function(selectedSubCategory){

        adminIqueuePage.touchpointSubCategories.forEach(function(item){

            var itemID = item.replace(/ /g, "_");
            itemID = itemID.replace(/\u002f/g, "_");
            itemID = itemID.replace(/\u005c/g, "_");
            itemID = itemID.replace(/\u0028/g, "_");
            itemID = itemID.replace(/\u0029/g, "_");
            itemID = itemID.replace(/\u002A/g, "_");
            itemID = itemID.replace(/:/g, "_");

            if(selectedSubCategory === item){
                $('#tpSubCategoryTrash'+ itemID).show() ;
            }
            else{
                $('#tpSubCategoryTrash'+ itemID).hide() ;
            }

        });

    },

    //******************************************************************************************************************
    touchPointSubCategoryClicked: function(activeTPSubCategory){

        //var activeTPSubCategoryID = e.currentTarget.getAttribute('data-subcategoryid');
        //var activeTPSubCategory = e.currentTarget.getAttribute('data-subcategory');

        adminIqueuePage.activeTPSubCategory = activeTPSubCategory;

        //was it the trash icon that was clicked?
        //TODO
/*        if(e.target.id.indexOf('tpSubCategoryTrash') != -1){
            //it was the trash
            this.deleteTPSubCategory(adminIqueuePage.activeTPSubCategory);
            return;
        }*/

        //clear out any previously set active class
        $('#touchpointSubCategoriesListGroup > a').each(function () {
            var theSubCategory = this.getAttribute('data-subcategory');
            if (theSubCategory === activeTPSubCategory){
                $(this).addClass('active') ;
            }
            else{
                $(this).removeClass('active') ;
            }

        });

        //show the trash icon
        this.showTPSubCategoryTrashIcon(activeTPSubCategory);

    },

    //******************************************************************************************************************
    deleteTPSubCategory: function(id,name){

        bootbox.dialog({
            closeButton: false,
            message: "<h5>Are you sure you want to delete the Touch Point Sub-Category:<br><br><strong>" + name + "</strong></h5><br><br>This delete cannot be undone",
            title: "Delete TouchPoint Sub-Category?",
            buttons: {
                cancel: {
                    label: "Cancel",
                    className: "btn-default",
                    callback: function(e) {

                        //return false;
                    }
                },
                delete: {
                    label: "Delete",
                    className: "btn-warning",

                    callback: function(e) {

                        //figure out which touchpoint to delete
                        adminIqueuePage.touchPointList.forEach(function (touchpoint) {
                            if(adminIqueuePage.activeTPDepartment === touchpoint.department){
                                //the department matches
                                if (adminIqueuePage.activeTPCategory === touchpoint.category){
                                    //and, the category matches
                                    if(adminIqueuePage.activeTPSubCategory === touchpoint.subcategory){
                                        //and, the subcategory matches
                                        if(adminIqueuePage.touchpointSubCategories.length === 1){
                                            //if there's only one subcategory, then update the touchpoint
                                            var updatedTouchpointListItem = {touchPointID: touchpoint.touchPointID, department: touchpoint.department, category: touchpoint.category, subcategory: ' '};
                                            awsDynamoDBConnector.updateTouchpointListItem(globals.theLocation.locationID, updatedTouchpointListItem, adminIqueuePage.touchpointDeleteReturned);
                                        }
                                        else{
                                            //if there is more than one subcategory, then delete the touchpoint
                                            awsDynamoDBConnector.deleteTouchpointListItem(globals.theLocation.locationID, touchpoint.touchPointID, adminIqueuePage.touchpointDeleteReturned);
                                        }
                                    }
                                }
                            }
                        });
                    }
                }
            }
        });





    },

    /***************************************************************************/
    /*Methods Of Service Tab*/

    //******************************************************************************************************************
    methodsOfServiceTabClicked: function(){

        //clear out the previous lists from the UI
        $('#methodOfServiceListGroup').html('<i class="fa fa-spinner fa-spin fa-fw"></i> Loading Methods Of Service');

        //fetch the Methods of Service for this location
        awsDynamoDBConnector.fetchMethodsOfService(globals.theLocation.locationID, adminIqueuePage.buildMOSList);

    },

    //******************************************************************************************************************
    buildMOSList: function(success, data){

        if (!success){

            var options = {};
            options.title = 'Communication Error';
            options.message = "There was an error communicating with the cloud.<br>Please make sure you are connected to the internet and try again.<br><br>Error Code: bmosl_001<br>" + data ;
            options.buttonName = 'OK';
            options.callback = function () {
                adminIqueuePage.locationChanged();
            };
            modalMessage.showMessage(options);

            return;
        }

        var mosArray = data;

        //sort the Methods Of Service
        mosArray.sort(function(a, b){
            var catA= a.methodOfServiceName.toLowerCase(), catB= b.methodOfServiceName.toLowerCase()
            if (catA < catB) //sort string ascending
                return -1
            if (catA > catB)
                return 1
            return 0 //default return value (no sorting)
        });



        var listHTML = '';

        if(mosArray.length === 0){
            listHTML = 'Please click the + sign above to add your first Method Of Service';
        }




        listHTML += '   <ul class="list-group">';

        mosArray.forEach(function(item){

            listHTML += '       <li class="list-group-item clearfix">';
            listHTML += '          <span class="h4">'+ item.methodOfServiceName + '<a class="pointer text-danger" onclick="App.adminview.deleteMethodOfService_AWS(&#39;'+ item.theLocation + '&#39;, &#39;'+ item.methodOfServiceID + '&#39;, &#39;'+ item.methodOfServiceName + '&#39;)"><i class="fa fa-trash-o float-right "></i></a></span>';
            listHTML += '       </li>';

        });

        listHTML += '   </ul>';

        $('#methodOfServiceListGroup2').html(listHTML);



        //loop through the Methods of Service and build the list
        var s = '';
        mosArray.forEach(function(item){

            s +=    '<a id="MethodOfService" href="#" class="list-group-item clearfix" >';
            s +=        item.methodOfServiceName ;
            s +=        '<span class="float-right">';
            s +=            '<button class="btn btn-primary btn-rounded btn-icon btn-sm " onclick="adminIqueuePage.deleteMethodOfService_AWS(&#39;' + item.methodOfServiceID + '&#39; , &#39;' + item.methodOfServiceName + '&#39;)">';
            s +=                '<span class="fa fa-trash"></span>';
            s +=            '</button>';
            s +=        '</span>';
            s +=    '</a>';

        });

        //add an Add Method Of Service link
        s +=    '<a href="#" class="list-group-item clearfix text-primary-darkend text-sm pointer" onclick="adminIqueuePage.addMOS_AWS();">';
        s +=        'Add Method Of Service &NonBreakingSpace;<i style="cursor: pointer" class="fa fa-plus" ></i>' ;
        s +=    '</a>';

        $('#methodOfServiceListGroup').html(s);



    },

    //******************************************************************************************************************
    addMOS_AWS: function(){
        var self = this;

        bootbox.prompt({
            closeButton: false,
            title: "Add a new Method Of Service",
            callback: function(result){
                if (result === null) {
                    //alert("Prompt dismissed");
                } else {
                    //alert("New Method Of Service is: "+result);
                    if(result === ''){

                        return;
                    }

                    //add the new MOS to AWS

                    awsDynamoDBConnector.saveMethodOfService(globals.theLocation.locationID, utils.guid(), result, adminIqueuePage.saveMethodOfServiceComplete);

                    bootbox.hideAll();

                    toastr.info(" ", "<i class=\"fa fa-spinner fa-spin fa-fw\"></i> Saving", {timeOut: 2000, positionClass: "toast-top-center"});

                    return false;

                } }
        })


    },

    //******************************************************************************************************************
    saveMethodOfServiceComplete: function (success, data) {

        if (!success){
            //the save failed

            bootbox.dialog({
                message: 'Please double check that you are connected to the internet and try again.<br><br>Error Code: smosc-001.<br><br>Error= ' + data,
                title: "There was an error saving your Method Of Service.",
                closeButton: false,
                buttons: {
                    main: {
                        label: "Bummer",
                        className: "btn-primary",
                        callback: function() {

                        }
                    }
                }
            });

            return;
        }

        toastr.clear();
        adminIqueuePage.methodsOfServiceTabClicked();

    },

    //******************************************************************************************************************
    deleteMethodOfService_AWS: function(methodOfServiceID, name){

        bootbox.dialog({
            closeButton: false,
            message: "<h4>Are you sure you want to delete the Method Of Service:<br><br><strong>" + name + "</strong></h4><br><br>This delete cannot be undone",
            title: "Delete Method Of Service?",
            buttons: {
                cancel: {
                    label: "Cancel",
                    className: "btn-default",
                    callback: function(e) {

                        //return false;
                    }
                },
                delete: {
                    label: "Delete",
                    className: "btn-primary",

                    callback: function(e) {

                        awsDynamoDBConnector.deleteMethodOfService(globals.theLocation.locationID, methodOfServiceID, adminIqueuePage.deleteMethodOfServiceComplete);

                        toastr.info(" ", "<i class=\"fa fa-spinner fa-spin fa-fw\"></i> Deleting", {timeOut: 2000, positionClass: "toast-top-center"});

                    }
                }
            }
        });

    },

    //******************************************************************************************************************
    deleteMethodOfServiceComplete: function (success, data) {

        if (!success){
            //the save failed

            bootbox.dialog({
                message: 'Please double check that you are connected to the internet and try again.<br><br>Error Code: dmosc-001.<br><br>Error= ' + data,
                title: "There was an error deleting your Method Of Service.",
                closeButton: false,
                buttons: {
                    main: {
                        label: "Bummer",
                        className: "btn-primary",
                        callback: function() {

                        }
                    }
                }
            });

            return;
        }

        toastr.clear();
        adminIqueuePage.methodsOfServiceTabClicked();

    },

    /***************************************************************************/
    /*iQueue Mobile Tab*/

    //******************************************************************************************************************
    resetMobileSettings: function(){

        $('#allowedDomainsInput').val(globals.theCustomer.allowedDomains);

        $('#saveChangesMobileSettings').addClass('disabled');

    },

    //******************************************************************************************************************
    saveChangesMobileSettings: function(){
        //console.log('saveChangesMobileSettings called');

        toastr.info(" ", "<i class=\"fa fa-spinner fa-spin fa-fw\"></i> Saving", {timeOut: 2000, positionClass: "toast-top-center"});


        awsDynamoDBConnector.updateAllowedDomains(globals.theCustomer, $('#allowedDomainsInput').val(), adminIqueuePage.allowedDomainsUpdated);

    },

    //******************************************************************************************************************
    allowedDomainsUpdated: function(success, data){

        if (!success){

            //the save failed

            bootbox.dialog({
                message: 'Please double check that you are connected to the internet and try again.<br><br>Error Code: adu-001.<br><br>Error= ' + data,
                title: "There was an error saving your changes.",
                closeButton: false,
                buttons: {
                    main: {
                        label: "Bummer",
                        className: "btn-primary",
                        callback: function() {

                        }
                    }
                }
            });

            return;
        }

        //update the local globals.customer with the same changes
        globals.theCustomer.allowedDomains =  $('#allowedDomainsInput').val() ;

        //and disable the Save button since the changes have been saved
        $('#saveChangesMobileSettings').addClass('disabled');
    }




    //******************************************************************************************************************
    //******************************************************************************************************************
};