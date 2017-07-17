
myApp.onPageInit('theDisplay', function (page) {

    theDisplayPage.mySwiper = myApp.swiper('.swiper-container', {
        speed: 1000,
        effect: 'cube',
        cube: {
            shadow: false
        },
        grabCursor: true
    });

    //Get the animated footer going
    $('.tlt').textillate({  loop: true,
        minDisplayTime: 4000,
        in: {
            effect: 'flipInX',
            delayScale: 1,
            delay: 10,
            sync: false,
            shuffle: false,
            reverse: false,
            callback: function () {}
        },

        // out animation settings.
        out: {
            effect: 'flipOutX',
            delayScale: 1,
            delay: 10,
            sync: false,
            shuffle: false,
            reverse: false,
            callback: function () {}
        }
    });
    //and show it
    $('#bottomTickerBar').show();

    theDisplayPage.announceSound = document.createElement('audio');

});

myApp.onPageBeforeAnimation('theDisplay', function(page) {

    //save off the selected location so we can use it later
    globals.setPersistentGlobal('theLocationID', page.query.location);

    //make sure the launchURL has a location embedded in it
    if(globals.launchURL.indexOf('locationCode') === -1){
        //there's not already a locationCode in the launchURL
        globals.launchURL = globals.launchURL + '&locationCode=' + page.query.location
    }
    //and permanently save it so we can use it after a browser refresh
    globals.setPersistentGlobal('launchURL', globals.launchURL);

    //customize the app skin for this location
    cobaltfireUtils.setCustomSkin();

    //if we don't already have the locations, fetch them
    if(globals.theLocationsArray.length === 0){
        //need to fetch the locations
        awsConnector.fetchCustomerLocationsTable(theDisplayPage.fetchLocationsDone);
    }
    else{
        //already have the locations
        theDisplayPage.fetchLocationsDone();
    }

});

myApp.onPageAfterAnimation('theDisplay', function(page) {

    $('#waitingListBackground').show('slow');

});

