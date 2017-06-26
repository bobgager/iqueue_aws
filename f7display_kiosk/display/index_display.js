
// Initialize Framework7
var myApp = new Framework7({
    swipeBackPage: false,
    pushState: true,
    modalTitle: 'iQueue',
    animateNavBackIcon:true
});


// If we need to use custom DOM library, let's save it to $$ variable:
var $$ = Dom7;

var mainView = myApp.addView('.view-main', {
    dynamicNavbar: true,
    // disable Dom Cache so pages don't double load (framework7 bug?)
    domCache: false

});

myApp.onPageAfterAnimation('index', function(page) {


    //app.initializeCloud();

});


var app = {

    checkViewPortTimer: -1,

/**********************************************************************************************************************/
    // Application Constructor
    initialize: function() {

        //make sure we don't have a wacky URL which probably resulted from a browser refresh
        if(window.location.href.indexOf('pages') === -1){
            globals.isDisplay = true;

            globals.setPersistentGlobal('launchURL', window.location.href);

            //show the version number in the UI
            $('#versionLabel').html(globals.version_Display);

            app.initializeCloud();

            return;
        }

        //we have a wacky URL
        //so, relaunch with a good one
        freshStart();

    },


    /******************************************************************************************************************/
    initializeCloud: function() {

        //let's initialize AWS
        awsConnector.initializeAWS(app.fetchAppParameters);



    },

    /******************************************************************************************************************/
    fetchAppParameters: function(){

        //and fetch the configuration parameters
        awsConnector.fetchAppConfig(app.appParametersReturned);

        //need to wait until we have config, or a failure to get config before proceeding
    },

    /******************************************************************************************************************/
    appParametersReturned: function () {

        //app.initializeiQueue();
        app.viewportCheck(true);

    },



    //******************************************************************************************************
// make sure the screen is sized properly for the display
    viewportCheck: function (firstCall){
        //console.log('viewportCheck Called');

        var viewportH = verge.viewportH();
        var viewportW = verge.viewportW();

        //console.log('viewportW = ' + viewportW + ' and viewportH = '+ viewportH);

        //test for valid viewport dimensions
        var goodDimensions = false;

        if(viewportH === 720 && viewportW === 1280){
            goodDimensions = true;
        }

        if(viewportH === 1080 && viewportW === 1920){
            goodDimensions = true;
        }


        $('#sizer').show();

         if(!goodDimensions){

            $('#proceedAnywayBTN').show();
            $('#letsGoBTN').hide();
            $('#sizerDialog').removeClass('alert-success');
            $('#sizerDialog').addClass('alert-warning');
            $('#sizerMessage').html('For best results, your display should be set to 1280x720 or 1920x1080');

        }
        else{

            $('#proceedAnywayBTN').hide();
            $('#letsGoBTN').show();
            $('#sizerDialog').removeClass('alert-warning');
            $('#sizerDialog').addClass('alert-success');
            $('#sizerMessage').html("Good Job! Click Let's Go to get started");

            if(firstCall){
                clearTimeout(app.checkViewPortTimer);
                $('#sizer').hide();
                app.initializeiQueue();
                return;
            }


        }

        $('#widthLabel').html('<strong>Current Width: '+ viewportW + '</strong>');
        $('#heightLabel').html('<strong>Current Height: '+ viewportH+ '</strong>');



        //and keep checking periodically
        app.checkViewPortTimer = setTimeout(app.viewportCheck, 100);

    },



//******************************************************************************************************
// proceed with showing the display, even though the dimensions are wrong
    proceedAnyway: function (){
        clearTimeout(app.checkViewPortTimer);
        $('#sizer').hide('slow');
        app.initializeiQueue();
    },
//******************************************************************************************************
// proceed with showing the display
    letsGo: function (){
        clearTimeout(app.checkViewPortTimer);
        $('#sizer').hide('slow');
        app.initializeiQueue();
    },




    /******************************************************************************************************************/
    initializeiQueue: function() {

        //pull in the persistent globals from long term storage
        //globals.initPersistentGlobals();
        //no need to do that in the Kiosk

        //do a time check so we can calibrate the clock to the server time
         var now = cobaltfireUtils.calibratedDateTime();


        //show the appropriate page depending on the config code

        //Get the config code out of the URL Parameters
        globals.configCode = cobaltfireUtils.GetURLParameter('configCode');

        globals.theLocationIDfromURL = cobaltfireUtils.GetURLParameter('locationCode')


        if(!globals.configCode || globals.configCode === ''){
            //load up the configure page
            mainView.router.loadPage('pages/configure.html');
            return;
        }

        //we have a config code
        //so fetch the customer info for it
        awsConnector.fetchCustomerConfigByConfigCode(globals.configCode, app.customerReturned)

    },

    /******************************************************************************************************************/
    customerReturned: function(){
        if(globals.customer){

            //replace the loading message in case the user ever uses the Back button to get back to the Index page
            $('#index_LoadingMessage').html('<p><a href="#" class="button" onclick="freshStart();">Get Started</a></p>');


            //fetch the locations for this customer
            awsConnector.fetchCustomerLocationsTable(app.locationsReturned);

            return;
        }

        //the display was launched without a configCode in the URL, so go to the config page
        mainView.router.loadPage({url: 'pages/configure.html', animatePages: false});
    },

    /******************************************************************************************************************/
    locationsReturned: function(){
        //let's see if there's only one location
        if(globals.theLocationsArray.length === 1){
            //only one location, so let's auto pick it
            var thePage = 'pages/theDisplay.html?location='+ globals.theLocationsArray[0].locationID;
            mainView.router.loadPage({url: thePage, animatePages: false});
        }
        else{
            mainView.router.loadPage({url: 'pages/locationPicker.html', animatePages: false});

        }
    },

    /******************************************************************************************************************/
    reloadDisplay: function(){
        window.location = globals.launchURL;
    }

    /******************************************************************************************************************/


};


