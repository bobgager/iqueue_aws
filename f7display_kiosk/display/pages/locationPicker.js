
myApp.onPageInit('home', function (page) {

    //watch for these events



});

myApp.onPageBeforeAnimation('home', function(page) {

    //customize the app skin for this customer
    cobaltfireUtils.setCustomSkin();


    homePage.showLocations();

});

myApp.onPageAfterAnimation('home', function(page) {

    //let's see if there's only one location
    if(globals.theLocationsArray.length === 1){
        //only one location, so let's auto pick it
        var thePage = 'pages/theDisplay.html?location='+ globals.theLocationsArray[0].locationID;
        mainView.router.loadPage(thePage);
        return;
    }

    //let's see if a locationID was passed in as a URL parameter, and if so, pick it.
    if(globals.theLocationIDfromURL){

        //make sure it's a valid locationID
        for (var i = 0; i < globals.theLocationsArray.length; i++){
            //see if we have a match
            if(globals.theLocationsArray[i].locationID === globals.theLocationIDfromURL){
                //we've got a match
                thePage = 'pages/theDisplay.html?location='+ globals.theLocationIDfromURL;
                mainView.router.loadPage(thePage);
                return;
            }
        }


    }

});

var homePage = {


    //******************************************************************************************************************
    showLocations: function(){
        ///console.log("this customer has: " + globals.customer[0].get('locations').length + ' Locations');

        var theHTML = '';

/*        theHTML += '<div class="well text-center">';
        theHTML +=      'Please Select A Location';
        theHTML += '</div>';*/

        theHTML += '<div class="list-block media-list inset">';

        theHTML += '    <ul>';

/*        theHTML += '<!-- Divider -->';
        theHTML += '        <li class="item-divider">Please Select A Location</li>';*/

        //generate a list item for each location
        for (var i = 0; i < globals.theLocationsArray.length; i++) {
            theHTML += '        <li>';
            theHTML += '            <a href="pages/theDisplay.html?location='+ globals.theLocationsArray[i].locationID +'" class="item-link item-content">';
            theHTML += '                <div class="item-inner">';
            theHTML += '                    <div class="item-title-row">';
            theHTML += '                        <div class="item-title">'+ globals.theLocationsArray[i].name +'</div>';
            theHTML += '                        <div class="item-after">Go</div>';
            theHTML += '                    </div>';
            theHTML += '                    <div class="item-subtitle">'+ globals.theLocationsArray[i].subName +'</div>';

            if(globals.theLocationsArray[i].textLine2){
                theHTML += '                    <div class="item-text">'+ globals.theLocationsArray[i].textLine1 +'<br>'+ globals.theLocationsArray[i].textLine2 +'</div>';
            }
            else{
                theHTML += '                    <div class="item-text">'+ globals.theLocationsArray[i].textLine1 +'</div>';
            }

            theHTML += '                </div>';
            theHTML += '            </a>';
            theHTML += '        </li>';
        }

        theHTML += '    </ul>';
        theHTML += '</div>';


        $('#home_card_content_inner').html(theHTML);




    }

    //******************************************************************************************************************
    //******************************************************************************************************************

};