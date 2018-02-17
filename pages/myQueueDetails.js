/**
 * Created by bgager on 5/25/17.
 */

var myQueueDetailsPage = {

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







        //set the modal buttons
        $('#queueDetailsModalReturnButton').html('<i class="fas fa-reply"></i>&nbsp;&nbsp;Return ' + myQueuePage.activeStudent.firstName + ' To The Queue')
        $('#queueDetailsNoShowButton').html('<i class="fas fa-times"></i>&nbsp;&nbsp;' + myQueuePage.activeStudent.firstName + ' Is A No Show')
        $('#queueDetails_Close_BTN').html('<i class="fas fa-check"></i> Done Helping '+ myQueuePage.activeStudent.firstName.substr(0,10)  );

        //$('#queueDetailsModal').modal({backdrop: 'static'});

    },

    //******************************************************************************************************************
    returnToQueue: function () {

        myQueuePage.returnToQueue();
        router.showPage('myQueuePage');


    }

    //******************************************************************************************************************
    //******************************************************************************************************************
};