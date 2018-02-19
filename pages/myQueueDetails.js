/**
 * Created by bgager on 5/25/17.
 */

var myQueueDetailsPage = {

    theTouchPoints: [],

    pageURL: 'pages/myQueueDetails.html',



    //******************************************************************************************************************
    preLoad: function (callback) {
        //initialize anything that is required before the page gets rendered

        //go back to the router to actually load the page
        callback();
    },

    //******************************************************************************************************************
    postLoad: function () {
        //script that runs after the page has been loaded


        myQueueDetailsPage.render();

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

        //run the addTouchpointButtonTest to disable the Add Touchpoint button
        myQueueDetailsPage.addTouchpointButtonTest();

        myQueuePage.activeStudent.guid = myQueuePage.activeStudent.personID;

        myQueuePage.activeStudent.createDateTime = new Date(myQueuePage.activeStudent.createTime);

        myQueuePage.activeStudent.waitTime = utils.calibratedDateTime() - myQueuePage.activeStudent.createDateTime;



        //set the modal header/title
        $('#queueDetailsModallTitle').html(myQueuePage.activeStudent.firstName + '&nbsp;' + myQueuePage.activeStudent.lastName + '<span class="text-xs font-weight-normal text-muted">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<i class="far fa-clock pb-1" aria-hidden="true"></i> ' + Math.round(myQueuePage.activeStudent.waitTime/1000/60) + ' Minutes</span>');

        //show the extra kiosk question if there is one
        $('#extraKioskQuestionDisplay').hide()
        if (myQueuePage.activeStudent.extraKioskQuestionAnswer){
            if (myQueuePage.activeStudent.extraKioskQuestionAnswer.question !=='~'){
                $('#extraKioskQuestionDisplay').show();
                $('#extraKioskQuestionDisplay').html(myQueuePage.activeStudent.extraKioskQuestionAnswer.question + ' ' + myQueuePage.activeStudent.extraKioskQuestionAnswer.answer)
            }
        }

        //build the Category pulldown
        var selectHTML = '';
        for (i = 0; i < myQueuePage.theFAQCategories.length; i++) {
            if(myQueuePage.activeStudent.category === myQueuePage.theFAQCategories[i]){
                selectHTML += '<option value="'+myQueuePage.theFAQCategories[i]+'" selected>'+myQueuePage.theFAQCategories[i]+'</option> ' ;
            }
            else{
                selectHTML += '<option value="'+myQueuePage.theFAQCategories[i]+'">'+myQueuePage.theFAQCategories[i]+'</option> ' ;
            }
        }
        $('#queueDetails_CategorySelect').html(selectHTML);

        //show the students email
        $('#queueDetails_EmailInput_Label').html(myQueuePage.activeStudent.firstName +"'s Email:");
        var theEmail = myQueuePage.activeStudent.email;
        if(!theEmail){
            theEmail = '?';
        }
        if(theEmail.length === 0){
            theEmail = '?';
        }
        $('#queueDetails_EmailInput').val(theEmail)  ;

        //show the students cell phone number
        $('#queueDetails_CellPhone_Input_Label').html(myQueuePage.activeStudent.firstName +"'s Cell Phone #:");

        var cellPhone = myQueuePage.activeStudent.cellphone;
        if(!cellPhone){
            cellPhone = '?';
        }
        if(cellPhone.length === 0){
            cellPhone = '?';
        }
        $('#queueDetails_CellPhone_Input').val(cellPhone)  ;

        //show the students question
        $('#queueDetails_QuestionTextArea_Label').html(myQueuePage.activeStudent.firstName +"'s Question:");
        $('#queueDetails_QuestionTextArea').val(myQueuePage.activeStudent.question);

        //show the comments about this student
        $('#queueDetails_CommentsTextArea_Label').html("Comments about " + myQueuePage.activeStudent.firstName +"'s visit:");
        $('#queueDetails_CommentsTextArea').val(myQueuePage.activeStudent.comments);

        //loop through  myQueuePage.touchPointDepartments and build the list
        var selectHTML = '<option value="?" >?</option>';
        myQueuePage.touchPointDepartments.forEach(function(item){
            selectHTML += '<option value="'+ item +'">'+ item +'</option>';
        });
        $('#touchPointDepartmentDropdown').html(selectHTML);

        //hide the Category and Subcategory pulldowns for now
        $('#touchPointCategoryDropdown').hide();
        $('#touchPointSubCategoryDropdown').hide();


        //build the Methods Of Service list

        selectHTML = '<option>?</option>';
        myQueuePage.methodsOfService.forEach(function(item){
            selectHTML += '<option>'+item.methodOfServiceName+'</option>';
        });

        $('#touchPointMOSDropdown').html(selectHTML);


        //load up the touchpoints that have already been saved for this question
        awsDynamoDBConnector.fetchQuestionsTouchPoints(myQueuePage.activeStudent.personID, myQueueDetailsPage.questionsTouchPointsReturned);


        //set the modal buttons
        $('#queueDetailsModalReturnButton').html('<i class="fas fa-reply"></i>&nbsp;&nbsp;Return ' + myQueuePage.activeStudent.firstName + ' To The Queue')
        $('#queueDetailsNoShowButton').html('<i class="fas fa-times"></i>&nbsp;&nbsp;' + myQueuePage.activeStudent.firstName + ' Is A No Show')
        $('#queueDetails_Close_BTN').html('<i class="fas fa-check"></i> Done Helping '+ myQueuePage.activeStudent.firstName.substr(0,10)  );


    },

    //******************************************************************************************************************
    questionsTouchPointsReturned: function (touchpoints) {

        if(!touchpoints){
            //there was an error reading AWS
            //for now, do nothing
            //TODO think about if/how to handle this read error
            return;
        }

        //save the results so we can use them in the enableCompleteBTN function
        myQueueDetailsPage.theTouchPoints = touchpoints;

        //sort the touchpoints by createdAt
        touchpoints.sort(function(a, b){

            if (a.createTime > b.createTime) //sort  ascending
                return 1
            if (a.createTime < b.createTime)
                return -1
            return 0 //default return value (no sorting)
        });

        myQueueDetailsPage.enableCompleteBTN();

        var touchpointRows = '';

        if(touchpoints.length === 0){
            touchpointRows = '<tr id="touchPointRow0"><td class="text-center text-danger" colspan="7">Please set at least one TouchPoint</td></tr>';
        }
        else{

            touchpointRows = '<tr id="touchPointRow0" >' +
                '<td class="text-center" >'+touchpoints[0].tier+'</td>' +
                '<td class="text-center" >'+touchpoints[0].department+'</td>' +
                '<td class="text-center" >'+touchpoints[0].category+'</td>' +
                '<td class="text-center" >'+touchpoints[0].subcategory+'</td>' +
                '<td class="text-center" >'+touchpoints[0].methodofservice+'</td>' +
                '<td class="text-center" >'+touchpoints[0].quantity+'</td>' +
                '<td class="text-center" ><i id="deleteTouchPointBtn" style="cursor: pointer" class=" fas  fa-minus-circle " onclick="myQueueDetailsPage.deleteTouchPoint(&#39;'+touchpoints[0].createTime+'&#39;);"></i></td>' +
                '</tr>';

            for (i = 1; i < touchpoints.length; i++) {
                touchpointRows += '<tr id="touchPointRow'+i+'" class="aTouchpointRow">' +
                    '<td class="text-center" >'+touchpoints[i].tier+'</td>' +
                    '<td class="text-center" >'+touchpoints[i].department+'</td>' +
                    '<td class="text-center" >'+touchpoints[i].category+'</td>' +
                    '<td class="text-center" >'+touchpoints[i].subcategory+'</td>' +
                    '<td class="text-center" >'+touchpoints[i].methodofservice+'</td>' +
                    '<td class="text-center" >'+touchpoints[i].quantity+'</td>' +
                    '<td class="text-center" ><i id="deleteTouchPointBtn" style="cursor: pointer" class=" fas fa-minus-circle " onclick="myQueueDetailsPage.deleteTouchPoint(&#39;'+touchpoints[i].createTime+'&#39;);"></i></td>' +
                    '</tr>';
            }

        }

        //delete all the touchpoint rows of the table except for the first row
        //they will all have the class aTouchpointRow
        $( ".aTouchpointRow" ).remove();

        $( '#touchPointRow0' ).replaceWith( touchpointRows );



    },

    //******************************************************************************************************************
    enableCompleteBTN: function () {
        // make sure there is at least one touchpoint
        // and disable the Complete button if not

        if(!(myQueueDetailsPage.theTouchPoints.length === 0) || !$('#addTouchPointBtn').hasClass('hidden') ){
            //console.log('need to enable the Complete button');
            $("#queueDetails_Close_BTN").removeClass('disabled');
            $("#queueDetails_Close_BTN").addClass('btn-success');
            $("#queueDetails_Close_BTN").removeClass('btn-warning');
            $('#queueDetails_Close_BTN').html('<i class="fa fa-check"></i> Done Helping '+ myQueuePage.activeStudent.firstName.substr(0,10)  );
        }
        else{
            //console.log('need to disable the Complete button');
            $("#queueDetails_Close_BTN").addClass('disabled');
            $("#queueDetails_Close_BTN").removeClass('btn-success');
            $("#queueDetails_Close_BTN").addClass('btn-warning');
            $('#queueDetails_Close_BTN').html('Touchpoint?' );
        }
    },

    //******************************************************************************************************************
    returnToQueue: function () {

        myQueuePage.returnToQueue();
        //router.showPage('myQueuePage');


    },

    //******************************************************************************************************************
    close: function(){

        if((myQueueDetailsPage.theTouchPoints.length === 0) || $('#addTouchPointBtn').hasClass('hidden') ){
            //there are no saved touchpoints or a touchpoint ready to be saved

            bootbox.dialog({
                message: 'Please set at least one TouchPoint before trying to close this student',
                title: "TouchPoint Needed",
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


        //need to see if there's a pending touchpoint that needs to be saved
        if(!$('#addTouchPointBtn').hasClass('hidden')){
            App.queuedetailsview.addTouchPoint();
        }

        //make sure the email input is either ? or a valid email address
        if($('#queueDetails_EmailInput').val() != '?'){
            //validate email
            if(!cobaltfireUtils.validateEmail($('#queueDetails_EmailInput').val())){
                bootbox.alert("Please enter a valid Email Address for " + App.queuedetailsview.theQuestion.firstName);
                return;
            }
        }

        //make sure the cell phone input is either ? or a valid phone number
        if($('#queueDetails_CellPhone_Input').val() != '?'){
            //validate phone number
            if(!cobaltfireUtils.validatePhoneNumber($('#queueDetails_CellPhone_Input').val())){
                bootbox.alert("Please enter a valid Phone Number for " + App.queuedetailsview.theQuestion.firstName);
                return;
            }
        }

        //make sure the comments field isn't empty
        if($("#queueDetails_CommentsTextArea").val() === ''){
            $("#queueDetails_CommentsTextArea").val(' ');
        }

        //make sure the extraKioskQuestionAnswer isn't null
        if (!App.queuedetailsview.theQuestion.extraKioskQuestionAnswer){
            App.queuedetailsview.theQuestion.extraKioskQuestionAnswer = {question: '~', answer: '~'};
        }

        App.queuedetailsview.theQuestion.category = $("#queueDetails_CategorySelect").val();
        App.queuedetailsview.theQuestion.comments = $("#queueDetails_CommentsTextArea").val();
        App.queuedetailsview.theQuestion.email = $('#queueDetails_EmailInput').val();
        App.queuedetailsview.theQuestion.cellphone = $('#queueDetails_CellPhone_Input').val();

        //set the question as closed in iqOpenQueue
        awsConnector.setQuestionClosed(App.queuedetailsview.theQuestion,function(){App.router.navigate('queue',{trigger:true});});

        //save the question off to iqClosedQueue
        App.queuedetailsview.theQuestion.issueStatus = 'Closed';
        awsConnector.saveClosedQuestion(App.queuedetailsview.theQuestion, function () {} );

        //track the closure for our Daily Traffic Report
        App.queuedetailsview.trackTraffic('Closed', App.queuedetailsview.theQuestion.signonsource);

    },

    //******************************************************************************************************************
    addTouchpointButtonTest: function(){
        //look for a ? in any TouchPoint parameter
        //and show the Add button if there aren't any

        $('#addTouchPointBtn').removeClass('hidden');

        if($('#touchPointTierDropdown').val()== "?"){
            $('#addTouchPointBtn').hide('slow');
            $('#addTouchPointBtn').addClass('hidden');
            myQueueDetailsPage.enableCompleteBTN();
            return;
        }
        if($('#touchPointDepartmentDropdown').val()== "?"){
            $('#addTouchPointBtn').hide('slow');
            $('#addTouchPointBtn').addClass('hidden');
            myQueueDetailsPage.enableCompleteBTN();
            return;
        }
        if($('#touchPointCategoryDropdown').val()== "?"){
            $('#addTouchPointBtn').hide('slow');
            $('#addTouchPointBtn').addClass('hidden');
            myQueueDetailsPage.enableCompleteBTN();
            return;
        }
        if($('#touchPointSubCategoryDropdown').val()== "?"){
            $('#addTouchPointBtn').hide('slow');
            $('#addTouchPointBtn').addClass('hidden');
            myQueueDetailsPage.enableCompleteBTN();
            return;
        }
        if($('#touchPointMOSDropdown').val()== "?"){
            $('#addTouchPointBtn').hide('slow');
            $('#addTouchPointBtn').addClass('hidden');
            myQueueDetailsPage.enableCompleteBTN();
            return;
        }


        $('#addTouchPointBtn').show('slow');

        myQueueDetailsPage.enableCompleteBTN();

    },

    //******************************************************************************************************************
    touchpointDepartmentChanged:function(){

        if($('#touchPointDepartmentDropdown').val() === '?'){
            //no department was selected
            $('#touchPointCategoryDropdown').hide('slow');
            $('#touchPointSubCategoryDropdown').hide('slow');
            myQueueDetailsPage.addTouchpointButtonTest();
            return;
        }

        //build a unique list of Touch Point Categories for this Touch Point Department
        var theCategories = [];

        myQueuePage.touchPointList.forEach(function(touchPoint) {

            if(touchPoint.department === $('#touchPointDepartmentDropdown').val()){
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

        //loop through the categories and build the list
        selectHTML = '<option value="?">?</option>';
        theCategories.forEach(function(item){
            selectHTML += '<option value="'+ item +'">'+ item +'</option>';
        });

        $('#touchPointCategoryDropdown').html(selectHTML);
        $('#touchPointCategoryDropdown').show('slow');
        $('#touchPointSubCategoryDropdown').hide('slow');
        myQueueDetailsPage.addTouchpointButtonTest();

    },

    //******************************************************************************************************************
    touchpointCategoryChanged:function(){

        if($('#touchPointCategoryDropdown').val() === '?'){
            //no category was selected
            $('#touchPointSubCategoryDropdown').hide('slow');
            myQueueDetailsPage.addTouchpointButtonTest();
            return;
        }

        //build the list of sub-categories for this category
        var theSubCategories = [];
        myQueuePage.touchPointList.forEach(function(touchPoint) {

            if(touchPoint.department === $('#touchPointDepartmentDropdown').val() && touchPoint.category === $('#touchPointCategoryDropdown').val()){
                if (theSubCategories.indexOf(touchPoint.subcategory) === -1){
                    if (touchPoint.subcategory){
                        theSubCategories.push(touchPoint.subcategory);
                    }
                }
            }

        });

        if(theSubCategories.length === 0){
            //there are no subcategories for this category
            $('#touchPointSubCategoryDropdown').hide('slow');
            $('#touchPointSubCategoryDropdown').html(null);
            myQueueDetailsPage.addTouchpointButtonTest();
            return;
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

        //loop through the sub categories and build the list
        selectHTML = '<option value="?">?</option>';
        theSubCategories.forEach(function(item){
            selectHTML += '<option value="'+ item +'">'+ item +'</option>';
        });

        $('#touchPointSubCategoryDropdown').html(selectHTML);
        $('#touchPointSubCategoryDropdown').show('slow');
        myQueueDetailsPage.addTouchpointButtonTest();

    },

    //******************************************************************************************************************
    addTouchPoint: function(){

        //Save the Touchpoint to AWS iqTouchPoints

        var newTouchPoint = {};

        newTouchPoint.questionObjectID = myQueuePage.activeStudent.personID;
        newTouchPoint.customerID = globals.theCustomer.customerID;
        newTouchPoint.tier = Number($('#touchPointTierDropdown').val());
        newTouchPoint.department = $('#touchPointDepartmentDropdown').val();
        newTouchPoint.category = $('#touchPointCategoryDropdown').val();

        if($('#touchPointSubCategoryDropdown').val()){
            newTouchPoint.subcategory = $('#touchPointSubCategoryDropdown').val();
        }
        else{
            //if there was no subcategory, duplicate the category into the subcategory storage
            newTouchPoint.subcategory = newTouchPoint.category;
        }

        newTouchPoint.quantity = Number($('#touchPointQTYInput').val());
        newTouchPoint.methodofservice = $('#touchPointMOSDropdown').val();

        awsDynamoDBConnector.saveTouchPoint(globals.theLocation.locationID, newTouchPoint, myQueueDetailsPage.touchPointAdded);

    },

    //******************************************************************************************************************
    touchPointAdded: function(success){
        if(success){
            // Execute any logic that should take place after the Touchpoint is saved.

            //clear the New Touchpoint Inputs
            $("#touchPointTierDropdown").val("1");
            $("#touchPointDepartmentDropdown").val("?");
            myQueueDetailsPage.touchpointDepartmentChanged();
            $("#touchPointMOSDropdown").val("?");
            $("#touchPointQTYInput").val(1);

            myQueueDetailsPage.addTouchpointButtonTest();

            //reload the Touchpoints for this question
            awsDynamoDBConnector.fetchQuestionsTouchPoints(myQueuePage.activeStudent.personID, myQueueDetailsPage.questionsTouchPointsReturned);

        }
        else{
            bootbox.alert("Sorry, something went wrong while trying to save the TouchPoint.<br>Please try again.");
        }
    },

    //******************************************************************************************************************
    deleteTouchPoint: function(createTime){

        awsDynamoDBConnector.deleteTouchPoint(globals.theLocation.locationID, createTime, myQueueDetailsPage.loadQuestionsTouchpoints);

    },

    //******************************************************************************************************************
    loadQuestionsTouchpoints: function () {
        awsDynamoDBConnector.fetchQuestionsTouchPoints(myQueuePage.activeStudent.personID, myQueueDetailsPage.questionsTouchPointsReturned);
    }

    //******************************************************************************************************************
    //******************************************************************************************************************
};