var theDisplayPage = {

    mySlider:  null,
    displayMessagesArray:   [],
    inlineTimer:    -1,
    slideTimer: -1,
    announceSound: null,

    //******************************************************************************************************************
    fetchLocationsDone: function(){
        //pull the location name out of the locations array
        var tempArray = globals.theLocationsArray.filter(function (el) {
            return el.locationID === globals.theLocationID ;
        });

        globals.setPersistentGlobal('theLocationName', tempArray[0].name);
        globals.setPersistentGlobal('theLocationSubName', tempArray[0].subName);

        globals.theLocation = tempArray[0];

        $('#displayHeaderTitle').html(globals.theLocationName + ' : ' + globals.theLocationSubName );

        $('#statusLabel').html('<i class="fa fa-spinner fa-spin"></i> Fetching Display Messages');

        awsConnector.fetchDisplayMessages(globals.theLocationID, theDisplayPage.showMessages);

        theDisplayPage.fetchWaitingQueue();

        theDisplayPage.pollNotificationsQueue();

    },

    //******************************************************************************************************************
    pollNotificationsQueue: function () {

        //console.log('pollNotificationsQueue() called');

        awsConnector.fetchNotifications(globals.theLocationID, theDisplayPage.notificationsReturned);


    },

    //******************************************************************************************************************
    notificationsReturned: function (notifications) {

        //sort the notifications by create time
        notifications.sort(function(a, b){
            var createTimeA=a.notificationObject.createTime, createTimeB=b.notificationObject.createTime
            if (createTimeA < createTimeB) //sort  ascending
                return -1
            if (createTimeA > createTimeB)
                return 1
            return 0 //default return value (no sorting)
        });


        //delete the first notification if it's older than 5 minutes
        if (notifications.length > 0){

            var maxAge = cobaltfireUtils.calibratedDateTime().getTime() - 1000*60*5;

            if (notifications[0].notificationObject.createTime < maxAge ){
                // it's old, so delete it from AWS
                awsConnector.deleteNotification(notifications[0].locationID, notifications[0].notificationID);
                //poll again in 1 seconds
                setTimeout(theDisplayPage.pollNotificationsQueue,1000);
                return;
            }
        }



        //filter to just the notifications for the display
        notifications = notifications.filter(function (notification) {
            return notification.notificationObject.destination === 'display' ;
        });

        //filter to just the notifications for type nowserving
        notifications = notifications.filter(function (notification) {
            return notification.notificationObject.type === 'nowserving' ;
        });

        if (notifications.length === 0){
            //none of the notifications were for the display with type nowserving
            //poll again in 2 seconds
            setTimeout(theDisplayPage.pollNotificationsQueue,2000);
            return;
        }



        //see if there is a notification that has not yet been presented on this display
        var browserFingerprint = $.fingerprint();
        var theNotification = null;
        for (i = 0; i < notifications.length; i++) {
            if (notifications[i].notificationObject.presentedArray.indexOf(browserFingerprint) === -1){
                //this notification has never been presented on this display
                theNotification = notifications[i];
                break;
            }
        }

        if (!theNotification){
            //we got through the loop above without identifying an undisplayed notification
            //poll again in 2 seconds
            setTimeout(theDisplayPage.pollNotificationsQueue,2000);
            return;
        }


        // Check first, if we already have opened picker
        if ($$('.picker-modal.modal-in').length > 0) {
            myApp.closeModal('.picker-modal.modal-in');
        }

        switch(theNotification.notificationObject.style) {
            case 'silent':
                //don't play any sound
                break;
            case 'ding':
                //play a sound
                theDisplayPage.announceSound.setAttribute('src', 'sounds/display_announce_sound.mp3');
                theDisplayPage.announceSound.play();
                break;
            case 'voice':
                //play Now Serving, then NameCoach if there
                theDisplayPage.announceSound.setAttribute('src', 'sounds/now_serving.mp3');

                //call NameCoach to see if we have a record there

                if(theNotification.notificationObject.email){
                    var email_list = theNotification.notificationObject.email;


                    if (email_list === '?'){
                        theDisplayPage.announceSound.play();
                    }
                    else{
                        var nameCoachURL = 'https://www.name-coach.com/api/private/v3/names/search';
                        var auth_token = 'jMBZ99XRE_CyzpY9tTuK';
                        nameCoachURL = nameCoachURL + '/?auth_token=' + auth_token + '&email_list=' + email_list;

                        $.ajax({
                            dataType : 'json',
                            url: nameCoachURL,
                            type: 'post',
                            success: function(results) {

                                if(results.data.length >0){
                                    if (results.data[0].recording_link){
                                        //this student has a NameCoach entry
                                        theDisplayPage.announceSound.play();

                                        setTimeout(function(){
                                            theDisplayPage.announceSound.setAttribute('src', results.data[0].recording_link);
                                            theDisplayPage.announceSound.play();
                                            }, 1750);


                                    }
                                    //this student has requested a call, but not completed it yet
                                    theDisplayPage.announceSound.play();
                                }
                                else{
                                    //no NameCoach Entry
                                    theDisplayPage.announceSound.play();
                                }

                            },
                            error: function (request, status, error) {

                            }
                        });
                    }



                }


                break;
            default:
            //don't play any sound
        }



        //display the first notification

        var name = theNotification.notificationObject.name;
        var message = theNotification.notificationObject.message;

        myApp.pickerModal(
            '<div class="picker-modal" style="background: white">' +
                '<div class="toolbar">' +
                    '<div class="toolbar-inner" style="background: '+ globals.theLocation.NavBarBackgroundColor +'">' +
                        '<div class="left"></div>' +
                        '<div class="center now-serving-header" style="color: '+ globals.theLocation.NavBarTextColor +'">Now Serving</div>'+
                        '<div class="right"></div>' +
                    '</div>' +
                '</div>' +
                '<div class="picker-modal-inner" >' +
                    '<div class="content-block center-text">' +
                        '<p class="now-serving-name">'+ name +'</p>' +
                        '<p class="now-serving-message">'+ message +'</p>' +
                    '</div>' +
                '</div>' +
            '</div>'
        );

        //show the announcement background
        $$('#announcementBackground').show();

        //record that this message has been displayed on this screen

        if (theNotification.notificationObject.presentedArray.indexOf(browserFingerprint) === -1){
            theNotification.notificationObject.presentedArray.push(browserFingerprint);
            awsConnector.updateNotification(theNotification);
        }

        //poll again in 17 seconds
        setTimeout(theDisplayPage.pollNotificationsQueue,17000);

        //close it in 15 seconds
        setTimeout(function () {
            myApp.closeModal('.picker-modal.modal-in');
            //show the announcement background
            $$('#announcementBackground').hide();
        },15000);

    },

    //******************************************************************************************************************
    showMessages: function(displayMessages){

        if(!displayMessages){
            // no display messages were returned, and that means the fetch from AWS failed
            //try again in 30 seconds
            setTimeout(awsConnector.fetchDisplayMessages, 30*1000, globals.theLocationID, theDisplayPage.showMessages);
            return;
        }

        //make sure all the slides have a slidePosition value
        //needed since slidePosition was added later, and some DB records might not have a value.
        for (i = 0; i < displayMessages.length; i++) {

            if (!displayMessages[i].slidePosition ){
                displayMessages[i].slidePosition = i+1;
            }

        }

        //sort theDisplaySlides by position
        displayMessages.sort(function(a, b){return a.slidePosition-b.slidePosition});

        //store what was returned so we can use it in other functions
        theDisplayPage.displayMessagesArray = displayMessages;

        theDisplayPage.mySwiper.removeAllSlides();

        if( displayMessages.length === 0){
            //no messages have been defined for this location
            theDisplayPage.mySwiper.appendSlide('<div class="swiper-slide" ><div class="swiper-slide-message swiper-slide-warning-message"><br>No Display Messages have been entered for this location.<br><br></div></div>');
            setTimeout(awsConnector.fetchDisplayMessages, 30*1000, globals.theLocationID, theDisplayPage.showMessages);
            return;
        }

        var slideWidth = $('#swiper-container').width();

        //build the slides
        for (i = 0; i < displayMessages.length; i++) {
            theDisplayPage.mySwiper.appendSlide(iQueueUtils.buildDisplaySlide(displayMessages[i],slideWidth));
        }

        //set a timer for transitioning to the next slide

        theDisplayPage.slideTimer = setTimeout(theDisplayPage.showNextSlide,displayMessages[0].displayTime*1000);

    },

    //******************************************************************************************************
    showNextSlide: function(){

        //see if we're already on the last slide
        if(theDisplayPage.mySwiper.activeIndex === theDisplayPage.displayMessagesArray.length-1){
            //we're at the end
            //move to the first slide
            theDisplayPage.mySwiper.slideTo(0);
            //so, fetch the list of slides again.
            awsConnector.fetchDisplayMessages(globals.theLocationID, theDisplayPage.showMessages);

            return;
        }

        //set a timer for transitioning to the next slide
        theDisplayPage.slideTimer = setTimeout(theDisplayPage.showNextSlide,theDisplayPage.displayMessagesArray[theDisplayPage.mySwiper.activeIndex+1].displayTime*1000);

        //move to the next slide
        theDisplayPage.mySwiper.slideNext();

    },

    //******************************************************************************************************
    // fetch the list of folks who are waiting
    fetchWaitingQueue: function(){

        clearTimeout(theDisplayPage.inlineTimer);

        //track a heartbeat
        awsConnector.trackHeartbeat('Display');

        //Test to see if the Display needs a browser refresh
        //only check before 1am
        var now = cobaltfireUtils.calibratedDateTime();
        //console.log(now.getHours());
        if(now.getHours() === 0) {

            //check to see how long it's been since we reloaded
            if (now.getTime() - globals.endpointLoadTime.getTime() > 1000 * 60 * 60 * 2) {
                //it's been greater than 2 hours
                globals.endpointLoadTime = cobaltfireUtils.calibratedDateTime();
                app.reloadDisplay();
            }
        }

        //as a backup in case the machine was in sleep mode in the middle of the night
        //check to see how long it's been since we reloaded
        if(now.getTime() - globals.endpointLoadTime.getTime() > 1000*60*60*24){
            //it's been greater than 24 hours
            globals.endpointLoadTime = cobaltfireUtils.calibratedDateTime();
            app.reloadDisplay();
        }

        var minutesElapsed = Math.round((now.getTime() - globals.endpointLoadTime.getTime()) /60/1000);
        $('#statusLabel').html('<i class="fa fa-heartbeat"></i> ' + minutesElapsed);

       awsConnector.fetchWaitTime(theDisplayPage.drawWaitingInfoAWS);

        //do it again in 30 seconds
        theDisplayPage.inlineTimer = setTimeout(theDisplayPage.fetchWaitingQueue,30000);


    },

    //******************************************************************************************************
    drawWaitingInfoAWS: function(theQueue){

        //set some default text in the footer
        $('#waitTimeDisplay1').html('There currently is nobody in line.');
        $('#waitTimeDisplay2').html("Get in line now, and we'll see you right away");

        //and set some footer text if there are people in line
        if(theQueue.length > 0){
            if(theQueue.length === 1){
                $('#waitTimeDisplay1').html('There is currently 1 person in line.');
            }
            else{
                $('#waitTimeDisplay1').html('There are currently ' + theQueue.length + ' people in line.');
            }


            $('#waitTimeDisplay2').html("The current estimated wait time is " + Math.round(theQueue[0].waitTime/1000/60) + ' Minutes');
        }

        //and show the list of waiting students

        $('#waitingList').html('<h2 class="waiting waitingTop">Currently Waiting</h2>');

        for (var i = 0; i < theQueue.length; i++) {

            var aCustomer = "";

            var signOnSource = theQueue[i].signonsource;

            if(signOnSource === 'mobile'){
                aCustomer += '<i class="fa fa-mobile" style="color: #56b8ff" ></i> '
            }

            aCustomer += theQueue[i].firstName.substr(0,10);
            aCustomer += " " + theQueue[i].lastName.substr(0,10);

            var theElement = '<h2 id="'+ theQueue[i].personID +'" class="waiting swing ">'+ aCustomer +'</h2>'
            $('#waitingList').append(theElement);
        }

        setTimeout(function() {theDisplayPage.animateWaitingListAWS(0,theQueue)}, 500);


    },

    //******************************************************************************************************
    animateWaitingListAWS: function(i, theQueue){

        if(theQueue.length === 0){return};

        var theElementID = '#' + theQueue[i].personID ;
        $(theElementID).addClass('swingShow');

        if(i < theQueue.length - 1){
            setTimeout(function() {theDisplayPage.animateWaitingListAWS(i+1,theQueue)}, 500);
        }

    }

    //******************************************************************************************************************
    //******************************************************************************************************************

};