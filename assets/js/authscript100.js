/**
 * Created by bgager on 5/19/17.
 */
/*this is the secret js file that's added after the user has authenticated*/


var configure = {

    retryCount: 0,

    configure: function () {

        //show the other header content (which includes the mobile menu icon)
        $('#otherHeaderContent').show();

        //build the menu's
        $('#loading-iqueue-progress-bar').html("Building Menu's");
        configure.buildMenus();
        $('#loading-iqueue-progress-bar').addClass('w-50');

        //need to cycle jPanelMenu to rebuild the side panel menu for smaller screens
        jPM.off();
        jPM.on();


        $('#loading-iqueue-progress-bar').html('Loading scripts');

        var progress = 0;
        var scripts = ['assets/js/AWSDynamoDBConnector.js'];
        scripts.forEach(function(script) {
            $.getScript(script, function () {
                if (++progress == scripts.length) configure.loadCustomerConfig();
            });
        });

    },

    //******************************************************************************************************************
    loadCustomerConfig:function () {

        $('#loading-iqueue-progress-bar').addClass('w-60');
        $('#loading-iqueue-progress-bar').html("Fetching Customer Configuration");

        awsDynamoDBConnector.fetchCustomerConfig(awsCognitoConnector.cognitoUser.customerID, function (success, data) {
            if (success) {
                globals.theCustomer = data;
                configure.loadMoreScripts();
            }
            else {
                var options = {};
                options.title = 'DOH: The Cloud is a little stormy today.';
                options.message = "We're sorry, but there was a fatal error while trying to reach our server in The Cloud.<br><br>Error Code: lcg001<br>Error: "+ data ;
                options.size = 'large';
                options.buttonName = 'Start Over';
                options.callback = function () {
                    window.open("http://iqueue.cloud", '_self');
                };
                modalMessage.showMessage(options);
            }
        })
    },

    //******************************************************************************************************************
    loadMoreScripts: function () {

        $('#loading-iqueue-progress-bar').html('Loading more scripts');
        $('#loading-iqueue-progress-bar').addClass('w-70');

        var progress = 0;
        var scripts = ['pages/dashboard.js','pages/adminUsers.js','assets/js/AWSsesConnector.js', 'pages/userDetails.js'];
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
            if (configure.retryCount < 3){
                configure.retryCount ++;
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

        //if their status is still Invited, then it's the first time they have sucesfully signed in
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
                $('#loading-iqueue-progress-bar').html('Initialization Complete');
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

        $('#loading-iqueue-progress-bar').html('Initialization Complete');
        $('#loading-iqueue-progress-bar').addClass('w-100');
        $('#loading-iqueue-progress').fadeOut(2000);

        setTimeout(function () {
            dashboardPage.render();
        },2000)

    },

    //******************************************************************************************************************
    buildMenus:function () {

        $('#mainNavbar').show();

        //build the More menu

        //TODO: only add an Admin Menu if the user is an Admin or greater
        console.log('TODO: only add an Admin Menu if the user is an Admin or greater');

        var moreMenuHTML = '' +
            '<a href="#" class="dropdown-item" onclick="adminUsers.render();"><i class="fa fa-users dropdown-icon" aria-hidden="true"></i> Manage Users</a>' +
            '<a href="#" class="dropdown-item" onclick="alert()"><i class="fa fa-users dropdown-icon" aria-hidden="true"></i> What&#39;s New</a>' ;

        $('#moreMenu').html(moreMenuHTML);


        //build the user menu

        $('#userMenuHeader').html(awsCognitoConnector.cognitoUser.username);

        var userMenuHTML = '' +
            '<a href="#" class="dropdown-item" onclick="alert()"><i class="fa fa-user dropdown-icon" aria-hidden="true"></i> Sign Out</a>' ;

        $('#userMenu').html(userMenuHTML);

    }






};


configure.configure();