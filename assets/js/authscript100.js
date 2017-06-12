/**
 * Created by bgager on 5/19/17.
 */
/*this is the secret js file that's added after the user has authenticated*/


var configure = {

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
        var scripts = ['pages/dashboard.js','pages/adminUsers.js','assets/js/AWSsesConnector.js'];
        scripts.forEach(function(script) {
            $.getScript(script, function () {
                if (++progress == scripts.length) configure.determinePage();
            });
        });

    },

    //******************************************************************************************************************
    determinePage:function () {


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