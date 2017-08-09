/**
 * Created by bgager on 5/25/17.
 */

var adminIqueuePage = {

    pageURL: 'pages/adminIqueue.html',

    //******************************************************************************************************************
    preRender: function (callback) {
        //initialize anything that is required before the page gets rendered

        utils.writeDebug('adminIqueuePage.preRender has been called', false);

        //go back to the router to actually load the page
        callback();
    },

    //******************************************************************************************************************
    postRender: function () {
        //script that runs after the page has been loaded

        $('#allowedDomainsInput').val(globals.theCustomer.allowedDomains);

        $('#configCodeInput').val(globals.theCustomer.configCode);

        //setup some tooltips
        $('#mypopover1').popover();
        $('#mypopover2').popover();
        $('#defaultAnnouncePopover').popover();


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
        $('#nameCoachChoice').prop('checked', globals.customer.useNameCoach);

        if (globals.customer.nameCoachAuthToken === '~'){
            globals.customer.nameCoachAuthToken = '';
        }
        $('#nameCoachAuthTokenInput').val(globals.customer.nameCoachAuthToken);

        if (globals.customer.nameCoachAccessCode === '~'){
            globals.customer.nameCoachAccessCode = '';
        }
        $('#nameCoachAccessCodeInput').val(globals.customer.nameCoachAccessCode);


    },

    /***************************************************************************/
    /* General Tab*/

    //******************************************************************************************************************
    updateDisplayAnnounceMessage: function () {

        if ($('#displayAnnounceMessageInput').val().length === 0){
            return;
        }

        globals.theLocation.displayAnnounceMessage = $('#displayAnnounceMessageInput').val();

        awsConnector.updateCustomerLocationsTable(globals.theLocation, App.adminview.updateDisplayAnnounceMessageReturned);


    },

    //******************************************************************************************************************
    updateDisplayAnnounceMessageReturned: function (success, error) {
        if (success){

        }
        else {
            bootbox.alert("Communication Error.<br/><br>There was an error communicating with the cloud.<br>Please make sure you are connected to the internet and try again.<br><br>Error Code: av_udamr_001<br>" + error, function() {});

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

        awsConnector.updateNameCoach($('#nameCoachChoice').is(':checked'), nameCoachAuthToken, nameCoachAccessCode, App.adminview.updateNameCoachReturned);

    },

    //******************************************************************************************************************
    updateNameCoachReturned: function (success, error) {

        if (success){

            //update the local copy of the customer info
            globals.customer.useNameCoach = $('#nameCoachChoice').is(':checked');
            globals.customer.nameCoachAuthToken = $('#nameCoachAuthTokenInput').val();
            globals.customer.nameCoachAccessCode = $('#nameCoachAccessCodeInput').val();

        }
        else {
            bootbox.alert("Communication Error.<br/><br>There was an error communicating with the cloud.<br>Please make sure you are connected to the internet and try again.<br><br>Error Code: av_uncr_001<br>" + error, function() {});

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

        //hide the add category and subcategory icons
        $('#addTPCategoryIcon').hide();
        $('#addTPSubCategoryIcon').hide();


        awsConnector.fetchTouchpointList(App.adminview.touchpointListReturned);

    },

    //******************************************************************************************************************
    touchpointListReturned: function (touchPointList) {

        if (!touchPointList){
            bootbox.dialog({
                message: "Please double check that you are connected to the internet and try again.<br>Error Code: av:tplr:001",
                title: "Error Communicating With Server",
                buttons: {
                    main: {
                        label: "OK",
                        className: "btn-default",
                        callback: function() {
                            App.adminview.locationSwitch();
                        }
                    }
                }
            });

            return;
        }



        if(touchPointList.length === 0){
            $('#touchpointDepartmentListGroup').html('Click the + icon above to add your first TouchPoint.');
            return;
        }

        //save the touchpointList for later usage
        App.adminview.touchpointList = touchPointList;

        //build a unique list of Departments
        var theDepartments = [];

        touchPointList.forEach(function(touchPoint) {

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

            s +=    '<a id="touchPointDepartment" href="#" class="list-group-item clearfix" data-department="' + item + '">';
            s +=        item ;
            s +=    '</a>';

        });

        $('#touchpointDepartmentListGroup').html(s);


        $('#touchpointCategoriesListGroup').html('<p>Click on any Department</p>');

    },

    //******************************************************************************************************************
    touchPointDepartmentClicked: function(e){

//        this.activeTPDepartmentID = e.currentTarget.getAttribute('data-departmentid');
        this.activeTPDepartment = e.currentTarget.getAttribute('data-department');

        //clear out any previously set active class
        $('#touchpointDepartmentListGroup > a').each(function () { $(this).removeClass('active') });

        //set the clicked item to active
        $(e.currentTarget).addClass("active");

        //show the add category icon
        $('#addTPCategoryIcon').show();

        //hide the sub-category add icon
        $('#addTPSubCategoryIcon').hide();

        //hide the sub-category add icon
        $('#addTPSubCategoryIcon').hide();

        //build a unique list of Touch Point Categories for this Touch Point Department
        var theCategories = [];

        App.adminview.touchpointList.forEach(function(touchPoint) {

            if(touchPoint.department === App.adminview.activeTPDepartment){
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

        //save the lsit of Categories so we can use them later
        App.adminview.touchpointCategories = theCategories;

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


            s +=    '<a id="touchPointCategory" href="#" class="list-group-item clearfix" data-category="' + item  +'">';
            s +=        item ;
            s +=        '<span class="pull-right">';
            s +=            '<button id="tpCategoryTrash'+ itemID +'" class="btn btn-xs btn-default">';
            s +=                '<span id="tpCategoryTrash" class="glyphicon glyphicon-trash"></span>';
            s +=            '</button>';
            s +=        '</span>';
            s +=    '</a>';

        });

        $('#touchpointCategoriesListGroup').html(s);

        //hide all the category trash icons
        App.adminview.showTPCategoryTrashIcon(-1);


        $('#touchpointSubCategoriesListGroup').html('<p>Click on any Category</p>');

    },

    //******************************************************************************************************************
    touchPointCategoryClicked: function(e){

        //this.activeTPCategoryID = e.currentTarget.getAttribute('data-categoryid');
        this.activeTPCategory = e.currentTarget.getAttribute('data-category');

        //was it the trash icon that was clicked?
        if(e.target.id.indexOf('tpCategoryTrash') != -1){
            //it was the trash
            this.deleteTPCategory(this.activeTPCategoryID,this.activeTPCategory);
            return;
        }

        //clear out any previously set active class
        $('#touchpointCategoriesListGroup > a').each(function () { $(this).removeClass('active') });

        //set the clicked item to active
        $(e.currentTarget).addClass("active");

        //show the trash icon
        this.showTPCategoryTrashIcon(this.activeTPCategory);

        //show the add sub-category icon

        $('#addTPSubCategoryIcon').show();

        //build the list of sub-categories for this category
        var theSubCategories = [];
        App.adminview.touchpointList.forEach(function(touchPoint) {

            if(touchPoint.department === App.adminview.activeTPDepartment && touchPoint.category === App.adminview.activeTPCategory){
                if (theSubCategories.indexOf(touchPoint.subcategory) === -1){
                    if (touchPoint.subcategory){
                        theSubCategories.push(touchPoint.subcategory);
                    }
                }
            }

        });


        if(theSubCategories.length === 0){
            $('#touchpointSubCategoriesListGroup').html('<p>Click the + icon above to add a Sub-Category for this Category</p>');
        }
        else{
            //sort the sub categories
            theSubCategories.sort(function(a, b){
                var catA= a.toLowerCase(), catB= b.toLowerCase()
                if (catA < catB) //sort string ascending
                    return -1
                if (catA > catB)
                    return 1
                return 0 //default return value (no sorting)
            });

            App.adminview.touchpointSubCategories = theSubCategories;

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

                s +=    '<a id="touchPointSubCategory" href="#" class="list-group-item clearfix" data-subcategory="' + item + '">';
                s +=        item ;
                s +=        '<span class="pull-right">';
                s +=            '<button id="tpSubCategoryTrash'+ itemID +'" class="btn btn-xs btn-default">';
                s +=                '<span id="tpSubCategoryTrash" class="glyphicon glyphicon-trash"></span>';
                s +=            '</button>';
                s +=        '</span>';
                s +=    '</a>';


            });

            $('#touchpointSubCategoriesListGroup').html(s);

            //hide all the category trash icons
            App.adminview.showTPCategoryTrashIcon(-1);

            //hide all the sub-category trash icons
            App.adminview.showTPSubCategoryTrashIcon(-1);

        }


    },

    //******************************************************************************************************************
    showTPCategoryTrashIcon: function(selectedCategory){

        App.adminview.touchpointCategories.forEach(function(item){

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

        var self = this;

        bootbox.prompt("Add Department", function(result) {
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

                bootbox.prompt("Please create the first Category for the " + newTouchpointDepartment + " department.", function(result){
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

                        var newTouchpointListItem = {department: newTouchpointDepartment, category: newTouchpointCategory, subcategory: ' '}
                        awsConnector.addTouchpointListItem(newTouchpointListItem, App.adminview.addTouchpointListItemReturned);
                    }
                });
            }
        });
    },

    //******************************************************************************************************************
    addTouchpointListItemReturned: function (success) {

        if(success){
            App.adminview.touchpointsTabClicked();
            return;
        }
        bootbox.dialog({
            message: 'Please double check that you are connected to the internet and try again.<br><br>Error Code: av-atplir-001.<br><br>Error= ' + err,
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


        bootbox.prompt("Add a Category to the "+ App.adminview.activeTPDepartment +" Department:", function(result){
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

                var newTouchpointListItem = {department: App.adminview.activeTPDepartment, category: newTouchpointCategory, subcategory: ' '}
                awsConnector.addTouchpointListItem(newTouchpointListItem, App.adminview.addTouchpointListItemReturned);
            }
        });
    },

    //******************************************************************************************************************
    deleteTPCategory: function(id,name){

        bootbox.dialog({
            message: "<h4>Are you sure you want to delete the Touch Point Category:<br><br><strong>" + name + "</strong></h4><br><br>This delete cannot be undone",
            title: "Delete TouchPoint Category?",
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
                        App.adminview.touchpointList.forEach(function (touchpoint) {
                            if(App.adminview.activeTPDepartment === touchpoint.department){
                                //the department matches
                                if (App.adminview.activeTPCategory === touchpoint.category){
                                    //and, the category matches
                                    awsConnector.deleteTouchpointListItem(globals.theLocationID, touchpoint.touchPointID, App.adminview.touchpointDeleteReturned)
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
            App.adminview.touchpointsTabClicked();
            return;
        }
        else{
            //delete failed
            bootbox.alert("There was an error deleting that Touchpoint.<br><br>Error Code: amv-tpdr-001<br><br>Error Info: " + error);
        }

    },

    //******************************************************************************************************************
    addTPSubCategory: function(){

        bootbox.prompt("Add a Sub-Category to the "+ App.adminview.activeTPCategory +" Category:", function(result) {
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

                var newTouchpointListItem = {department: App.adminview.activeTPDepartment, category: App.adminview.activeTPCategory, subcategory: newTouchpointSubCategory}
                awsConnector.addTouchpointListItem(newTouchpointListItem, App.adminview.addTouchpointListItemReturned);

            }
        });


    },

    //******************************************************************************************************************
    showTPSubCategoryTrashIcon: function(selectedSubCategory){

        App.adminview.touchpointSubCategories.forEach(function(item){

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
    touchPointSubCategoryClicked: function(e){

        //var activeTPSubCategoryID = e.currentTarget.getAttribute('data-subcategoryid');
        var activeTPSubCategory = e.currentTarget.getAttribute('data-subcategory');

        App.adminview.activeTPSubCategory = activeTPSubCategory;

        //was it the trash icon that was clicked?
        if(e.target.id.indexOf('tpSubCategoryTrash') != -1){
            //it was the trash
            this.deleteTPSubCategory(App.adminview.activeTPSubCategory);
            return;
        }

        //clear out any previously set active class
        $('#touchpointSubCategoriesListGroup > a').each(function () { $(this).removeClass('active') });

        //set the clicked item to active
        $(e.currentTarget).addClass("active");

        //show the trash icon
        this.showTPSubCategoryTrashIcon(activeTPSubCategory);

    },

    //******************************************************************************************************************
    deleteTPSubCategory: function(name){

        bootbox.dialog({
            message: "<h4>Are you sure you want to delete the Touch Point Sub-Category:<br><br><strong>" + name + "</strong></h4><br><br>This delete cannot be undone",
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
                        App.adminview.touchpointList.forEach(function (touchpoint) {
                            if(App.adminview.activeTPDepartment === touchpoint.department){
                                //the department matches
                                if (App.adminview.activeTPCategory === touchpoint.category){
                                    //and, the category matches
                                    if(App.adminview.activeTPSubCategory === touchpoint.subcategory){
                                        //and, the subcategory matches
                                        if(App.adminview.touchpointSubCategories.length === 1){
                                            //if there's only one subcategory, then update the touchpoint
                                            var updatedTouchpointListItem = {touchPointID: touchpoint.touchPointID, department: touchpoint.department, category: touchpoint.category, subcategory: ' '};
                                            awsConnector.updateTouchpointListItem(updatedTouchpointListItem, App.adminview.touchpointDeleteReturned);
                                        }
                                        else{
                                            //if there is more than one subcategory, then delete the touchpoint
                                            awsConnector.deleteTouchpointListItem(globals.theLocationID, touchpoint.touchPointID, App.adminview.touchpointDeleteReturned);
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
        $('#methodOfServiceListGroup2').html('Loading Methods Of Service');

        //fetch the Methods of Service for this location
        awsConnector.fetchMethodsOfService(App.adminview.buildMOSList);

    },

    //******************************************************************************************************************
    buildMOSList: function(mosArray){


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
            listHTML += '          <span class="h4">'+ item.methodOfServiceName + '<a class="pointer text-danger" onclick="App.adminview.deleteMethodOfService_AWS(&#39;'+ item.theLocation + '&#39;, &#39;'+ item.methodOfServiceID + '&#39;, &#39;'+ item.methodOfServiceName + '&#39;)"><i class="fa fa-trash-o pull-right "></i></a></span>';
            listHTML += '       </li>';

        });

        listHTML += '   </ul>';

        $('#methodOfServiceListGroup2').html(listHTML);
    },

    //******************************************************************************************************************
    showMethodOfServiceTrashIcon: function(id){

        App.methodofservicecollection.models.forEach(function(item){

            if(id.toString() === item.get('id')){
                $('#methodofserviceTrashBTN'+ item.get('id')).show() ;
            }
            else{
                $('#methodofserviceTrashBTN'+ item.get('id')).hide() ;
            }

        });

    },

    //******************************************************************************************************************
    methodOfServiceClicked: function(e){

        //was it the trash icon that was clicked?
        if(e.target.id.indexOf('methodofserviceTrashBTN') != -1){
            //it was the trash
            this.deleteMethodOfService(e.currentTarget.getAttribute('data-methodofserviceid'),e.currentTarget.getAttribute('data-methodofservice'));
            return;
        }

        //clear out any previously set active class
        $('#methodOfServiceListGroup > a').each(function () { $(this).removeClass('active') });

        //set the clicked item to active
        $(e.currentTarget).addClass("active");


        //show the trash icon
        this.showMethodOfServiceTrashIcon(e.currentTarget.getAttribute('data-methodofserviceid'));

    },

    //******************************************************************************************************************
    addMethodOfService: function(){
        //TODO: Once all customers MOS's are on AWS, delete this function
        var self = this;

        bootbox.prompt("Add a new Method Of Service", function(result) {
            if (result === null) {
                //alert("Prompt dismissed");
            } else {
                //alert("New Method Of Service is: "+result);
                if(result === ''){

                    return;
                }

                var methodofservicemodel = new App.methodOfServiceModel({
                    customerID: globals.customer.customerID,
                    methodofservice: result

                });

                methodofservicemodel.save();
                bootbox.hideAll();

                loading("show",null,"Saving",750,true);

                //wait one second for the save to complete, and then reload things
                var _aTimer = setTimeout(function(){self.methodsOfServiceTabClicked()},1000*1);

                return false;

            }
        });

    },

    //******************************************************************************************************************
    addMOS_AWS: function(){
        var self = this;

        bootbox.prompt("Add a new Method Of Service", function(result) {
            if (result === null) {
                //alert("Prompt dismissed");
            } else {
                //alert("New Method Of Service is: "+result);
                if(result === ''){

                    return;
                }

                //add the new MOS to AWS
                awsConnector.saveMethodOfService(result, App.adminview.methodsOfServiceTabClicked)

                bootbox.hideAll();

                loading("show",null,"Saving",750,true);

                return false;

            }
        });

    },

    //******************************************************************************************************************
    deleteMethodOfService: function(id,name){
        //TODO: Once all customers MOS's are on AWS, delete this function
        var self = this;


        bootbox.dialog({
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
                    className: "btn-warning",

                    callback: function(e) {



                        var methodOfServiceModel = new App.methodOfServiceModel({
                            id: id

                        });

                        methodOfServiceModel.sync('delete');

                        loading("show",null,"Deleting",750,false);

                        //wait one second for the delete to complete, and then reload things
                        var _aTimer = setTimeout(function(){self.methodsOfServiceTabClicked()},1000*1);

                        //return false;


                    }
                }
            }
        });





    },

    //******************************************************************************************************************
    deleteMethodOfService_AWS: function(theLocation, methodOfServiceID, name){

        bootbox.dialog({
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
                    className: "btn-warning",

                    callback: function(e) {

                        awsConnector.deleteMethodOfService(theLocation, methodOfServiceID, App.adminview.methodsOfServiceTabClicked)

                        loading("show",null,"Deleting",750,false);

                    }
                }
            }
        });

    },

    /***************************************************************************/
    /*iQueue Mobile Tab*/

    //******************************************************************************************************************
    resetMobileSettings: function(){

        $('#allowedDomainsInput').val(globals.customer.allowedDomains);

        $('#saveChangesMobileSettings').addClass('disabled');

    },

    //******************************************************************************************************************
    saveChangesMobileSettings: function(){
        //console.log('saveChangesMobileSettings called');

        awsConnector.updateAllowedDomains($('#allowedDomainsInput').val(),App.adminview.allowedDomainsUpdated);

    },


    /***************************************************************************/

    //******************************************************************************************************************
    allowedDomainsUpdated: function(){
        //update the local globals.customer with the same changes
        globals.customer.allowedDomains =  $('#allowedDomainsInput').val() ;

        //and disable the Save button since the changes have been saved
        $('#saveChangesMobileSettings').addClass('disabled');
    }




    //******************************************************************************************************************
    //******************************************************************************************************************
};