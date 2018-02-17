/**
 * Created by bgager on 5/19/17.
 */
/*this is the secret js file that's added after the user has authenticated*/


var configure = {

    retryCount: 0,

    configure: function () {

        //show the other header content (which includes the mobile menu icon)
        $('#otherHeaderContent').show();

        $('#loading-iqueue-progress-bar').addClass('w-50');
        $('#loading-iqueue-progress-label').html('Loading scripts');

        var progress = 0;
        var scripts = ['assets/js/AWSDynamoDBConnector.js?version='+globals.version,
            'assets/js/router.js?version='+globals.version];
        scripts.forEach(function(script) {
            $.getScript(script, function () {
                if (++progress == scripts.length) configure.loadCustomerConfig();
            });
        });

    },

    //******************************************************************************************************************
    loadCustomerConfig:function () {

        $('#loading-iqueue-progress-bar').addClass('w-60');
        $('#loading-iqueue-progress-label').html("Fetching Customer Configuration");

        awsDynamoDBConnector.fetchCustomerConfig(globals.cognitoUserAttributes.customerID, function (success, data) {
            if (success) {
                globals.theCustomer = data;
                configure.fetchLocations();
            }
            else {
                utils.fatalError('lcc001', 'Initial fetchcustomerConfig failed.');
            }
        })
    },

    //******************************************************************************************************************
    fetchLocations: function () {


        awsDynamoDBConnector.fetchCustomerLocationsTable(globals.cognitoUserAttributes.customerID,function (success, data) {
            if (success) {
                globals.theLocationsArray = data;
                locationManager.showLocationPicker(configure.loadMoreScripts);
            }
            else {
                utils.fatalError('fl001', 'Failed to fetch location information.<br>' + data);
            }
        });

    },

    //******************************************************************************************************************
    loadMoreScripts: function () {

        $('#loading-iqueue-progress-label').html('Loading more scripts');
        $('#loading-iqueue-progress-bar').addClass('w-70');

        var progress = 0;
        var scripts = ['pages/dashboard.js?version='+globals.version,
            'pages/myQueue.js?version='+globals.version,
            'pages/myQueueDetails.js?version='+globals.version,
            'pages/adminIqueue.js?version='+globals.version,
            'pages/adminUsers.js?version='+globals.version,
            'pages/userDetails.js?version='+globals.version,
            'pages/adminDisplay.js?version='+globals.version,
            'pages/adminDisplay_test.js?version='+globals.version,
            'pages/reports/studentSearch.js?version='+globals.version,
            'pages/reports/dailyTraffic.js?version='+globals.version,
            'pages/reports/studentList.js?version='+globals.version,
            'pages/reports/touchpoints.js?version='+globals.version,
            'pages/reports/agentMetrics.js?version='+globals.version];

        scripts.forEach(function(script) {
            $.getScript(script, function () {
                if (++progress == scripts.length) configure.testUserDetails();
            });
        });

    },

    //******************************************************************************************************************
    testUserDetails: function () {
        //need to verify that we have all the required information for this user, and if not, collect it from them.

        configure.retryCount = 0;
        //fetch this users details from DynamoDB
        awsDynamoDBConnector.fetchSingleUser(globals.cognitoUserAttributes.customerID, globals.cognitoUserAttributes.guidUserName, configure.userReturned);

    },

    //******************************************************************************************************************
    userReturned: function (success, results) {

        //console.log('userReturned and success = ' + success + ' and configure.retryCount = ' + configure.retryCount );

        if(!success){
            utils.writeDebug('<span class="text-warning">fetchSingleUser failed</span>');
            if (configure.retryCount < 3){
                configure.retryCount ++;
                utils.writeDebug('<span class="text-info">retrying fetchSingleUser</span>');
                awsDynamoDBConnector.fetchSingleUser(globals.cognitoUserAttributes.customerID, globals.cognitoUserAttributes.guidUserName, configure.userReturned);
                return;
            }
            else {
                utils.fatalError('cur001', results);
                return;
            }
        }

        //seems we have a user
        globals.theUser = results;


        //build the menu's
        configure.buildMenus();

        //if their status is still Invited, then it's the first time they have successfully signed in
        if (globals.theUser.status === "Invited"){
            //so, update their status to Active
            globals.theUser.status = "Active";
            //and store their username
            globals.theUser.username = globals.cognitoUserAttributes.userName;
            //and update the cloud
            awsDynamoDBConnector.update_iqUsers(globals.theUser, configure.userUpdated);
            return;
        }

        configure.userUpdated();

    },

    //******************************************************************************************************************
    userUpdated: function () {

        if (!userDetailsPage.userInfoComplete()){

            var options = {};
            options.title = "We'd like to get to know you better.";
            options.message = "There's a little more information we need to complete your account." ;
            options.buttonName = 'OK';
            options.callback = function () {
                $('#loading-iqueue-progress-label').html('Initialization Complete');
                $('#loading-iqueue-progress-bar').addClass('w-100');
                $('#loading-iqueue-progress').fadeOut(1000);

                setTimeout(function () {
                    userDetailsPage.render();
                },1000)

            };
            modalMessage.showMessage(options);
            return;
        }

        configure.showDashboard();
    },

    //******************************************************************************************************************
    showDashboard:function () {

        $('#loading-iqueue-progress-label').html('Initialization Complete');
        $('#loading-iqueue-progress-bar').addClass('w-100');
        $('#loading-iqueue-progress').fadeOut(2000);

        setTimeout(function () {
            router.showPage('dashboardPage')
        },2000)

    },

    //******************************************************************************************************************
    buildMenus:function () {

        $('#loading-iqueue-progress-label').html("Building Menu's");

        $('#mainNavbar').show();

        switch(globals.theUser.role) {
            case 'Creator':
                $('#admin-dropdown-menu').show();
                break;
            case 'Admin':
                $('#admin-dropdown-menu').show();
                break;
            default:
                //just a regular user
                $('#admin-dropdown-menu').hide();
        }

        //build the locations menu
        locationManager.configureMenu();

        //build the user menu
        $('#userMenuHeader').html(globals.theUser.firstName);

        var userMenuHTML = '' +
            '<a href="#" class="dropdown-item" onclick="userDetailsPage.render()"><i class="far fa-user dropdown-icon" aria-hidden="true"></i> My Profile</a>' +
            '<a href="#" class="dropdown-item" onclick="window.open(&#39;index_secure.htm?version=' + globals.version + '&#39;, &#39;_self&#39;);"><i class="fas fa-sign-out-alt dropdown-icon" aria-hidden="true"></i> Sign Out</a>' ;

        $('#userMenu').html(userMenuHTML);

        //need to cycle jPanelMenu to rebuild the side panel menu for smaller screens
        jPM.off();
        jPM.on();

    }

};

var app = {

    //******************************************************************************************************************
    launchDisplay: function () {

        window.open('display/display.htm?version='+ globals.version + '&configCode='+ globals.theCustomer.configCode + '&locationCode='+ globals.theLocation.locationID, '_self');

    }

};

configure.configure();